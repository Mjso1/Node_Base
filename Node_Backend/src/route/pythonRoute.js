const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const router = express.Router();

// 1. 테스트 엔드포인트
router.get('/test/:str', (req, res) => {
  const inputStr = req.params.str; // URL에서 입력받은 문자열

  // Python 스크립트 경로
  const scriptPath = path.join(__dirname, '../script/test.py');

  // Python 스크립트 실행
  const pythonProcess = spawn('python', [scriptPath, inputStr], {
    cwd: path.dirname(scriptPath), // 작업 디렉터리를 Python 스크립트 디렉터리로 설정
  });

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

// 2. python 실행 엔드포인트
router.get('/run/:file', (req, res) => {
  const inputStr = req.params.file; // URL에서 입력받은 문자열

  // Python 스크립트 경로
  const scriptPath = path.join(__dirname, `../script/${inputStr}.py`);

  // Python 스크립트 실행
  const pythonProcess = spawn('python', [scriptPath, inputStr], {
    cwd: path.dirname(scriptPath), // 작업 디렉터리를 Python 스크립트 디렉터리로 설정
  });

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
        message: 'Python 스크립트 실행 성공',
        input: inputStr,
        output: output.trim(),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Python 스크립트 실행 중 오류 발생',
        input: inputStr,
        error: errorOutput.trim(),
      });
    }
  });
});

// 3. Flask 서버 연동 예제 엔드포인트 (GET 방식)
router.get('/Flask', async (req, res) => {
  try {
    const inputData = req.query.input_data; // 쿼리 파라미터에서 입력 데이터 가져오기

    // Flask 서버 호출 (GET 방식)
    const response = await axios.get('http://localhost:5000/predict', {
      params: { input_data: inputData }, // 쿼리 파라미터로 데이터 전달
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Flask 서버 호출 중 오류 발생' });
  }
});

module.exports = router;