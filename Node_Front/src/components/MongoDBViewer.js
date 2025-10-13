import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const MongoDBViewer = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [databaseInfo, setDatabaseInfo] = useState(null);

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
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchCollections}
            disabled={loading}
          >
            새로고침
          </Button>
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
                        onClick={() => window.open(`/api/collections/${collection.name}/data`, '_blank')}
                      >
                        데이터 보기
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => window.open(`/api/collections/${collection.name}/count`, '_blank')}
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
    </Container>
  );
};

export default MongoDBViewer;