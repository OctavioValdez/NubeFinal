from flask import Blueprint, request, jsonify
from models import Mueble, Cliente
from utils import response_success, response_error, allowed_file
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

s3_name = os.getenv('BUCKET_NAME')

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    return '<h1>Hola mundo</h1>'

@bp.route('/muebles', methods=['POST'])
def create_mueble():
    try:
        data = request.form.to_dict()
        if 'foto' not in request.files:
            return response_error("No file part")
        file = request.files['foto']
        if file.filename == '':
            return response_error("No selected file")
        if file and allowed_file(file.filename):
            upload_result = Mueble.upload_to_s3(file, s3_name)
            if not upload_result['success']:
                return response_error(upload_result['message'])
            data['image_url'] = upload_result['file_url']
        else:
            return response_error("File type not allowed")

        data['id'] = str(uuid.uuid4())
        result = Mueble.create(data)
        if result['success']:
            return response_success(data, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))

@bp.route('/muebles', methods=['GET'])
def get_muebles():
    try:
        result = Mueble.get_all()
        if result['success']:
            return response_success(result['data'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))

@bp.route('/muebles/<string:mueble_id>', methods=['PUT'])
@bp.route('/muebles/<string:mueble_id>', methods=['PUT'])
def update_mueble(mueble_id):
    try:
        updates = request.form.to_dict()
        valid_fields = ["nombre", "descripcion", "precio", "stock"]
        filtered_updates = {k: v for k, v in updates.items() if k in valid_fields and v is not None}

        if not filtered_updates:
            return response_error("No valid fields provided to update.")

        result = Mueble.update(mueble_id, filtered_updates)
        if result['success']:
            return response_success(None, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))

@bp.route('/muebles/<string:mueble_id>', methods=['DELETE'])
def delete_mueble(mueble_id):
    try:
        result = Mueble.delete(mueble_id)
        if result['success']:
            return response_success(None, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))

@bp.route('/clientes', methods=['POST'])
def create_cliente():
    try:
        data = request.json
        data['id'] = str(uuid.uuid4())
        result = Cliente.create(data)
        if result['success']:
            return response_success(data, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))


@bp.route('/clientes', methods=['GET'])
def get_clientes():
    try:
        result = Cliente.get_all()
        if result['success']:
            return response_success(result['data'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))


@bp.route('/clientes/<string:cliente_id>', methods=['PUT'])
def update_cliente(cliente_id):
    try:
        updates = request.json
        valid_fields = ["nombre", "direccion", "email", "telefono1", "telefono2", "notas"]
        filtered_updates = {k: v for k, v in updates.items() if k in valid_fields and v is not None}
        
        if not filtered_updates:
            return response_error("No valid fields provided to update.")
        
        result = Cliente.update(cliente_id, filtered_updates)
        if result['success']:
            return response_success(None, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))


@bp.route('/clientes/<string:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    try:
        result = Cliente.delete(cliente_id)
        if result['success']:
            return response_success(None, result['message'])
        return response_error(result['message'])
    except Exception as e:
        return response_error(str(e))
