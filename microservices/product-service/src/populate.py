from bson.objectid import ObjectId
from db_connect import database
import random

products = database["products"]
warehouses = database["warehouses"]
orders = database["orders"]

############################
#      Adding Products     #
############################

product_list = []

for n in range(50):
    product = {
        'name': f'Product {n}',
        'price': random.randint(100, 5000),
        'weight': random.randint(100, 2000)
    }

    product_list.append(product)

products.insert_many(product_list)

############################
#     Adding Warehouses    #
############################

product_ids = [product['_id'] for product in products.find()]

warehouse_list = [
    {'name': 'Remote Warehouse', 'location': 'Jylland', 'remote': True, 'products': [{'id': id, 'amount': random.randint(5, 25)} for id in product_ids[:30]]},
    {'name': 'Main Warehouse', 'location': 'Sjælland', 'remote': False, 'products': [{'id': id, 'amount': random.randint(5, 25)} for id in product_ids[-30:]]},
]

warehouses.insert_many(warehouse_list)
