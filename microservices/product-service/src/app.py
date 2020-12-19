# libraries
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os

# components
import eureka
from product import get_product, update_product, add_product, delete_product, get_all_products, get_products_in_warehouse, get_product_from_warehouse
from warehouse import get_warehouse, update_warehouse, add_warehouse, delete_warehouse, get_all_warehouses
from order import get_order, update_order, place_order, delete_order, get_all_orders

load_dotenv(verbose=True)

app = Flask(__name__)
PORT = os.getenv("PORT")

eureka.start()


@app.route('/')
def index_route():
    return jsonify({"warehouse": "/warehouse", "product": "/warehouse"})


@app.route('/product', methods=['GET', 'PUT', 'POST', 'DELETE'])
def product_handler():
    id = request.args.get('id')

    if request.method == 'GET':

        if all(elem in ['warehouse_id', 'product_id'] for elem in request.args.keys()):
            product_id = request.args.get('product_id')
            warehouse_id = request.args.get('warehouse_id')
            return get_product_from_warehouse(product_id, warehouse_id)

        elif all(elem in ['warehouse_id'] for elem in request.args.keys()):
            warehouse_id = request.args.get('warehouse_id')
            return get_products_in_warehouse(warehouse_id)

        else:
            return get_product(id)

    if request.method == 'PUT':
        return update_product(id)

    if request.method == 'POST':
        return add_product()

    if request.method == 'DELETE':
        return delete_product(id)


@app.route('/product/all', methods=['GET'])
def all_products_handler():
    return get_all_products()


@app.route('/warehouse', methods=['GET', 'PUT', 'POST', 'DELETE'])
def warehouse_handler():
    id = request.args.get('id')

    if request.method == 'GET':
        return get_warehouse(id)

    if request.method == 'PUT':
        return update_warehouse(id)

    if request.method == 'POST':
        return add_warehouse()

    if request.method == 'DELETE':
        return delete_warehouse(id)


@app.route('/warehouse/all', methods=['GET'])
def all_warehouses_handler():
    return get_all_warehouses()


@app.route('/order', methods=['GET', 'PUT', 'POST', 'DELETE'])
def order_handler():
    id = request.args.get('id')

    if request.method == 'GET':
        return get_order(id)

    if request.method == 'PUT':
        return update_order(id)

    if request.method == 'POST':
        return place_order()

    if request.method == 'DELETE':
        return delete_order(id)


@app.route('/order/all', methods=['GET'])
def all_orders_handler():
    return get_all_orders()


if __name__ == '__main__':
    app.run(port=PORT)
