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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function LessonsScreen() {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '10:00',
    endTime: '11:00',
    coachId: '',
    className: '',
    forKids: true,
    forAdults: false,
    kidsStartAge: '',
    kidsEndAge: '',
    adultsStartAge: '',
    adultsEndAge: '',
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const availableClasses = [
    'Aerial Silks',
    'Acrobatics',
    'Juggling',
    'Clowning',
    'Tightrope',
  ];

  const handleOpenDialog = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        dayOfWeek: lesson.dayOfWeek || '',
        startTime: lesson.startTime || '10:00',
        endTime: lesson.endTime || '11:00',
        coachId: lesson.coachId || '',
        className: lesson.className || '',
        forKids: lesson.forKids !== false,
        forAdults: lesson.forAdults || false,
        kidsStartAge: lesson.kidsStartAge || '',
        kidsEndAge: lesson.kidsEndAge || '',
        adultsStartAge: lesson.adultsStartAge || '',
        adultsEndAge: lesson.adultsEndAge || '',
      });
    } else {
      setEditingLesson(null);
      setFormData({
        dayOfWeek: '',
        startTime: '10:00',
        endTime: '11:00',
        coachId: '',
        className: '',
        forKids: true,
        forAdults: false,
        kidsStartAge: '',
        kidsEndAge: '',
        adultsStartAge: '',
        adultsEndAge: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLesson(null);
  };

  const handleSave = () => {
    if (!formData.dayOfWeek || !formData.coachId || !formData.className) return;

    const lessonData = {
      id: editingLesson?.id || Date.now().toString(),
      ...formData,
      kidsStartAge: formData.kidsStartAge ? parseInt(formData.kidsStartAge) : null,
      kidsEndAge: formData.kidsEndAge ? parseInt(formData.kidsEndAge) : null,
      adultsStartAge: formData.adultsStartAge ? parseInt(formData.adultsStartAge) : null,
      adultsEndAge: formData.adultsEndAge ? parseInt(formData.adultsEndAge) : null,
    };

    if (editingLesson) {
      dispatch({ type: 'UPDATE_LESSON', payload: lessonData });
    } else {
      dispatch({ type: 'ADD_LESSON', payload: lessonData });
    }
    handleCloseDialog();
  };

  const handleCancelLesson = (lessonId) => {
    dispatch({ type: 'CANCEL_LESSON', payload: { id: lessonId } });
  };

  const handleUndoCancel = (lessonId) => {
    dispatch({ type: 'UNDO_CANCEL_LESSON', payload: { id: lessonId } });
  };

  const getCoachName = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    return coach ? coach.name : 'Unknown';
  };

  // Generate calendar view for current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Lessons Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Lesson
        </Button>
      </Box>

      <Grid container spacing={2}>
        {state.lessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <Card
              sx={{
                opacity: lesson.cancelled ? 0.6 : 1,
                bgcolor: lesson.cancelled ? 'grey.100' : 'background.paper',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {lesson.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.dayOfWeek} • {lesson.startTime} - {lesson.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coach: {getCoachName(lesson.coachId)}
                    </Typography>
                  </Box>
                  <Box>
                    {lesson.cancelled ? (
                      <IconButton
                        size="small"
                        onClick={() => handleUndoCancel(lesson.id)}
                        color="primary"
                      >
                        <UndoIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleCancelLesson(lesson.id)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(lesson)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  {lesson.forKids && (
                    <Chip
                      label={`Kids ${lesson.kidsStartAge || ''}-${lesson.kidsEndAge || ''}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {lesson.forAdults && (
                    <Chip
                      label={`Adults ${lesson.adultsStartAge || ''}-${lesson.adultsEndAge || ''}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )}
                  {lesson.cancelled && (
                    <Chip
                      label="Cancelled"
                      size="small"
                      color="error"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Weekly Calendar View
        </Typography>
        <Grid container spacing={1}>
          {weekDays.map((day, idx) => {
            const dayName = daysOfWeek[idx];
            const dayLessons = state.lessons.filter(
              l => l.dayOfWeek === dayName && !l.cancelled
            );
            return (
              <Grid item xs={12} sm={6} md={12/7} key={idx}>
                <Card sx={{ minHeight: 150 }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {dayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(day, 'MMM d')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {dayLessons.map((lesson) => (
                        <Chip
                          key={lesson.id}
                          label={`${lesson.startTime} ${lesson.className}`}
                          size="small"
                          sx={{ mb: 0.5, display: 'block', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {state.lessons.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No lessons configured yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Add First Lesson
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  label="Day of Week"
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Coach</InputLabel>
                <Select
                  value={formData.coachId}
                  onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                  label="Coach"
                >
                  {state.coaches.map((coach) => (
                    <MenuItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  label="Class"
                >
                  {availableClasses.map((className) => (
                    <MenuItem key={className} value={className}>
                      {className}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.forKids}
                    onChange={(e) => setFormData({ ...formData, forKids: e.target.checked })}
                  />
                }
                label="For Kids"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.forAdults}
                    onChange={(e) => setFormData({ ...formData, forAdults: e.target.checked })}
                  />
                }
                label="For Adults"
              />
            </Grid>
            {formData.forKids && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kids Start Age"
                    type="number"
                    value={formData.kidsStartAge}
                    onChange={(e) => setFormData({ ...formData, kidsStartAge: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Kids End Age"
                    type="number"
                    value={formData.kidsEndAge}
                    onChange={(e) => setFormData({ ...formData, kidsEndAge: e.target.value })}
                  />
                </Grid>
              </>
            )}
            {formData.forAdults && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Adults Start Age"
                    type="number"
                    value={formData.adultsStartAge}
                    onChange={(e) => setFormData({ ...formData, adultsStartAge: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Adults End Age"
                    type="number"
                    value={formData.adultsEndAge}
                    onChange={(e) => setFormData({ ...formData, adultsEndAge: e.target.value })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
