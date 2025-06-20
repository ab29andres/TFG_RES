import os
import datetime
import random
import string
import smtplib
import yagmail
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
from bson import ObjectId
from flask import Flask, request, jsonify
from pymongo import MongoClient
import bcrypt
from flask_cors import CORS
remitente = os.getenv('EMAIL_USER')
contraseña = os.getenv('EMAIL_PASS')

# Configuración de Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'
CORS(app)

# Configuración de carpetas
BASE_IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['IMAGE_FOLDER'] = BASE_IMAGE_FOLDER
BASE_URL = "http://127.0.0.1:5000"

# Conexión a MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['restaurante']
users_collection = db['usuarios']
platos_collection = db['platos']
pedidos_collection = db['pedidos']

# Registro de usuario
@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        campos = ['username', 'email', 'phone', 'password', 'direccion']
        if not all(data.get(c) for c in campos):
            return jsonify({'error': 'Faltan datos requeridos'}), 400

        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'El correo ya está registrado'}), 409

        data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        data['points'] = 250
        data['member_since'] = datetime.datetime.utcnow()

        result = users_collection.insert_one(data)
        return jsonify({'message': 'Usuario registrado exitosamente', 'user_id': str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Inicio de sesión
@app.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        user = users_collection.find_one({'email': data.get('email')})
        if not user or not bcrypt.checkpw(data.get('password').encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': 'Credenciales inválidas'}), 401

        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user_id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'phone': user.get('phone'),
            'direccion': user.get('direccion'),
            'points': user.get('points')
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Crear pedido
@app.route('/pedidos', methods=['POST'])
def crear_pedido():
    try:
        data = request.get_json()
        usuario_id = data.get('usuario_id')
        platos = data.get('platos')

        if not usuario_id or not platos:
            return jsonify({'error': 'usuario_id y platos son requeridos'}), 400

        usuario = users_collection.find_one({'_id': ObjectId(usuario_id)})
        if not usuario:
            return jsonify({'error': 'Usuario no válido'}), 404

        ultimo = pedidos_collection.find_one({'usuario_id': ObjectId(usuario_id)}, sort=[('fecha', -1)])
        if ultimo and (datetime.datetime.utcnow() - ultimo['fecha']).total_seconds() < 300:
            restante = int((300 - (datetime.datetime.utcnow() - ultimo['fecha']).total_seconds()) // 60) + 1
            return jsonify({'error': f'Debe esperar {restante} minutos antes de hacer otro pedido'}), 429

        total = 0
        detalle = []
        for item in platos:
            plato = platos_collection.find_one({'_id': ObjectId(item['plato_id'])})
            if not plato:
                return jsonify({'error': f"Plato con ID {item['plato_id']} no encontrado"}), 404
            subtotal = plato['precio'] * item['cantidad']
            detalle.append({'plato_id': ObjectId(item['plato_id']), 'cantidad': item['cantidad']})
            total += subtotal

        pedido = {
            'usuario_id': ObjectId(usuario_id),
            'platos': detalle,
            'fecha': datetime.datetime.utcnow(),
            'total': total,
            'estado': 'En preparación'
        }
        pedidos_collection.insert_one(pedido)

        puntos = (int(total) // 3) * 15
        users_collection.update_one({'_id': ObjectId(usuario_id)}, {'$inc': {'points': puntos}})

        return jsonify({'message': 'Pedido creado correctamente', 'total': total, 'puntos_ganados': puntos}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Obtener pedidos por usuario
@app.route('/pedidos/<usuario_id>', methods=['GET'])
def obtener_pedidos_usuario(usuario_id):
    try:
        pedidos = list(pedidos_collection.find({'usuario_id': ObjectId(usuario_id)}))
        resultado = []
        for p in pedidos:
            platos_info = []
            for item in p['platos']:
                plato = platos_collection.find_one({'_id': item['plato_id']})
                if plato:
                    platos_info.append({
                        'nombre': plato['nombre'],
                        'cantidad': item['cantidad'],
                        'precio_unitario': plato['precio'],
                        'subtotal': plato['precio'] * item['cantidad']
                    })
            resultado.append({
                'pedido_id': str(p['_id']),
                'fecha': p['fecha'].strftime('%Y-%m-%d %H:%M'),
                'estado': p['estado'],
                'total': p['total'],
                'platos': platos_info
            })
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Eliminar pedidos por usuario
@app.route('/pedidos/<usuario_id>', methods=['DELETE'])
def eliminar_pedidos_usuario(usuario_id):
    try:
        result = pedidos_collection.delete_many({'usuario_id': ObjectId(usuario_id)})
        return jsonify({'message': f'{result.deleted_count} pedidos eliminados'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Obtener platos
@app.route('/platos', methods=['GET'])
def obtener_platos():
    try:
        platos = list(platos_collection.find())
        return jsonify([{
            '_id': str(p['_id']),
            'nombre': p['nombre'],
            'descripcion': p.get('descripcion'),
            'categoria': p.get('categoria'),
            'precio': p['precio']
        } for p in platos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Obtener todos los usuarios
@app.route('/usuarios', methods=['GET'])
def obtener_todos_los_usuarios():
    try:
        usuarios = list(users_collection.find({}, {'password': 0}))
        return jsonify([{
            'id': str(u['_id']),
            'username': u.get('username'),
            'email': u.get('email'),
            'phone': u.get('phone'),
            'direccion': u.get('direccion'),
            'points': u.get('points'),
            'member_since': u.get('member_since').strftime('%Y-%m-%d') if u.get('member_since') else None
        } for u in usuarios]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def enviar_correo(destinatario, nueva_password):
    remitente = 'tucorreo@gmail.com'
    contraseña = 'tu_contrasena_de_aplicación'

    try:
        yag = yagmail.SMTP(remitente, contraseña)
        asunto = 'Password recovery'
        cuerpo = f"""Hello,

Your new password is: {nueva_password}

Please log in and change it as soon as possible.

Thank you."""
        
        # Enviar con yagmail: debería manejar UTF-8 sin problemas
        yag.send(to=destinatario, subject=asunto, contents=cuerpo)
        print("Correo enviado con éxito.")
    except Exception as e:
        print(f"Error al enviar el correo: {e}")


## Recuperar contraseña
@app.route('/recuperar-password', methods=['POST'])
def recuperar_password():
    try:
        data = request.get_json()
        email = data.get('email')
        if not email:
            return jsonify({'message': 'Se requiere un correo'}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Correo no registrado'}), 404

        nueva = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        # Aquí imprimes la contraseña nueva en consola
        print(f"Nueva contraseña generada para {email}: {nueva}")

        hashed = bcrypt.hashpw(nueva.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        users_collection.update_one({'_id': user['_id']}, {'$set': {'password': hashed}})

        # Enviar correo real
        enviar_correo(email, nueva)

        return jsonify({'message': 'Correo enviado con éxito'}), 200
    except Exception as e:
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500


reservas_collection = db['reservas']
@app.route('/reservas', methods=['POST'])
def crear_reserva():
    try:
        data = request.get_json()
        fecha_str = data.get('fecha')
        personas = data.get('personas')
        tipo_mesa = data.get('tipo_mesa')

        if not fecha_str or not personas:
            return jsonify({'error': 'fecha y personas son requeridos'}), 400

        try:
            fecha = datetime.datetime.fromisoformat(fecha_str)
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido, debe ser ISO 8601'}), 400

        if fecha < datetime.datetime.utcnow():
            return jsonify({'error': 'La fecha debe ser futura'}), 400

        # Validar que no haya más de 10 reservas en esa hora (opcional)
        inicio_hora = fecha.replace(minute=0, second=0, microsecond=0)
        fin_hora = inicio_hora + datetime.timedelta(hours=1)
        conteo = reservas_collection.count_documents({
            'fecha': {'$gte': inicio_hora, '$lt': fin_hora},
            'estado': {'$ne': 'cancelada'}
        })

        if conteo >= 10:
            return jsonify({'error': 'No hay disponibilidad en esa hora'}), 409

        reserva = {
            'fecha': fecha,
            'personas': personas,
            'tipo_mesa': tipo_mesa,
            'estado': 'pendiente',
            'created_at': datetime.datetime.utcnow()
        }

        result = reservas_collection.insert_one(reserva)

        return jsonify({'message': 'Reserva creada', 'reserva_id': str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Actualizar datos del usuario
@app.route('/usuarios/<usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    try:
        data = request.get_json()
        campos_actualizables = ['email', 'phone', 'direccion', 'password']
        actualizacion = {}

        for campo in campos_actualizables:
            if campo in data and data[campo]:
                if campo == 'password':
                    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    actualizacion['password'] = hashed
                else:
                    actualizacion[campo] = data[campo]

        if not actualizacion:
            return jsonify({'error': 'No se proporcionaron campos válidos para actualizar'}), 400

        result = users_collection.update_one(
            {'_id': ObjectId(usuario_id)},
            {'$set': actualizacion}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        return jsonify({'message': 'Usuario actualizado correctamente'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios/restar-puntos', methods=['PUT'])
def restar_puntos_usuario():
    try:
        data = request.get_json()
        email = data.get('email')
        puntos_a_restar = data.get('puntosARestar')

        if not email or puntos_a_restar is None:
            return jsonify({'error': 'Se requiere email y puntosARestar'}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        puntos_actuales = user.get('points', 0)
        if puntos_actuales < puntos_a_restar:
            return jsonify({'error': 'No tienes suficientes puntos'}), 400

        nuevo_total = puntos_actuales - puntos_a_restar
        users_collection.update_one({'_id': user['_id']}, {'$set': {'points': nuevo_total}})

        return jsonify({'message': 'Puntos actualizados correctamente', 'nuevos_puntos': nuevo_total}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__':
    app.run(debug=True)
