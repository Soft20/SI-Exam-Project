from flask import jsonify, request
from bson.objectid import ObjectId
from db_connect import database

warehouses = database["warehouses"]


def delete_warehouse(id):
    try:
        warehouses.delete_one({"_id": ObjectId(id)})
        return jsonify({'message': 'warehouse deleted successfully'}), 200
    except:
        return 'Warehouse not found', 404


def update_warehouse(id):
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


def get_warehouse(id):
    try:
        warehouse = warehouses.find_one({"_id": ObjectId(id)})
        warehouse['_id'] = str(warehouse['_id'])

        for index, product in enumerate(warehouse['products']):
            warehouse['products'][index]['id'] = str(product['id'])

        return jsonify(warehouse), 200
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


def get_all_warehouses():
    try:
        warehouse_list = warehouses.find({}, {'products': 0})

        warehouse_items = []

        for item in warehouse_list:
            item['_id'] = str(item['_id'])
            warehouse_items.append(item)

        return jsonify(warehouse_items), 200

    except:
        return 'Warehouses not found', 404
