import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from tensorflow.keras.utils import to_categorical

# 데이터를 로드하고 전처리하는 함수
def load_series_data_with_labels(file_path, sequence_length=3):
    df = pd.read_csv(file_path)
    
    # 1. 라벨(trend)을 숫자로 변환 ('down':0, 'stable':1, 'up':2)
    label_encoder = LabelEncoder()
    df['trend_encoded'] = label_encoder.fit_transform(df['trend'])
    
    # 2. value 데이터 정규화
    scaler = MinMaxScaler(feature_range=(0, 1))
    df['value_scaled'] = scaler.fit_transform(df[['value']])

    # 3. 시퀀스 데이터(X)와 라벨(y) 생성
    X, y = [], []
    for i in range(len(df) - sequence_length):
        # X: sequence_length 만큼의 연속된 'value_scaled' 값
        X.append(df['value_scaled'].iloc[i:(i + sequence_length)].values)
        # y: 시퀀스가 끝난 직후의 'trend_encoded' 값
        y.append(df['trend_encoded'].iloc[i + sequence_length])

    X, y = np.array(X), np.array(y)

    # 4. X 데이터 형태 변경 (samples, timesteps, features)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))

    # 5. y 라벨을 원-핫 인코딩으로 변경 (분류 모델을 위해)
    # 예: 2 -> [0, 0, 1], 0 -> [1, 0, 0]
    num_classes = len(label_encoder.classes_)
    y_categorical = to_categorical(y, num_classes=num_classes)
    
    # scaler와 label_encoder는 나중에 예측 결과를 해석하기 위해 반환
    return X, y_categorical, scaler, label_encoder