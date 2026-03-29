from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import sys
import os

# Add parent directory to path to allow relative imports if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from ml_api.pulse_api import PulseAPI
except ImportError:
    from pulse_api import PulseAPI

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize API once at startup
try:
    pulse_api = PulseAPI()
    MODELS_LOADED = True
    print("PULSE ML Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {str(e)}")
    MODELS_LOADED = False

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "message": "PULSE ML Engine is running.",
        "endpoints": {
            "health": "/health",
            "predict": "/predict [POST]"
        }
    }), 200

@app.route('/health', methods=['GET'])
def health():
    if MODELS_LOADED:
        return jsonify({
            "status": "healthy",
            "models_loaded": True,
            "api": "PULSE ML Engine"
        }), 200
    else:
        return jsonify({
            "status": "degraded",
            "models_loaded": False,
            "error": "Model initialization failed"
        }), 503

@app.route('/predict', methods=['POST'])
def predict():
    if not MODELS_LOADED:
        return jsonify({"error": "Service unavailable - models not loaded"}), 503

    try:
        # Check if the content type is JSON
        if not request.is_json:
             return jsonify({"success": False, "error": "Content-Type must be application/json"}), 400

        user_data = request.get_json(silent=True)
        if user_data is None:
            return jsonify({"success": False, "error": "Invalid or missing JSON request body"}), 400

        # Run prediction
        results = pulse_api.predict_all(user_data)
        
        return jsonify({
            "success": True,
            "data": results
        }), 200

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        sys.stderr.write(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    # Use port from environment or default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
