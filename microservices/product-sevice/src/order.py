from flask import jsonify, request
from bson.objectid import ObjectId
from db_connect import database, mongo_client

products = database["products"]
warehouses = database["warehouses"]
orders = database["orders"]


def get_all_orders():
    orders_list = orders.find()

    order_items = []

    for item in orders_list:
        item['_id'] = str(item['_id'])
        order_items.append(item)

    return jsonify(order_items), 200


def get_order(id):
    try:
        order = orders.find_one({"_id": ObjectId(id)})
        order['_id'] = str(order['_id'])

        return jsonify(order), 200
    except:
        return 'Order not found', 404


def update_order(id):
    try:
        orders.update_one({"_id": ObjectId(id)}, {"$set": {'confirmed': True}})
        return jsonify({'message': 'order updated successfully'}), 200
    except:
        return 'Order not found', 404


def delete_order(id):

    try:
        order = orders.find_one({'_id': ObjectId(id)})
        if not order:
            return 'Order not found', 404
    except:
        return 'Order not found', 404

    warehouse_id = order['warehouse_id']
    amount = order['amount']
    product_id = order['product_id']

    warehouse = warehouses.find_one({'_id': ObjectId(warehouse_id)})
    result = [product for product in warehouse['products'] if product['id'] == ObjectId(product_id)]

    if len(result) < 1:
        return 'Product not found', 404

    try:
        warehouses.update_one({'_id': ObjectId(warehouse_id), "products.id": ObjectId(product_id)}, {'$set': {"products.$.amount":  result[0]['amount'] + amount}})
    except:
        return 'Warehouse not updated', 404

    try:
        orders.delete_one({"_id": ObjectId(id)})
        return jsonify({'message': 'order deleted successfully'}), 200
    except:
        return 'Order not found', 404


def place_order():

    try:
        email = request.json['email']
        product_id = request.json['product_id']
        amount = request.json['amount']
        shipping_price = request.json['shipping_price']
    except:
        return 'email, product, amount and shipping price fields are required', 400

    try:
        product = products.find_one({"_id": ObjectId(product_id)}, {'name': 0})
        if not product:
            return 'Product not found', 404

        warehouse_list = warehouses.find()

        selected_warehouse = None

        for warehouse in warehouse_list:
            result = [product for product in warehouse['products'] if str(product['id']) == product_id]

            if len(result) > 0 and result[0]['amount'] >= amount:
                selected_warehouse = warehouse['_id']
                try:
                    warehouses.update_one({'_id': selected_warehouse, "products.id": ObjectId(product_id)}, {'$set': {"products.$.amount":  result[0]['amount'] - amount}})
                    break
                except:
                    return 'Product inventory not updated', 400

        if not selected_warehouse:
            return 'Product not available', 400

    except:
        return 'Product not found', 404

    total_price = amount * product['price']
    total_weight = amount * product['weight']

    order = {'email': email, 'product_id': str(product['_id']), 'amount': amount, 'price': total_price, 'weight': total_weight,
             'confirmed': False, 'warehouse_id': str(selected_warehouse), 'shipping_price': shipping_price}

    try:
        place_order = orders.insert_one(order)
        order['_id'] = str(place_order.inserted_id)
    except:
        return 'Order not created', 400

    return jsonify(order), 201
