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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Collapse,
  TextField,    // 👈 추가
  Fab          // 👈 추가
} from '@mui/material';
import {
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Numbers as NumbersIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,     // 👈 추가
  Save as SaveIcon      // 👈 추가
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MongoDBViewer = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  
  // 데이터 조회 다이얼로그 상태
  const [dataDialog, setDataDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // 개수 조회 다이얼로그 상태
  const [countDialog, setCountDialog] = useState(false);
  const [collectionCount, setCollectionCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  
  // JSON 확장/축소 상태
  const [expandedRows, setExpandedRows] = useState({});

  // 수정 다이얼로그 상태
  const [editDialog, setEditDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // 컬렉션 리스트 조회
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
      console.error('Error fetching collections:', err);
      setError(err.response?.data?.message || err.message || '컬렉션 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컬렉션 데이터 조회
  const fetchCollectionData = async (collectionName, pageNum = 0, limit = 10) => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      const response = await axios.get(`/api/collections/${collectionName}/data`, {
        params: {
          skip: pageNum * limit,
          limit: limit
        }
      });
      
      if (response.data.success) {
        setCollectionData(response.data.data);
        setTotalCount(response.data.pagination.total);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching collection data:', err);
      setDataError(err.response?.data?.message || err.message || '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setDataLoading(false);
    }
  };

  // 컬렉션 개수 조회
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
      console.error('Error fetching collection count:', err);
      setCollectionCount({ error: err.message });
    } finally {
      setCountLoading(false);
    }
  };

  // 데이터 보기 버튼 클릭
  const handleViewData = (collectionName) => {
    setSelectedCollection(collectionName);
    setPage(0);
    setDataDialog(true);
    fetchCollectionData(collectionName, 0, rowsPerPage);
  };

  // 개수 확인 버튼 클릭
  const handleViewCount = (collectionName) => {
    setSelectedCollection(collectionName);
    setCountDialog(true);
    fetchCollectionCount(collectionName);
  };

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchCollectionData(selectedCollection, newPage, rowsPerPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchCollectionData(selectedCollection, 0, newRowsPerPage);
  };

  // JSON 객체 렌더링
  const renderJsonValue = (value, key, depth = 0) => {
    if (value === null) return <span style={{ color: '#999' }}>null</span>;
    if (typeof value === 'boolean') return <span style={{ color: '#d73a49' }}>{value.toString()}</span>;
    if (typeof value === 'number') return <span style={{ color: '#005cc5' }}>{value}</span>;
    if (typeof value === 'string') return <span style={{ color: '#032f62' }}>"{value}"</span>;
    if (Array.isArray(value)) {
      return (
        <details style={{ marginLeft: depth * 10 }}>
          <summary style={{ cursor: 'pointer', color: '#6f42c1' }}>Array ({value.length})</summary>
          <div style={{ marginLeft: 10 }}>
            {value.map((item, index) => (
              <div key={index}>
                <strong>{index}:</strong> {renderJsonValue(item, index, depth + 1)}
              </div>
            ))}
          </div>
        </details>
      );
    }
    if (typeof value === 'object') {
      const uniqueKey = `${key}-${depth}`;
      return (
        <Box>
          <Button
            size="small"
            onClick={() => setExpandedRows(prev => ({ ...prev, [uniqueKey]: !prev[uniqueKey] }))}
            startIcon={expandedRows[uniqueKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ p: 0, minWidth: 'auto' }}
          >
            Object ({Object.keys(value).length} keys)
          </Button>
          <Collapse in={expandedRows[uniqueKey]}>
            <Box sx={{ ml: 2, mt: 1 }}>
              {Object.entries(value).map(([objKey, objValue]) => (
                <Box key={objKey} sx={{ mb: 0.5 }}>
                  <strong style={{ color: '#e36209' }}>{objKey}:</strong>{' '}
                  {renderJsonValue(objValue, objKey, depth + 1)}
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    }
    return String(value);
  };

  // 수정 버튼 클릭
  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setEditedData(JSON.parse(JSON.stringify(document))); // 깊은 복사
    setEditDialog(true);
    setEditError(null);
  };

  // 수정된 데이터 변경
  const handleEditChange = (key, value) => {
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (editingDocument && editingDocument._id) {
      updateDocument(selectedCollection, editingDocument._id, editedData);
    }
  };

  // 문서 업데이트 API
  const updateDocument = async (collectionName, documentId, updatedData) => {
    setEditLoading(true);
    setEditError(null);
    
    try {
      const response = await axios.put(`/api/collections/${collectionName}/data/${documentId}`, updatedData);
      
      if (response.data.success) {
        // 성공 시 데이터 새로고침
        fetchCollectionData(selectedCollection, page, rowsPerPage);
        setEditDialog(false);
        setEditingDocument(null);
        setEditedData({});
      } else {
        throw new Error(response.data.message || 'Failed to update document');
      }
    } catch (err) {
      console.error('Error updating document:', err);
      setEditError(err.response?.data?.message || err.message || '문서 업데이트 중 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
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
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ mr: 1 }}
            >
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

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 로딩 상태 */}
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
                      <Chip 
                        label={collection.type} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </CardContent>
                    <Divider />
                    <CardActions>
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
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 컬렉션이 없을 때 */}
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

      {/* 데이터 조회 다이얼로그 */}
      <Dialog 
        open={dataDialog} 
        onClose={() => setDataDialog(false)}
        maxWidth="xl"        // lg → xl로 변경
        fullWidth
        PaperProps={{
          sx: {
            width: '95vw',     // 뷰포트 너비의 95% 사용
            height: '90vh',    // 뷰포트 높이의 90% 사용
            maxWidth: 'none',  // maxWidth 제한 해제
            maxHeight: 'none'  // maxHeight 제한 해제
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedCollection} - 데이터 조회
          </Typography>
          <IconButton onClick={() => setDataDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>  {/* 패딩 증가 */}
          {dataError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dataError}
            </Alert>
          )}
          
          {dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>  {/* 테이블 높이 증가 */}
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '20%' }}>  {/* 필드 컬럼 너비 고정 */}
                        <strong>필드</strong>
                      </TableCell>
                      <TableCell sx={{ width: '80%' }}>  {/* 값 컬럼 너비 증가 */}
                        <strong>값</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collectionData.map((item, index) => (
                      <React.Fragment key={index}>
                        <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                          <TableCell colSpan={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Document #{index + 1}
                              </Typography>
                              <Fab
                                size="small"
                                color="primary"
                                onClick={() => handleEditDocument(item)}
                                sx={{ ml: 2 }}
                              >
                                <EditIcon />
                              </Fab>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {Object.entries(item).map(([key, value]) => (
                          <TableRow key={`${index}-${key}`}>
                            <TableCell sx={{ 
                              fontWeight: 'medium', 
                              color: 'primary.main',
                              verticalAlign: 'top',
                              wordBreak: 'break-word'
                            }}>
                              {key}
                            </TableCell>
                            <TableCell sx={{ 
                              wordBreak: 'break-word',
                              verticalAlign: 'top'
                            }}>
                              {renderJsonValue(value, key)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="페이지당 행 수:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} / 총 ${count !== -1 ? count : `${to}개 이상`}`
                }
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>  {/* 패딩 증가 */}
          <Button onClick={() => setDataDialog(false)} variant="outlined" size="large">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 개수 조회 다이얼로그 */}
      <Dialog 
        open={countDialog} 
        onClose={() => setCountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCollection} - 문서 개수
        </DialogTitle>
        <DialogContent>
          {countLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : collectionCount?.error ? (
            <Alert severity="error">
              {collectionCount.error}
            </Alert>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <NumbersIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                {collectionCount?.count?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                개의 문서가 있습니다
              </Typography>
              {collectionCount?.timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  조회 시간: {collectionCount.timestamp}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            문서 수정 - {selectedCollection}
          </Typography>
          <IconButton onClick={() => setEditDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          
          {editingDocument && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Document ID: {editingDocument._id}
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(editedData).map(([key, value]) => (
                  <Grid item xs={12} key={key}>
                    <TextField
                      fullWidth
                      label={key}
                      value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      onChange={(e) => {
                        let newValue = e.target.value;
                        if (typeof value === 'object') {
                          try {
                            newValue = JSON.parse(e.target.value);
                          } catch (err) {
                            // 파싱 실패 시 문자열로 유지
                          }
                        } else if (typeof value === 'number') {
                          newValue = Number(e.target.value) || e.target.value;
                        } else if (typeof value === 'boolean') {
                          newValue = e.target.value === 'true';
                        }
                        handleEditChange(key, newValue);
                      }}
                      multiline={typeof value === 'object'}
                      rows={typeof value === 'object' ? 4 : 1}
                      disabled={key === '_id'}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      타입: {typeof value} {key === '_id' && '(수정 불가)'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(false)} disabled={editLoading}>
            취소
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={editLoading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={editLoading}
          >
            {editLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MongoDBViewer;