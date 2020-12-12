from flask import jsonify, request
from bson.objectid import ObjectId
from db_connect import database

warehouses = database["warehouses"]


def handle_warehouse(id):
    if request.method == 'GET':
        try:
            product = warehouses.find_one({"_id": ObjectId(id)})
            product['_id'] = str(product['_id'])
            return jsonify(product), 200
        except:
            return 'Product not found', 404

    if request.method == 'PUT':

        warehouse = {}

        if 'name' in request.json.keys():
            warehouse['name'] = request.json['name']

        if 'location' in request.json.keys():
            warehouse['location'] = request.json['location']

        if 'remote' in request.json.keys():
            warehouse['remote'] = request.json['remote']

        if len(warehouse.keys()) == 0:
            return 'Invalid arguments', 400

        try:
            warehouses.update_one({"_id": ObjectId(id)}, {"$set": warehouse})
            return jsonify({'message': 'warehouse updated successfully'}), 200
        except:
            return 'Warehouse not found', 404

    if request.method == 'DELETE':
        try:
            warehouses.delete_one({"_id": ObjectId(id)})
            return jsonify({'message': 'warehouse deleted successfully'}), 200
        except:
            return 'Warehouse not found', 404


def add_warehouse():
    try:
        name = request.json['name']
        location = request.json['location']
        remote = request.json['remote']
    except:
        return 'name, location and remote fields are required', 400

    try:
        warehouse = warehouses.insert_one({'name': name, 'location': location, 'remote': remote, 'products': []})
        return f'Warehouse created successfully with id: {warehouse.inserted_id}', 201
    except:
        return 'Warehouse not found', 404
