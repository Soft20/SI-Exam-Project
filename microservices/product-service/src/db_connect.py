import pymongo
import os
from dotenv import load_dotenv

load_dotenv(verbose=True)

APP_NAME = os.getenv("APP_NAME")
APP_PORT = os.getenv("PORT")
HOST = os.getenv("HOST")
mongo_database = os.getenv("MONGO_DATABASE")

mongo_user = os.getenv("MONGO_USERNAME")
mongo_password = os.getenv("MONGO_PASSWORD")
mongo_database = os.getenv("MONGO_DATABASE")
mongo_cluster = os.getenv("MONGO_CLUSTER")
mongo_connection = f'mongodb+srv://{mongo_user}:{mongo_password}@{mongo_cluster}.90imc.gcp.mongodb.net/{mongo_database}?retryWrites=true&w=majority'

mongo_client = pymongo.MongoClient(mongo_connection)
database = mongo_client[mongo_database]
