import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { Numbers as NumbersIcon } from '@mui/icons-material';

const CountDialog = ({
  open,
  onClose,
  selectedCollection,
  countLoading,
  collectionCount
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CountDialog;