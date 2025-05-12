from flask import Flask, request, jsonify
import base64
from ocr import extract_item_info

app = Flask(__name__)

@app.route('/extract', methods=['POST'])
def extract_from_images():
    data = request.get_json()

    if 'front' not in data or 'label' not in data:
        return jsonify({'error': 'Both front and label images are required'}), 400

    try:
        # Decode base64 images
        front_image_bytes = base64.b64decode(data['front'])
        label_image_bytes = base64.b64decode(data['label'])

        # Call your model function
        result = extract_item_info(front_image_bytes, label_image_bytes)

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
