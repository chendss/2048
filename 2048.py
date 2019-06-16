from flask import Flask, send_file  # , redirect, abort
from gevent.wsgi import WSGIServer


app = Flask(__name__)


@app.route('/', methods=['GET'])
def night():
    return send_file('html/2048.html')


@app.route('/<path:fn>',)
def file(fn):
    return send_file(fn)

WSGIServer(('', 9393), app).serve_forever()