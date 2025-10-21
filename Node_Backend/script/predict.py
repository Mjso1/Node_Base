import numpy as np
from tensorflow.keras.models import load_model
from .data_loader import load_series_data # 상대 경로로 수정

# 상수 정의
SEQUENCE_LENGTH = 3
DATA_PATH = "data/time_series_data.tt"
MODEL_PATH = "models/ts_model.h5"

def make_predictions(model, new_data):
    """
    주어진 모델을 사용하여 새로운 데이터에 대한 예측을 수행합니다.

    :param model: 학습된 TensorFlow 모델
    :param new_data: 예측할 새로운 데이터 (numpy 배열 또는 pandas DataFrame 형식)
    :return: 예측 결과 (numpy 배열)
    """
    # 새로운 데이터 전처리 (필요한 경우)
    # 예: new_data = preprocess_data(new_data)

    # 예측 수행
    predictions = model.predict(new_data)

    return predictions

def predict_next_value():
    # 1. 저장된 모델 불러오기
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")

    # 2. 데이터 스케일러(scaler)를 얻기 위해 데이터 로더 사용
    # 모델이 정규화된 데이터로 학습했기 때문에, 예측할 입력값도 동일하게 정규화해야 합니다.
    _, _, scaler = load_series_data(DATA_PATH, SEQUENCE_LENGTH)

    # 3. 예측에 사용할 입력 데이터 (학습 데이터의 마지막 3개 값)
    input_data = np.array([[13], [15], [14]])

    # 4. 입력 데이터를 모델이 학습한 방식과 동일하게 0과 1 사이로 정규화
    scaled_input = scaler.transform(input_data)

    # 5. 모델의 입력 형태에 맞게 데이터 형태 변경 (1, 3, 1) -> [샘플 수, 시퀀스 길이, 특성 수]
    reshaped_input = np.reshape(scaled_input, (1, SEQUENCE_LENGTH, 1))

    # 6. 예측 실행
    predicted_scaled = model.predict(reshaped_input)

    # 7. 예측된 결과를 다시 원래 값의 범위로 변환 (역정규화)
    predicted_value = scaler.inverse_transform(predicted_scaled)

    print(f"\nInput data (last 3 points): {[val[0] for val in input_data]}")
    print(f"Predicted next value: {predicted_value[0][0]:.2f}")

if __name__ == "__main__":
    predict_next_value()