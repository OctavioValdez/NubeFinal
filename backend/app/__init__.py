from flask import Flask
from routes import bp
from flask_cors import CORS
import boto3
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['AWS_REGION'] = os.getenv('AWS_REGION')
    app.config['AWS_ACCESS_KEY_ID'] = os.getenv('AWS_ACCESS_KEY_ID')
    app.config['AWS_SECRET_ACCESS_KEY'] = os.getenv('AWS_SECRET_ACCESS_KEY')
    app.config['MUEBLES_TABLE'] = os.getenv('MUEBLES_TABLE')
    app.config['CLIENTES_TABLE'] = os.getenv('CLIENTES_TABLE')
    app.config['BUCKET_NAME'] = os.getenv('BUCKET_NAME')

    app.register_blueprint(bp)

    return app


# Punto de entrada
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
