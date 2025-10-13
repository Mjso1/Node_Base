const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// MongoDB 컬렉션(테이블) 리스트 조회 API
router.get('/collections', async (req, res) => {
  try {
    // 현재 데이터베이스의 모든 컬렉션 이름 가져오기
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // 컬렉션 정보 정리
    const collectionList = collections.map(collection => ({
      name: collection.name,
      type: collection.type || 'collection'
    }));

    const result = {
      success: true,
      database: mongoose.connection.name,
      collections: collectionList,
      count: collectionList.length,
      timestamp: new Date().toLocaleString('ko-KR')
    };

    // JSON을 예쁘게 포맷팅 (들여쓰기 2칸)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('컬렉션 조회 오류:', error);
    const errorResult = {
      success: false,
      message: '컬렉션 조회 중 오류가 발생했습니다',
      error: error.message
    };
    
    res.status(500).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(errorResult, null, 2));
  }
});

// 특정 컬렉션의 문서 개수 조회 API
router.get('/collections/:name/count', async (req, res) => {
  try {
    const collectionName = req.params.name;
    const collection = mongoose.connection.db.collection(collectionName);
    const count = await collection.countDocuments();

    const result = {
      success: true,
      collection: collectionName,
      count: count,
      timestamp: new Date().toLocaleString('ko-KR')
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('문서 개수 조회 오류:', error);
    const errorResult = {
      success: false,
      message: '문서 개수 조회 중 오류가 발생했습니다',
      error: error.message
    };
    
    res.status(500).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(errorResult, null, 2));
  }
});

// 특정 컬렉션의 데이터 조회 API
router.get('/collections/:name/data', async (req, res) => {
  try {
    const collectionName = req.params.name;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await collection.countDocuments();

    const result = {
      success: true,
      collection: collectionName,
      data: documents,
      pagination: {
        skip: skip,
        limit: limit,
        total: totalCount,
        returned: documents.length
      },
      timestamp: new Date().toLocaleString('ko-KR')
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('데이터 조회 오류:', error);
    const errorResult = {
      success: false,
      message: '데이터 조회 중 오류가 발생했습니다',
      error: error.message
    };
    
    res.status(500).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(errorResult, null, 2));
  }
});

module.exports = router;