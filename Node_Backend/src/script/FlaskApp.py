import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import numpy as np
import json
from tensorflow.keras.models import load_model
from data_loader import load_series_data_with_labels
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime  # 현재 시간 추가를 위한 모듈

app = Flask(__name__)
CORS(app)  # CORS 활성화 (Node.js와 같은 외부 클라이언트가 접근 가능하도록)

# 상수 정의
SEQUENCE_LENGTH = 3
DATA_PATH = "../data/time_series_data.tt"
MODEL_PATH = "../models/ts_classification_model.h5"

def remove_ansi_escape_codes(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)


model = load_model(MODEL_PATH)

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Flask 서버가 정상적으로 작동 중입니다."})

@app.route('/predict', methods=['GET'])
def predict():
    try:
        input_data = request.args.get('input_data') 

        # 2. 데이터 전처리 및 라벨 해석을 위해 scaler와 label_encoder 불러오기
        _, _, scaler, label_encoder = load_series_data_with_labels(DATA_PATH, SEQUENCE_LENGTH)

        # 3. 예측에 사용할 샘플 입력 데이터 (예: 마지막 3개 값)
        input_data = np.array([[20], [21], [23]])

        # 4. 입력 데이터를 학습 때와 동일하게 정규화
        scaled_input = scaler.transform(input_data)

        # 5. 모델의 입력 형태에 맞게 데이터 형태 변경 (1, 3, 1)
        reshaped_input = np.reshape(scaled_input, (1, SEQUENCE_LENGTH, 1))

        # 6. 예측 실행 (결과는 각 클래스에 대한 확률 배열로 나옴)
        prediction_probabilities = model.predict(reshaped_input, verbose=0)

        # 7. 가장 높은 확률을 가진 클래스의 인덱스를 찾기
        predicted_class_index = np.argmax(prediction_probabilities, axis=1)[0]

        # 8. 찾은 인덱스를 원래의 텍스트 라벨로 변환
        predicted_label = label_encoder.inverse_transform([predicted_class_index])[0]

        # JSON 포맷으로 결과 생성
        result = {
            "predicted_trend": predicted_label,
            "probabilities": {
                label: f"{prediction_probabilities[0][i]:.2%}"
                for i, label in enumerate(label_encoder.classes_)
            },
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # 현재 시간 추가
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)