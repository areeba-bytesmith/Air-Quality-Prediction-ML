from flask import Flask, request, jsonify
import numpy as np
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load scaler and both models
scaler = joblib.load('scaler.pkl')             # Add this: load the saved scaler
model_day1 = joblib.load('aqi_predictor_day1.pkl')  # Tomorrow's AQI
model_day2 = joblib.load('aqi_predictor_day2.pkl')  # Day after tomorrow's AQI

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # Ensure all necessary features are provided
    required_fields = ['pm25', 'pm10', 'no2', 'nh3', 'so2', 'co', 'ozone']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

    try:
        # Extract features and ensure they are valid numbers
        features = [
            float(data['pm25']),
            float(data['pm10']),
            float(data['no2']),
            float(data['nh3']),
            float(data['so2']),
            float(data['co']),
            float(data['ozone']),
        ]
    except ValueError:
        return jsonify({'error': 'Invalid input: Please provide numeric values for all fields'}), 400

    # Reshape data for prediction
    input_data = np.array([features])

    # Scale the input data using the loaded scaler
    input_scaled = scaler.transform(input_data)

    try:
        # Make both predictions using the scaled input
        prediction_day1 = model_day1.predict(input_scaled)[0]
        prediction_day2 = model_day2.predict(input_scaled)[0]

        # Return predictions
        return jsonify({
            'prediction_day1': round(prediction_day1, 2),
            'prediction_day2': round(prediction_day2, 2)
        })

    except Exception as e:
        return jsonify({'error': f'Error in prediction: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
