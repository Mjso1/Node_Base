const express = require('express');
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
router.get('/:file', (req, res) => {
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

module.exports = router;