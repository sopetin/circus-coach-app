import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useApp } from '../context/AppContext';

export default function MembershipScreen() {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    lessonsPerPayment: state.membershipConfig.lessonsPerPayment || 8,
    freeSkipLessons: state.membershipConfig.freeSkipLessons || 1,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_MEMBERSHIP_CONFIG',
      payload: formData,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Membership Configuration
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuration saved successfully!
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Default Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lessons per Payment"
                type="number"
                value={formData.lessonsPerPayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lessonsPerPayment: parseInt(e.target.value) || 0,
                  })
                }
                helperText="Number of lessons included in one payment"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Free Skip Lessons"
                type="number"
                value={formData.freeSkipLessons}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeSkipLessons: parseInt(e.target.value) || 0,
                  })
                }
                helperText="Number of lessons that can be skipped for free"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
              Current Configuration:
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              1 payment = {formData.lessonsPerPayment} lessons in a row
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              Ability to skip {formData.freeSkipLessons} lesson(s) for free
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="large"
            >
              Save Configuration
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
