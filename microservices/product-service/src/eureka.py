import requests
import json
import os

from dotenv import load_dotenv
load_dotenv(verbose=True)

APP_NAME = os.getenv("APP_NAME")
APP_PORT = os.getenv("PORT")
HOST = os.getenv("HOST")

EUREKA_HOST = os.getenv("EUREKA_HOST")
EUREKA_PORT = os.getenv("EUREKA_PORT")

EUREKA_SERVER = f'http://{EUREKA_HOST}:{EUREKA_PORT}/eureka/apps/{APP_NAME}'

payload = {
    'instance': {
        'hostName': HOST,
        'app': APP_NAME,
        'ipAddr': HOST,
        'port': {'$': APP_PORT, '@enabled': True},
        'dataCenterInfo': {'@class': 'com.netflix.appinfo.MyDataCenterInfo', 'name': 'MyOwn'}
    }
}

headers = {'content-type': 'application/json', 'cache-control': 'no-cache'}
json_payload = json.dumps(payload)


def start():
    response = requests.request('POST', EUREKA_SERVER, data=json_payload, headers=headers)
    print('status code::', response.status_code)
