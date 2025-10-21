const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// 1. 테스트 엔드포인트
router.get('/test/:str', (req, res) => {
  const inputStr = req.params.str; // URL에서 입력받은 문자열

  // Python 스크립트 실행
  const pythonProcess = spawn('python', ['script/test.py', inputStr]);

  let output = '';
  let errorOutput = '';

  // Python 스크립트의 표준 출력 처리
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Python 스크립트의 표준 에러 처리
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Python 스크립트 실행 완료 처리
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({
        success: true,
        message: 'Python 테스트 스크립트 실행 성공',
        input: inputStr,
        output: output.trim(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Python 테스트 스크립트 실행 중 오류 발생',
        input: inputStr,
        error: errorOutput.trim(),
      });
    }
  });
});

// 2. LSTM 모델 실행 엔드포인트
router.get('/runModelLstm/:modelName', (req, res) => {
  const modelName = req.params.modelName; // .py 파일 이름
  const param = req.query.param || ''; // 추가 파라미터 (쿼리에서 받음)

  // Python 스크립트 실행
  const pythonProcess = spawn('python', [`models/${modelName}.py`, param]);

  let output = '';
  let errorOutput = '';

  // Python 스크립트의 표준 출력 처리
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Python 스크립트의 표준 에러 처리
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Python 스크립트 실행 완료 처리
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({
        success: true,
        message: 'Python LSTM 모델 실행 성공',
        script: `${modelName}.py`,
        param: param,
        output: output.trim(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Python LSTM 모델 실행 중 오류 발생',
        script: `${modelName}.py`,
        param: param,
        error: errorOutput.trim(),
      });
    }
  });
});

module.exports = router;