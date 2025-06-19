import os
import datetime
from bson import ObjectId
from flask import Flask, request, jsonify
from pymongo import MongoClient
import bcrypt 
from flask_cors import CORS  # <-- Importar CORS

# Configuración de Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'

# Habilitar CORS para permitir peticiones desde cualquier origen (ideal para desarrollo)
CORS(app)

BASE_IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['IMAGE_FOLDER'] = BASE_IMAGE_FOLDER
BASE_URL = "http://127.0.0.1:5000"

# Conexión a MongoDB local
client = MongoClient('mongodb://localhost:27017/')
db = client['restaurante']
users_collection = db['usuarios']
platos_collection = db['platos']
pedidos_collection = db['pedidos']   


# Ruta para registrar usuarios
@app.route('/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No se recibieron datos JSON'}), 400

        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        direccion = data.get('direccion')  # Nuevo campo

        if not all([username, email, phone, password, direccion]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400

        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'El correo ya está registrado'}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user = {
            'username': username,
            'email': email,
            'phone': phone,
            'password': hashed_password,
            'direccion': direccion,
            'points': 250,  # Puntos iniciales al registrarse
            'member_since': datetime.datetime.utcnow()  # Opcional, para el perfil
        }

        result = users_collection.insert_one(user)

        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        print("Error en /register:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/pedidos', methods=['POST'])
def crear_pedido():
    try:
        data = request.get_json()
        
        usuario_id = data.get('usuario_id')
        platos = data.get('platos')  # Lista de dicts: [{'plato_id': '...', 'cantidad': X}, ...]

        if not usuario_id or not platos:
            return jsonify({'error': 'usuario_id y platos son requeridos'}), 400

        # Verificar que el usuario existe
        usuario = users_collection.find_one({'_id': ObjectId(usuario_id)})
        if not usuario:
            return jsonify({'error': 'Usuario no válido'}), 404

        # Bloqueo de 5 minutos desde el último pedido
        ultimo_pedido = pedidos_collection.find_one(
            {'usuario_id': ObjectId(usuario_id)},
            sort=[('fecha', -1)]
        )
        if ultimo_pedido:
            ahora = datetime.datetime.utcnow()
            diferencia = ahora - ultimo_pedido['fecha']
            if diferencia.total_seconds() < 300:
                minutos_restantes = int((300 - diferencia.total_seconds()) // 60) + 1
                return jsonify({
                    'error': f'Debe esperar {minutos_restantes} minutos antes de hacer otro pedido'
                }), 429

        # Calcular total del pedido
        total = 0
        for item in platos:
            plato = platos_collection.find_one({'_id': ObjectId(item['plato_id'])})
            if not plato:
                return jsonify({'error': f"Plato con ID {item['plato_id']} no encontrado"}), 404
            total += plato['precio'] * item['cantidad']

        # Insertar pedido
        pedido = {
            'usuario_id': ObjectId(usuario_id),
            'platos': [{'plato_id': ObjectId(p['plato_id']), 'cantidad': p['cantidad']} for p in platos],
            'fecha': datetime.datetime.utcnow(),
            'total': total,
            'estado': 'En preparación'
        }
        pedidos_collection.insert_one(pedido)

        # Calcular y sumar puntos: 15 puntos cada 3 euros
        puntos_obtenidos = (int(total) // 3) * 15
        users_collection.update_one(
            {'_id': ObjectId(usuario_id)},
            {'$inc': {'points': puntos_obtenidos}}
        )

        return jsonify({
            'message': 'Pedido creado correctamente',
            'total': total,
            'puntos_ganados': puntos_obtenidos
        }), 201

    except Exception as e:
        print("Error al crear pedido:", e)
        return jsonify({'error': str(e)}), 500



@app.route('/pedidos/<usuario_id>', methods=['GET'])
def obtener_pedidos_usuario(usuario_id):
    try:
        pedidos = list(pedidos_collection.find({'usuario_id': ObjectId(usuario_id)}))
        resultado = []
        for pedido in pedidos:
            platos_info = []
            for item in pedido['platos']:
                plato = platos_collection.find_one({'_id': item['plato_id']})
                if plato:
                    platos_info.append({
                        'nombre': plato.get('nombre'),
                        'cantidad': item['cantidad'],
                        'precio_unitario': plato.get('precio'),
                        'subtotal': plato.get('precio') * item['cantidad']
                    })

            resultado.append({
                'pedido_id': str(pedido['_id']),
                'fecha': pedido['fecha'].strftime('%Y-%m-%d %H:%M'),
                'estado': pedido['estado'],
                'total': pedido['total'],
                'platos': platos_info
            })

        return jsonify(resultado), 200

    except Exception as e:
        print("Error al obtener pedidos del usuario:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Correo y contraseña son requeridos'}), 400

        user = users_collection.find_one({'email': email})

        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        # Comparar contraseñas
        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({
                'message': 'Inicio de sesión exitoso',
                'user_id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'phone': user.get('phone'),
                'direccion': user.get('direccion'),
                'points': user.get('points'),
            }), 200
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401

    except Exception as e:
        print("Error en /login:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/platos', methods=['GET'])
def obtener_platos():
    try:
        platos = list(db['platos'].find())
        resultado = []
        for plato in platos: 
            resultado.append({
                '_id': str(plato['_id']),  # 👈 Agregado
                'nombre': plato.get('nombre'),
                'descripcion': plato.get('descripcion'),
                'categoria': plato.get('categoria'),
                'precio': plato.get('precio')
            })

        return jsonify(resultado), 200 

    except Exception as e:
        print("Error al obtener los platos:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/usuarios', methods=['GET'])
def obtener_todos_los_usuarios():
    try:
        usuarios = list(users_collection.find({}, {'password': 0}))  # No mostrar contraseñas
        resultado = []
        for u in usuarios:
            resultado.append({
                'id': str(u['_id']),
                'username': u.get('username'),
                'email': u.get('email'),
                'phone': u.get('phone'),
                'direccion': u.get('direccion'),
                'points': u.get('points'),
                'member_since': u.get('member_since').strftime('%Y-%m-%d') if u.get('member_since') else None
            })
        return jsonify(resultado), 200

    except Exception as e:
        print("Error al obtener todos los usuarios:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/usuarios/<usuario_id>', methods=['GET'])
def obtener_usuario_por_id(usuario_id):
    try:
        usuario = users_collection.find_one({'_id': ObjectId(usuario_id)}, {'password': 0})  # ❌ Excluimos contraseña
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404

        resultado = {
            'id': str(usuario['_id']),
            'username': usuario.get('username'),
            'email': usuario.get('email'),
            'phone': usuario.get('phone'),
            'direccion': usuario.get('direccion'),
            'points': usuario.get('points'),
            'member_since': usuario.get('member_since').strftime('%Y-%m-%d') if usuario.get('member_since') else None
        }
        return jsonify(resultado), 200

    except Exception as e:
        print("Error al obtener usuario:", e)
        return jsonify({'error': str(e)}), 500


# Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)
