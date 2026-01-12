import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, addDays, getDay } from 'date-fns';
import DataRecovery from '../components/DataRecovery';
import CoachesScreen from './CoachesScreen';

const SETTINGS_VIEWS = {
  MAIN: 'main',
  MEMBERSHIP: 'membership',
  COACHES: 'coaches',
};

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const [currentView, setCurrentView] = useState(SETTINGS_VIEWS.MAIN);
  const [formData, setFormData] = useState({
    lessonsPerPayment: state.membershipConfig.lessonsPerPayment || 8,
    freeSkipLessons: state.membershipConfig.freeSkipLessons || 1,
  });
  const [saved, setSaved] = useState(false);
  const [dataRecoveryOpen, setDataRecoveryOpen] = useState(false);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_MEMBERSHIP_CONFIG',
      payload: formData,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    // Count total class occurrences (not cancelled)
    let totalOccurrences = 0;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    state.lessons.forEach(lesson => {
      if (!lesson.startDate || !lesson.endDate) return;
      const start = new Date(lesson.startDate);
      const end = new Date(lesson.endDate);
      const dayIndex = daysOfWeek.indexOf(lesson.dayOfWeek);
      
      // Find first occurrence of this day
      let current = new Date(start);
      if (getDay(current) !== dayIndex) {
        const daysUntilNext = (dayIndex - getDay(current) + 7) % 7;
        current = addDays(current, daysUntilNext || 7);
      }
      
      // Count occurrences weekly
      while (current <= end) {
        const lessonDate = format(current, 'yyyy-MM-dd');
        const occurrenceId = `${lesson.id}-${lessonDate}`;
        const cancelled = state.lessonOccurrences?.[occurrenceId]?.cancelled;
        if (!cancelled) {
          totalOccurrences++;
        }
        current = addDays(current, 7);
      }
    });

    return {
      classes: totalOccurrences,
      students: state.students.length,
      visits: state.visits.length,
    };
  }, [state.lessons, state.lessonOccurrences, state.students, state.visits]);

  // Membership Configuration View
  if (currentView === SETTINGS_VIEWS.MEMBERSHIP) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => setCurrentView(SETTINGS_VIEWS.MAIN)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Membership Configuration
          </Typography>
        </Box>

        <Card>
          <CardContent>
            {saved && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Configuration saved successfully!
              </Alert>
            )}

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

  // Coaches View
  if (currentView === SETTINGS_VIEWS.COACHES) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => setCurrentView(SETTINGS_VIEWS.MAIN)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Coaches
          </Typography>
        </Box>
        <CoachesScreen />
      </Box>
    );
  }

  // Main Settings View
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      {/* Settings Options List */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Configuration
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentView(SETTINGS_VIEWS.MEMBERSHIP)}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Membership Configuration" secondary="Configure payment and lesson settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setCurrentView(SETTINGS_VIEWS.COACHES)}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Coaches" secondary={`Manage ${state.coaches.length} coaches`} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setDataRecoveryOpen(true)}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Data Recovery" secondary="Backup, restore, or generate seed data" />
              </ListItemButton>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dashboard */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #e91e63 0%, #ff6b35 100%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardStats.classes}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Class Occurrences
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardStats.students}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Students
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {dashboardStats.visits}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Visits
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Recovery Dialog */}
      <DataRecovery 
        open={dataRecoveryOpen} 
        onClose={() => setDataRecoveryOpen(false)} 
      />
    </Box>
  );
}
