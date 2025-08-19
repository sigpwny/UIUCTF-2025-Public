from flask import Flask, render_template, request, redirect, url_for
from data.sample_shipments import SAMPLE_SHIPMENTS
import uuid
import os
import subprocess
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', shipments=SAMPLE_SHIPMENTS)

@app.route('/new_shipment')
def new_shipment():
    return render_template('new_shipment.html')

@app.route('/create_shipment', methods=['POST'])
def create_shipment():
    shipment_data = {k.lower(): v for k, v in request.form.items()}

    if shipment_data['supply_type'] == "flag":
        return "Error: Invalid supply type", 400

    shipment_status = subprocess.check_output(["/home/user/processing_service", json.dumps(shipment_data)]).decode().strip()

    return redirect(url_for('index', status=shipment_status))

if __name__ == '__main__':
    app.run(debug=True)
