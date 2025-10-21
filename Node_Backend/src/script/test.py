import sys

if __name__ == "__main__":
    # 첫 번째 인자로 입력받은 문자열
    if len(sys.argv) > 1:
        input_str = sys.argv[1]
        print(f"Received: {input_str}")
    else:
        print("No input received.")