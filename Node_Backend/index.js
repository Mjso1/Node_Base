const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expressapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes (API 라우트를 먼저 정의)
app.use('/api/users', require('./src/routes/users'));
app.use('/api/auth', require('./src/routes/auth'));

// 간단한 에코 API - 추가
app.get('/api/echo', (req, res) => {
  res.json({
    status: 'success',
    message: 'Echo API is working',
    timestamp: new Date().toISOString(),
    server: 'Node.js Express Server'
  });
});

// React 정적 파일 서빙 (Node_Front 폴더의 build 파일)
const frontendPath = path.join(__dirname, '../Node_Front/build');
app.use(express.static(frontendPath));

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// React Router를 위한 catch-all 핸들러 (API 라우트가 아닌 모든 요청)
app.get('/', (req, res) => {
  // API 요청이 아닌 경우에만 React 앱 서빙
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Frontend path:', frontendPath);
});

module.exports = app;