from flask import Flask, jsonify
from flask.helpers import locked_cached_property
app = Flask(__name__)

import eureka
eureka.start()

# to .env
PORT = 5000

@app.route('/')
def hello_eureka():
    return jsonify({"message": "Hi Eureka from Flask (Python)"})

if __name__ == '__main__':
    app.run(port=PORT)