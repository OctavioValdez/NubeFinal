from flask import Blueprint, request, jsonify
from models import Mueble, Cliente
from utils import response_success, response_error, allowed_file
from dotenv import load_dotenv
import subprocess
import os
import uuid
import boto3

load_dotenv()

s3_name = os.getenv('BUCKET_NAME')
sns_client = boto3.client(
    'sns',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

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
def update_mueble(mueble_id):
    try:
        updates = request.form.to_dict()
        valid_fields = ["nombre", "descripcion", "precio", "stock"]
        filtered_updates = {k: v for k, v in updates.items() if k in valid_fields and v is not None}

        if 'foto' in request.files:
            file = request.files['foto']
            if file.filename == '':
                return response_error("No se seleccionó un archivo válido.")
            if allowed_file(file.filename):
                upload_result = Mueble.upload_to_s3(file, s3_name)
                if not upload_result['success']:
                    return response_error(upload_result['message'])
                filtered_updates['image_url'] = upload_result['file_url']
            else:
                return response_error("Tipo de archivo no permitido.")

        if not filtered_updates:
            return response_error("No hay campos válidos para actualizar.")

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
    

@bp.route('/send-quotation', methods=['POST'])
def send_quotation():
    try:
        data = request.json
        client_id = data['clientId']
        furniture = data['furniture']

        # Obtener detalles del cliente (mock o consulta)
        client_details = Cliente.table.get_item(Key={'id': client_id})['Item']

        json_data = {
            "nombre_cliente": client_details['nombre'],
            "telefono_1": client_details['telefono1'],
            "telefono_2": client_details.get('telefono2', ''),
            "domicilio": client_details['direccion'],
            "fecha_entrega": data['deliveryDate'],
            "hora_entrega": data['deliveryTime'],
            "flete_importe": float(data['freightCost']),
            "anticipo": float(data['advance']),
            "garantia": float(data['warranty']),
            "products": [
                {"cantidad": m['quantity'], "producto": m['nombre'], "precio": m['precio']}
                for m in furniture
            ],
        }
        pdf_path = './cotizacion.pdf'
        template_path = './app/template2.html'

        # Llama al script de Node.js
        subprocess.run(
            [
                "node", "./app/generatePDF2.js",
                template_path, pdf_path, json.dumps(json_data)
            ],
            check=True
        )

        # Subir a S3
        with open(pdf_path, 'rb') as pdf_file:
            s3_client.upload_fileobj(pdf_file, os.getenv('BUCKET_NAME'), 'cotizacion.pdf')

        # Enviar con SNS
        pdf_url = f"https://{os.getenv('BUCKET_NAME')}.s3.amazonaws.com/cotizacion.pdf"
        message = f"Hola {client_details['nombre']},\n\nAdjuntamos la cotización:\n{pdf_url}"
        sns_client.publish(
            TopicArn=os.getenv('SNS_TOPIC_ARN'),
            Message=message,
            Subject="Cotización Casa Diana"
        )

        return jsonify({"success": True, "message": "Cotización enviada exitosamente."})
    except subprocess.CalledProcessError as e:
        return jsonify({"success": False, "message": f"Error al generar el PDF: {str(e)}"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
