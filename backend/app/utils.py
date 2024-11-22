from flask import jsonify

def response_success(data, message="Operación exitosa"):
    return jsonify({"success": True, "message": message, "data": data}), 200

def response_error(message="Error en la operación", status_code=400):
    return jsonify({"success": False, "message": message}), status_code

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS