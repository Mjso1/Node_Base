import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Numbers as NumbersIcon,
  Download as DownloadIcon    // 👈 추가
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DataViewDialog from './DataViewDialog';
import CountDialog from './CountDialog';
import EditDialog from './EditDialog';
import { createJsonRenderer } from '../utils/jsonRenderer';

const MongoDBViewer = () => {
  const navigate = useNavigate();
  
  // 기본 상태
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  
  // 다이얼로그 상태들
  const [dataDialog, setDataDialog] = useState(false);
  const [countDialog, setCountDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  
  // 데이터 관련 상태
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [collectionCount, setCollectionCount] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  // 로딩 및 에러 상태
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  
  // 페이지네이션 및 UI 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});

  // JSON 렌더러 생성
  const renderJsonValue = createJsonRenderer(expandedRows, setExpandedRows);

  // API 함수들
  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/collections');
      if (response.data.success) {
        setCollections(response.data.collections);
        setDatabaseInfo({
          database: response.data.database,
          count: response.data.count,
          timestamp: response.data.timestamp
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch collections');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || '컬렉션 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionData = async (collectionName, pageNum = 0, limit = 10) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const response = await axios.get(`/api/collections/${collectionName}/data`, {
        params: { skip: pageNum * limit, limit: limit }
      });
      if (response.data.success) {
        setCollectionData(response.data.data);
        setTotalCount(response.data.pagination.total);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setDataError(err.response?.data?.message || err.message || '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchCollectionCount = async (collectionName) => {
    setCountLoading(true);
    try {
      const response = await axios.get(`/api/collections/${collectionName}/count`);
      if (response.data.success) {
        setCollectionCount(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch count');
      }
    } catch (err) {
      setCollectionCount({ error: err.message });
    } finally {
      setCountLoading(false);
    }
  };

  const updateDocument = async (collectionName, documentId, updatedData) => {
    setEditLoading(true);
    setEditError(null);
    try {
      const response = await axios.put(`/api/collections/${collectionName}/data/${documentId}`, updatedData);
      if (response.data.success) {
        fetchCollectionData(selectedCollection, page, rowsPerPage);
        setEditDialog(false);
        setEditingDocument(null);
        setEditedData({});
      } else {
        throw new Error(response.data.message || 'Failed to update document');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || '문서 업데이트 중 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  const downloadCollectionData = async (collectionName) => {
    try {
      // 전체 데이터 조회 (limit 없이)
      const response = await axios.get(`/api/collections/${collectionName}/data`, {
        params: { limit: 99999 } // 대용량 데이터 조회
      });
      
      if (response.data.success) {
        const jsonData = response.data.data;
        
        // JSON 파일 생성 및 다운로드
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // 파일명 생성 (날짜/시간 포함)
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `${collectionName}_${timestamp}.json`;
        
        // 다운로드 링크 생성 및 클릭
        const downloadUrl = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 메모리 정리
        URL.revokeObjectURL(downloadUrl);
        
        console.log(`${collectionName} 데이터 다운로드 완료: ${fileName}`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data for download');
      }
    } catch (err) {
      console.error('다운로드 오류:', err);
      // 에러 알림 (선택사항)
      alert(`다운로드 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  // 이벤트 핸들러들
  const handleViewData = (collectionName) => {
    setSelectedCollection(collectionName);
    setPage(0);
    setDataDialog(true);
    fetchCollectionData(collectionName, 0, rowsPerPage);
  };

  const handleViewCount = (collectionName) => {
    setSelectedCollection(collectionName);
    setCountDialog(true);
    fetchCollectionCount(collectionName);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setEditedData(JSON.parse(JSON.stringify(document)));
    setEditDialog(true);
    setEditError(null);
  };

  const handleEditChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = () => {
    if (editingDocument && editingDocument._id) {
      updateDocument(selectedCollection, editingDocument._id, editedData);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchCollectionData(selectedCollection, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchCollectionData(selectedCollection, 0, newRowsPerPage);
  };

  const handleDownloadData = (collectionName) => {
    if (window.confirm(`${collectionName} 컬렉션의 모든 데이터를 JSON 파일로 다운로드하시겠습니까?`)) {
      downloadCollectionData(collectionName);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StorageIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1">
                MongoDB Collections
              </Typography>
              {databaseInfo && (
                <Typography variant="subtitle1" color="text.secondary">
                  Database: {databaseInfo.database}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ mr: 1 }}>
              홈으로
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchCollections}
              disabled={loading}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        {/* 데이터베이스 정보 */}
        {databaseInfo && (
          <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">총 컬렉션 수: </Typography>
                    <Chip label={databaseInfo.count} color="primary" sx={{ ml: 1 }} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary">
                    마지막 업데이트: {databaseInfo.timestamp}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* 에러 및 로딩 */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>컬렉션 조회 중...</Typography>
          </Box>
        )}

        {/* 컬렉션 리스트 */}
        {!loading && collections.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TableIcon sx={{ mr: 1 }} />
              컬렉션 목록
            </Typography>
            <Grid container spacing={2}>
              {collections.map((collection, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TableIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="h3">
                          {collection.name}
                        </Typography>
                      </Box>
                      <Chip label={collection.type} size="small" color="secondary" variant="outlined" />
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewData(collection.name)}
                            >
                            데이터 보기
                            </Button>
                            <Button
                            size="small"
                            startIcon={<NumbersIcon />}
                            onClick={() => handleViewCount(collection.name)}
                            >
                            개수 확인
                            </Button>
                        </Box>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadData(collection.name)}
                            sx={{ minWidth: 'auto' }}
                        >
                            다운로드
                        </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 빈 상태 */}
        {!loading && collections.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <StorageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              컬렉션이 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              MongoDB에 데이터를 추가한 후 다시 시도해주세요.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 다이얼로그들 */}
      <DataViewDialog
        open={dataDialog}
        onClose={() => setDataDialog(false)}
        selectedCollection={selectedCollection}
        dataLoading={dataLoading}
        dataError={dataError}
        collectionData={collectionData}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEditDocument={handleEditDocument}
        renderJsonValue={renderJsonValue}
      />

      <CountDialog
        open={countDialog}
        onClose={() => setCountDialog(false)}
        selectedCollection={selectedCollection}
        countLoading={countLoading}
        collectionCount={collectionCount}
      />

      <EditDialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        selectedCollection={selectedCollection}
        editingDocument={editingDocument}
        editedData={editedData}
        editLoading={editLoading}
        editError={editError}
        onEditChange={handleEditChange}
        onSaveEdit={handleSaveEdit}
      />
    </Container>
  );
};

export default MongoDBViewer;