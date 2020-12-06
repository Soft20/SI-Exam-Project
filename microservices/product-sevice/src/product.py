
from db_connect import mongo_client

mongo_database = 'si-exam-webshop'

mydb = mongo_client[mongo_database]
mycol = mydb["products"]

mydict = {"name": "John", "address": "Highway 37"}

x = mycol.insert_one(mydict)

'''
class MongoPerson:

    def __init__(self, ):
        pass

    def add_product(self, ):
        pass

    def get_product(self, ):
        pass

    def update_product(self, ):
        pass

    def delete_product(self, ):
        pass
'''
