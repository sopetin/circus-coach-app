import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function SaveIndicator() {
  const { lastSaveTime } = useApp();

  if (!lastSaveTime) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <Tooltip title={`Last saved: ${format(new Date(lastSaveTime), 'MMM d, yyyy HH:mm:ss')}`}>
        <Chip
          icon={<CheckCircleIcon />}
          label="Auto-saved"
          color="success"
          size="small"
          sx={{
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
            },
          }}
        />
      </Tooltip>
    </Box>
  );
}
