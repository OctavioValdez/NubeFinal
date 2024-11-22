import boto3
import os
from botocore.exceptions import ClientError

dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

MUEBLES_TABLE = os.getenv('MUEBLES_TABLE', 'Muebles')
CLIENTES_TABLE = os.getenv('CLIENTES_TABLE', 'Clientes')
BUCKET_NAME = os.getenv('BUCKET_NAME')


class Mueble:
    table = dynamodb.Table(MUEBLES_TABLE)

    @staticmethod
    def upload_to_s3(file, BUCKET_NAME, object_name=None):
        s3_client = boto3.client('s3')
        if object_name is None:
            object_name = file.filename

        try:
            s3_client.upload_fileobj(file, BUCKET_NAME, object_name)
            return {"success": True, "message": "File uploaded successfully", "file_url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_name}"}
        except NoCredentialsError:
            return {"success": False, "message": "Credentials not available"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def create(data):
        try:
            Mueble.table.put_item(Item=data)
            return {"success": True, "message": "Mueble creado exitosamente", "data": data}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def get_all():
        try:
            response = Mueble.table.scan()
            return {"success": True, "data": response.get('Items', [])}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def update(mueble_id, updates):
        try:
            update_expression = "SET " + ", ".join([f"{k}=:{k}" for k in updates.keys()])
            expression_values = {f":{k}": v for k, v in updates.items()}
            Mueble.table.update_item(
                Key={"id": mueble_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return {"success": True, "message": "Mueble actualizado exitosamente"}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def delete(mueble_id):
        try:
            Mueble.table.delete_item(Key={"id": mueble_id})
            return {"success": True, "message": "Mueble eliminado exitosamente"}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}


class Cliente:
    table = dynamodb.Table(CLIENTES_TABLE)

    @staticmethod
    def create(data):
        try:
            Cliente.table.put_item(Item=data)
            return {"success": True, "message": "Cliente creado exitosamente", "data": data}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def get_all():
        try:
            response = Cliente.table.scan()
            return {"success": True, "data": response.get('Items', [])}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def update(cliente_id, updates):
        try:
            update_expression = "SET " + ", ".join([f"{k}=:{k}" for k in updates.keys()])
            expression_values = {f":{k}": v for k, v in updates.items()}
            Cliente.table.update_item(
                Key={"id": cliente_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return {"success": True, "message": "Cliente actualizado exitosamente"}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}

    @staticmethod
    def delete(cliente_id):
        try:
            Cliente.table.delete_item(Key={"id": cliente_id})
            return {"success": True, "message": "Cliente eliminado exitosamente"}
        except ClientError as e:
            return {"success": False, "message": e.response['Error']['Message']}
