from flask import Flask, render_template, request, jsonify
from geopy.geocoders import Nominatim
import ssl
import certifi
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
ssl_context = ssl.create_default_context(cafile=certifi.where())
geolocator = Nominatim(user_agent="antipode_app", ssl_context=ssl_context)

def calculate_antipode(lat, lon):
    antipode_lat = -lat
    if lon < 0:
        antipode_lon = lon + 180
    else:
        antipode_lon = lon - 180
    return antipode_lat, antipode_lon

@app.route('/')
def index():
    cesium_token = os.getenv('CESIUM_TOKEN')
    return render_template('index.html', cesium_token=cesium_token)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    address = request.form['address']
    location = geolocator.geocode(address)
    if location:
        lat, lon = location.latitude, location.longitude
        antipode_lat, antipode_lon = calculate_antipode(lat, lon)
        return jsonify({
            'original': {'lat': lat, 'lon': lon},
            'antipode': {'lat': antipode_lat, 'lon': antipode_lon}
        })
    return jsonify({'error': 'Address not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)