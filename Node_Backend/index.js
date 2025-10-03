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

// MongoDB ����
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expressapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes (API ���Ʈ�� ���� ����)
app.use('/api/users', require('./src/routes/users'));
app.use('/api/auth', require('./src/routes/auth'));

// ������ ���� API - �߰�
app.get('/api/echo', (req, res) => {
  res.json({
    status: 'success',
    message: 'Echo API is working',
    timestamp: new Date().toISOString(),
    server: 'Node.js Express Server'
  });
});

// React ���� ���� ���� (Node_Front ������ build ����)
const frontendPath = path.join(__dirname, '../Node_Front/build');
app.use(express.static(frontendPath));

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

// React Router�� ���� catch-all �ڵ鷯 (API ���Ʈ�� �ƴ� ��� ��û)
app.get('/', (req, res) => {
  // API ��û�� �ƴ� ��쿡�� React �� ����
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