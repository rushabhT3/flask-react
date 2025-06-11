from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://congenial-barnacle-x969g4g49x7c97w7-3000.app.github.dev", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# File path for JSON data
JSON_FILE = 'time_tracking.json'

# Initialize JSON file if not exists
if not os.path.exists(JSON_FILE):
    with open(JSON_FILE, 'w') as f:
        json.dump([], f)

# Helper functions
def load_data():
    try:
        with open(JSON_FILE) as f:
            content = f.read()
            return json.loads(content) if content else []
    except json.JSONDecodeError:
        return []

def save_data(data):
    with open(JSON_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_monthly_hours():
    monthly = {}
    data = load_data()
    for entry in data:
        try:
            date = datetime.strptime(entry['date'], "%Y-%m-%d")
            year = date.year
            month = date.month
            key = f"{year}-{month}"
            hours = float(entry['hours'])  # Convert to float
            monthly[key] = monthly.get(key, 0) + hours
        except (KeyError, ValueError, TypeError) as e:
            print(f"Error processing entry: {entry} - {str(e)}")
            continue
    return monthly

def calculate_weekly_hours():
    weekly = {}
    data = load_data()
    for entry in data:
        try:
            date = datetime.strptime(entry['date'], "%Y-%m-%d")
            month = date.month
            day = date.day
            hours = float(entry['hours'])  # Convert to float
            # Calculate week of month (simple approach)
            week_of_month = ((day - 1) // 7) + 1
            week_key = f'week{week_of_month}'
            if month not in weekly:
                weekly[month] = {}
            weekly[month][week_key] = weekly[month].get(week_key, 0) + hours
        except (KeyError, ValueError, TypeError) as e:
            print(f"Error processing entry: {entry} - {str(e)}")
            continue
    return weekly

# API Endpoints
@app.route('/api/events', methods=['GET'])
def get_events():
    return jsonify(load_data())

@app.route('/api/events', methods=['POST'])
def create_event():
    new_event = request.json
    # Validate required fields
    if not all(k in new_event for k in ['date', 'project', 'hours']):
        abort(400, description="Missing required fields")
    try:
        float(new_event['hours'])  # Validate hours
        datetime.strptime(new_event['date'], "%Y-%m-%d")  # Validate date
    except (ValueError, TypeError):
        abort(400, description="Invalid hours or date format")
    data = load_data()
    new_event['id'] = len(data) + 1
    data.append(new_event)
    save_data(data)
    return jsonify(new_event), 201

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    data = load_data()
    event_index = None
    for i, event in enumerate(data):
        if event.get('id') == event_id:
            event_index = i
            break
    if event_index is None:
        abort(404, description="Event not found")
    deleted = data.pop(event_index)
    save_data(data)
    return jsonify(deleted), 200

@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = load_data()
    event_index = None
    for i, event in enumerate(data):
        if event.get('id') == event_id:
            event_index = i
            break
    if event_index is None:
        abort(404, description="Event not found")
    updated_event = request.json
    if not all(k in updated_event for k in ['date', 'project', 'hours']):
        abort(400, description="Missing required fields")
    try:
        float(updated_event['hours'])  # Validate hours
        datetime.strptime(updated_event['date'], "%Y-%m-%d")  # Validate date
    except (ValueError, TypeError):
        abort(400, description="Invalid hours or date format")
    updated_event['id'] = event_id
    data[event_index] = updated_event
    save_data(data)
    return jsonify(updated_event), 200

@app.route('/api/hours/monthly', methods=['GET', 'OPTIONS'])
def monthly_hours():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify(calculate_monthly_hours())

@app.route('/api/hours/weekly', methods=['GET', 'OPTIONS'])
def weekly_hours():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify(calculate_weekly_hours())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)