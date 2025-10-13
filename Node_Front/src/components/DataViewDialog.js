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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Fab
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const DataViewDialog = ({
  open,
  onClose,
  selectedCollection,
  dataLoading,
  dataError,
  collectionData,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEditDocument,
  renderJsonValue
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: 'none',
          maxHeight: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {selectedCollection} - 데이터 조회
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
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
            <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '20%' }}>
                      <strong>필드</strong>
                    </TableCell>
                    <TableCell sx={{ width: '80%' }}>
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
                              onClick={() => onEditDocument(item)}
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
              onPageChange={onPageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={onRowsPerPageChange}
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
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataViewDialog;