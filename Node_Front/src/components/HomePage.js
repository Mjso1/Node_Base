import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Storage as StorageIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            MongoDB 관리 시스템
          </Typography>
          <Typography variant="h6" color="text.secondary">
            데이터베이스 컬렉션을 조회하고 관리하세요
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} 
                  onClick={() => navigate('/collections')}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <StorageIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  컬렉션 조회
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  MongoDB 데이터베이스의 모든 컬렉션을 확인하고 데이터를 조회할 수 있습니다
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<StorageIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/collections');
                  }}
                >
                  컬렉션 보기
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <DashboardIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  대시보드
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  데이터베이스 통계와 시스템 상태를 확인할 수 있습니다 (준비중)
                </Typography>
                <Button 
                  variant="outlined" 
                  size="large"
                  disabled
                  startIcon={<DashboardIcon />}
                >
                  준비중
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;