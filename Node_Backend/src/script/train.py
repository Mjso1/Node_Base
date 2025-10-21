import os
import pandas as pd
import tensorflow as tf
# 1. 변경된 함수 이름으로 임포트
from .data_loader import load_series_data_with_labels
# 2. 변경된 모델 생성 함수 이름으로 임포트
from .model import create_classification_model

# 상수 정의
SEQUENCE_LENGTH = 3
# 3. 라벨이 포함된 데이터 파일 경로로 변경
DATA_PATH = "../data/time_series_data.csv" # 파일 이름이 time_series_data.csv가 맞는지 확인하세요.
MODEL_SAVE_PATH = "../models/ts_classification_model.h5"

# 모델 저장 디렉터리 생성
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

def train_classification_model():
    # 4. 변경된 데이터 로더 함수 호출
    X, y_categorical, _, _ = load_series_data_with_labels(DATA_PATH, SEQUENCE_LENGTH)

    # 5. 클래스 개수 가져오기 (y 데이터의 shape[1] 값)
    num_classes = y_categorical.shape[1]

    # 6. 변경된 모델 생성 함수 호출
    model = create_classification_model(SEQUENCE_LENGTH, num_classes)

    # 모델 학습
    print("Starting model training for classification...")
    # y 데이터로 y_categorical 사용
    model.fit(X, y_categorical, epochs=100, batch_size=1, verbose=2)
    print("Training finished.")

    # 모델 저장
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_classification_model()