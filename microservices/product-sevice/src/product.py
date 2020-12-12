from flask import jsonify, request
from bson.objectid import ObjectId
from db_connect import database, mongo_client

products = database["products"]
warehouses = database["warehouses"]


def handle_product(id):
    if request.method == 'GET':
        try:
            product = products.find_one({"_id": ObjectId(id)})
            product['_id'] = str(product['_id'])
            return jsonify(product), 200
        except:
            return 'Product not found', 404

    if request.method == 'PUT':

        product = {}

        if 'name' in request.json.keys():
            product['name'] = request.json['name']

        if 'price' in request.json.keys():
            product['price'] = request.json['price']

        if 'weight' in request.json.keys():
            product['weight'] = request.json['weight']

        if len(product.keys()) == 0:
            return 'Invalid arguments', 400

        try:
            products.update_one({"_id": ObjectId(id)}, {"$set": product})
            return jsonify({'message': 'product updated successfully'}), 200
        except:
            return 'Product not found', 404

    if request.method == 'DELETE':
        try:
            products.delete_one({"_id": ObjectId(id)})
            return jsonify({'message': 'product deleted successfully'}), 200
        except:
            return 'Product not found', 404


def add_product():
    try:
        warehouse_id = request.json['warehouse_id']
        name = request.json['name']
        price = request.json['price']
        amount = request.json['amount']
        weight = request.json['weight']
    except:
        return 'name, price, amount, weight and warehouse_id fields are required', 400

    try:
        warehouses.find_one({"_id": ObjectId(warehouse_id)})
    except:
        return 'Warehouse not found', 404

    try:
        product = products.insert_one({'name': name, 'price': price, 'weight': weight})
        warehouses.update({"_id": ObjectId(warehouse_id)}, {'$push': {'products': {'id': product.inserted_id, 'amount': amount}}})

        return f'Product created successfully with id: {product.inserted_id}', 201
    except:
        return 'Product not found', 404
