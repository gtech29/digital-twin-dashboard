from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests from localhost:3000

@app.route('/api/agent', methods=['POST'])
def agent():
    message = request.json.get('message')
    print(f"[Agent] Message received: {message}")
    
    # Basic dummy logic for now
    if "anomalies" in message.lower():
        return jsonify({"response": "No anomalies detected today."})
    return jsonify({"response": f"You said: {message}"})

if __name__ == '__main__':
    app.run(port=5050)
