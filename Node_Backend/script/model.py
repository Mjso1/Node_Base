from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam

# 모델 생성 함수의 이름을 바꾸고, num_classes 인자를 받도록 수정
def create_classification_model(sequence_length, num_classes):
    model = Sequential()
    
    # 첫 번째 LSTM 층: 유닛 수를 64로 늘림
    model.add(LSTM(64, return_sequences=True, input_shape=(sequence_length, 1)))
    # 과적합 방지를 위해 20% Dropout 추가
    model.add(Dropout(0.2))
    
    # 두 번째 LSTM 층
    model.add(LSTM(64, return_sequences=False)) # 마지막 LSTM이므로 False
    model.add(Dropout(0.2))

    # 중간에 Dense 층을 하나 더 추가하여 특징을 한 번 더 조합
    model.add(Dense(32, activation='relu'))

    # 최종 출력 층
    model.add(Dense(num_classes, activation='softmax'))
    
    # 학습률을 조정한 Adam 옵티마이저 사용
    custom_optimizer = Adam(learning_rate=0.001)
    
    model.compile(optimizer=custom_optimizer, loss='categorical_crossentropy', metrics=['accuracy'])
    
    # 모델의 전체 구조를 터미널에 출력해서 확인
    model.summary()
    
    return model