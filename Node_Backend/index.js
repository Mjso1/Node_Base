const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 라우터 모듈 import
const mongoRoutes = require('./src/route/mongoCollection');
const pythonRoutes = require('./src/route/pythonRoute');

const app = express();
const port = process.env.PORT || 3000;

// 기본 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expressapp')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// API 라우트
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API 작동중', 
    time: new Date().toLocaleString('ko-KR') 
  });
});

// MongoDB 관련 API 라우트 연결
app.use('/api', mongoRoutes);

// Python 관련 API 라우트 연결
app.use('/python', pythonRoutes); // Python 라우트를 명시적으로 추가

// React 앱 서빙
const frontendPath = path.join(__dirname, '../Node_Front/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/python/')) {
    res.status(404).json({ error: 'API not found' });
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log('📁 Routes loaded: /api/collections, /python');
});