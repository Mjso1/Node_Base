import numpy as np
from tensorflow.keras.models import load_model
from data_loader import load_series_data_with_labels

# 상수 정의
SEQUENCE_LENGTH = 3
DATA_PATH = "../data/time_series_data.tt"
MODEL_PATH = "../models/ts_classification_model.h5"

def predict_trend():
    # 1. 저장된 분류 모델 불러오기
    model = load_model(MODEL_PATH)
    print("Classification model loaded successfully.")

    # 2. 데이터 전처리 및 라벨 해석을 위해 scaler와 label_encoder 불러오기
    _, _, scaler, label_encoder = load_series_data_with_labels(DATA_PATH, SEQUENCE_LENGTH)

    # 3. 예측에 사용할 샘플 입력 데이터 (예: 마지막 3개 값)
    input_data = np.array([[20], [21], [24]])

    # 4. 입력 데이터를 학습 때와 동일하게 정규화
    scaled_input = scaler.transform(input_data)

    # 5. 모델의 입력 형태에 맞게 데이터 형태 변경 (1, 3, 1)
    reshaped_input = np.reshape(scaled_input, (1, SEQUENCE_LENGTH, 1))

    # 6. 예측 실행 (결과는 각 클래스에 대한 확률 배열로 나옴)
    prediction_probabilities = model.predict(reshaped_input)

    # 7. 가장 높은 확률을 가진 클래스의 인덱스를 찾기
    predicted_class_index = np.argmax(prediction_probabilities, axis=1)[0]

    # 8. 찾은 인덱스를 원래의 텍스트 라벨로 변환
    predicted_label = label_encoder.inverse_transform([predicted_class_index])[0]

    print(f"\nInput sequence: {[val[0] for val in input_data]}")
    print(f"Predicted trend: '{predicted_label}'")
    print("-" * 30)
    # 참고: 각 클래스별 확률 출력
    for i, label in enumerate(label_encoder.classes_):
        print(f"Probability of '{label}': {prediction_probabilities[0][i]:.2%}")

if __name__ == "__main__":
    predict_trend()