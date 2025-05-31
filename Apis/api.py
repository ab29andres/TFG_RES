import os
import datetime
import base64
from flask import Flask, request, jsonify
from pymongo import MongoClient
import jwt
from functools import wraps
import bcrypt
from bson import ObjectId
from werkzeug.utils import secure_filename
from typing import Any, Dict


app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'

BASE_IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
app.config['IMAGE_FOLDER'] = BASE_IMAGE_FOLDER
BASE_URL = "http://127.0.0.1:5000"