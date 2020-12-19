from flask import jsonify, request
from bson.objectid import ObjectId
from db_connect import database, mongo_client

products = database["products"]
warehouses = database["warehouses"]


def get_all_products():
    products_list = products.find()

    product_items = []

    for item in products_list:
        item['_id'] = str(item['_id'])
        product_items.append(item)

    return jsonify(product_items), 200


def get_product(id):
    try:
        product = products.find_one({"_id": ObjectId(id)})
        warehouse_elements = warehouses.find()

        inventory = []

        for element in warehouse_elements:
            result = [product for product in element['products'] if str(product['id']) == id]
            if len(result) > 0:
                inventory.append({'warehouse_id': str(element['_id']), 'amount': result[0]['amount'], 'name': element['name']})

        product['_id'] = str(product['_id'])
        return jsonify({'warehouses': inventory, **product}), 200
    except:
        return 'Product not found', 404


def get_product_from_warehouse(product_id, warehouse_id):
    warehouse_element = warehouses.find_one({"_id": ObjectId(warehouse_id)}, {'name': 0, 'location': 0, 'remote': 0})
    products_list = [product for product in warehouse_element['products'] if str(product['id']) == product_id]

    if len(products_list) > 0:
        amount = products_list[0]['amount']
        product = products.find_one({'_id': ObjectId(product_id)})
        product['_id'] = str(product['_id'])

        return jsonify({'amount': amount, **product}), 200
    else:
        return jsonify('The desired product was not found'), 404


def get_products_in_warehouse(warehouse_id):
    try:
        warehouse_element = warehouses.find_one({"_id": ObjectId(warehouse_id)}, {'name': 0, 'location': 0, 'remote': 0})
        product_list = products.find({"_id": {"$in": [ObjectId(element['id']) for element in warehouse_element['products']]}})

        product_items = []

        for item in product_list:
            item['_id'] = str(item['_id'])
            product_items.append(item)

        return jsonify(product_items), 200
    except:
        return 'Products from warehouse not found', 404


def update_product(id):
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


def delete_product(id):

    try:
        products.delete_one({"_id": ObjectId(id)})
        warehouse_list = warehouses.find()

        for warehouse in warehouse_list:
            warehouses.update_one({'_id': warehouse['_id'], "products.id": ObjectId(id)}, {'$set': {"products.$.amount":  0}})

        return jsonify({'message': 'product deleted successfully'}), 200
    except:
        return 'Product not found', 404


def add_product():
    try:
        warehouse_inventory = request.json['warehouse_inventory']
        name = request.json['name']
        price = request.json['price']
        weight = request.json['weight']
    except:
        return 'name, price, weight and warehouse_ids fields are required', 400

    try:
        warehouses.find({"_id": {"$in": [ObjectId(inventory['id']) for inventory in warehouse_inventory]}})
    except:
        return 'Warehouse not found', 404

    try:
        product = products.insert_one({'name': name, 'price': price, 'weight': weight})

        for inventory in warehouse_inventory:
            warehouses.update({"_id": ObjectId(inventory['id'])}, {'$push': {'products': {'id': product.inserted_id, 'amount': inventory['amount']}}})

        return f'Product created successfully with id: {product.inserted_id}', 201
    except:
        return 'Product not created', 400
