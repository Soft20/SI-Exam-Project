# libraries
from flask import Flask, jsonify
from dotenv import load_dotenv
import os

# components
# import eureka
from db_connect import mongo_client
from product import add_product, handle_product
from warehouse import add_warehouse, handle_warehouse

load_dotenv(verbose=True)

app = Flask(__name__)
PORT = os.getenv("PORT")

# eureka.start()


@app.route('/')
def index_route():
    return jsonify({"warehouse": "/warehouse", "product": "/warehouse"})


@app.route('/product/<id>', methods=['GET', 'PUT', 'DELETE'])
def product_handler(id):
    return handle_product(id)


@app.route('/product', methods=['POST'])
def add_product_handler():
    return add_product()


@app.route('/warehouse/<id>', methods=['GET', 'PUT', 'DELETE'])
def warehouse_handler(id):
    return handle_warehouse(id)


@app.route('/warehouse', methods=['POST'])
def add_warehouse_handler():
    return add_warehouse()


if __name__ == '__main__':
    app.run(port=PORT)
