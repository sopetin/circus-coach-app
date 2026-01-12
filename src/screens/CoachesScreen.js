import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function CoachesScreen() {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenDialog = (coach = null) => {
    if (coach) {
      setEditingCoach(coach);
      setFormData({
        name: coach.name || '',
        email: coach.email || '',
        phone: coach.phone || '',
      });
    } else {
      setEditingCoach(null);
      setFormData({ name: '', email: '', phone: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoach(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const coachData = {
      id: editingCoach?.id || Date.now().toString(),
      ...formData,
    };

    if (editingCoach) {
      dispatch({ type: 'UPDATE_COACH', payload: coachData });
    } else {
      dispatch({ type: 'ADD_COACH', payload: coachData });
    }
    handleCloseDialog();
  };

  const handleMenuOpen = (event, coach) => {
    setAnchorEl(event.currentTarget);
    setSelectedCoach(coach);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCoach(null);
  };

  const getCoachStats = (coachId, period = 'month') => {
    const now = new Date();
    const start = period === 'month' 
      ? startOfMonth(now)
      : new Date(now.getFullYear(), 0, 1);
    const end = period === 'month'
      ? endOfMonth(now)
      : new Date(now.getFullYear(), 11, 31);

    const coachLessons = state.lessons.filter(
      l => l.coachId === coachId && !l.cancelled
    );
    const coachVisits = state.visits.filter(v => {
      const visitDate = new Date(v.date);
      return visitDate >= start && visitDate <= end && v.coachId === coachId;
    });

    return {
      lessons: coachLessons.length,
      visits: coachVisits.length,
      students: new Set(coachVisits.map(v => v.studentId)).size,
    };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Coaches ({state.coaches.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Add Coach
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Coaches List" />
          <Tab label="Dashboards" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={2}>
          {state.coaches.map((coach) => {
            const stats = getCoachStats(coach.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={coach.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {coach.name}
                        </Typography>
                        {coach.email && (
                          <Typography variant="body2" color="text.secondary">
                            {coach.email}
                          </Typography>
                        )}
                        {coach.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {coach.phone}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, coach)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        This Month:
                      </Typography>
                      <Typography variant="body2">
                        Lessons: {stats.lessons}
                      </Typography>
                      <Typography variant="body2">
                        Visits: {stats.visits}
                      </Typography>
                      <Typography variant="body2">
                        Students: {stats.students}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {tabValue === 1 && (
        <Box>
          <Grid container spacing={2}>
            {state.coaches.map((coach) => {
              const monthStats = getCoachStats(coach.id, 'month');
              const yearStats = getCoachStats(coach.id, 'year');
              return (
                <Grid item xs={12} md={6} key={coach.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {coach.name}
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ color: 'white' }}>
                              {monthStats.lessons}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Lessons (Month)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ color: 'white' }}>
                              {monthStats.visits}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Visits (Month)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ color: 'white' }}>
                              {yearStats.lessons}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Lessons (Year)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                            <Typography variant="h4" sx={{ color: 'white' }}>
                              {yearStats.visits}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Visits (Year)
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {state.coaches.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No coaches yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Add First Coach
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCoach ? 'Edit Coach' : 'Add New Coach'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleOpenDialog(selectedCoach); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
      </Menu>
    </Box>
  );
}
