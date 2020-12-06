import product
import eureka
from flask import Flask, jsonify
from dotenv import load_dotenv
import os

load_dotenv(verbose=True)

app = Flask(__name__)
PORT = os.getenv("PORT")

eureka.start()


@app.route('/')
def hello_eureka():
    return jsonify({"message": "Hi Eureka from Flask (Python)"})


if __name__ == '__main__':
    app.run(port=PORT)
