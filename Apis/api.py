import os
import datetime
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

        if not all([username, email, phone, password]):
            return jsonify({'error': 'Faltan datos requeridos'}), 400

        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'El correo ya está registrado'}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user = {
            'username': username,
            'email': email,
            'phone': phone,
            'password': hashed_password
        }

        result = users_collection.insert_one(user)

        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        # Para mostrar error real en consola y en respuesta JSON
        print("Error en /register:", e)
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
                'email': user['email']
            }), 200
        else:
            return jsonify({'error': 'Contraseña incorrecta'}), 401

    except Exception as e:
        print("Error en /login:", e)
        return jsonify({'error': str(e)}), 500


# Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)
