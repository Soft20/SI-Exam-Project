import requests
import json

# to .env
APP_NAME = 'flask-service'
APP_PORT = 5000
HOST = 'localhost'

EUREKA_SERVER = f'http://localhost:8761/eureka/apps/{APP_NAME}'

payload = {
    'instance': {
        'hostName': HOST,
        'app': APP_NAME,
        'ipAddr': HOST,
        'port': { '$': APP_PORT, '@enabled': True },
        'dataCenterInfo': { '@class': 'com.netflix.appinfo.MyDataCenterInfo', 'name' : 'MyOwn' }
    }
}

headers = { 'content-type': 'application/json', 'cache-control': 'no-cache' }
json_payload = json.dumps(payload)

def start():
    response = requests.request('POST', EUREKA_SERVER, data=json_payload, headers=headers)
    print('status code::', response.status_code)