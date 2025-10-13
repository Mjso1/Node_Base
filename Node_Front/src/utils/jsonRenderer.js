import React from 'react';
import { Box, Button, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';

export const createJsonRenderer = (expandedRows, setExpandedRows) => {
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

  return renderJsonValue;
};