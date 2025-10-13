import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Box,
  Grid,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const EditDialog = ({
  open,
  onClose,
  selectedCollection,
  editingDocument,
  editedData,
  editLoading,
  editError,
  onEditChange,
  onSaveEdit
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          문서 수정 - {selectedCollection}
        </Typography>
        <IconButton onClick={onClose}>
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
                      onEditChange(key, newValue);
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
        <Button onClick={onClose} disabled={editLoading}>
          취소
        </Button>
        <Button 
          onClick={onSaveEdit}
          variant="contained"
          startIcon={editLoading ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={editLoading}
        >
          {editLoading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;