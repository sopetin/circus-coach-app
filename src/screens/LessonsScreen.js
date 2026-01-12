import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  Popover,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, addDays, isSameDay, eachDayOfInterval, getDay, endOfWeek } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function LessonsScreen() {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dayOfWeek: '',
    startTime: '10:00',
    coachId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    participants: [],
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [mobileSelectedDay, setMobileSelectedDay] = useState(new Date()); // For mobile one-day view
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [participantDrawerOpen, setParticipantDrawerOpen] = useState(false);
  const [editingLessonForParticipants, setEditingLessonForParticipants] = useState(null);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Changed from 'sm' to 'md' for better mobile detection

  // Sync mobileSelectedDay with calendarDate on mount and when calendarDate changes
  useEffect(() => {
    // Sync mobile day with the week's start date when calendar changes
    const weekStart = startOfWeek(calendarDate, { weekStartsOn: 1 });
    if (!isSameDay(mobileSelectedDay, weekStart) && !isSameDay(mobileSelectedDay, calendarDate)) {
      // Set to today if it's in the current week, otherwise set to week start
      const today = new Date();
      const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 1 });
      if (today >= weekStart && today <= weekEnd) {
        setMobileSelectedDay(today);
      } else {
        setMobileSelectedDay(weekStart);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarDate]); // Only depend on calendarDate

  // Generate occurrences for a lesson series
  const generateOccurrences = (lesson) => {
    if (!lesson.startDate || !lesson.endDate) return [];
    const start = new Date(lesson.startDate);
    const end = new Date(lesson.endDate);
    const dayIndex = daysOfWeek.indexOf(lesson.dayOfWeek);
    const occurrences = [];
    
    let current = startOfWeek(start);
    while (current <= end) {
      const dayOfWeekIndex = getDay(current);
      if (dayOfWeekIndex === dayIndex) {
        occurrences.push({
          id: `${lesson.id}-${format(current, 'yyyy-MM-dd')}`,
          date: format(current, 'yyyy-MM-dd'),
          lessonId: lesson.id,
        });
      }
      current = addDays(current, 1);
    }
    return occurrences;
  };

  // Get all occurrences for calendar
  const allOccurrences = useMemo(() => {
    const occurrences = [];
    state.lessons.forEach(lesson => {
      const lessonOccs = generateOccurrences(lesson);
      lessonOccs.forEach(occ => {
        const cancelled = state.lessonOccurrences?.[occ.id]?.cancelled;
        occurrences.push({
          ...occ,
          lesson,
          cancelled,
        });
      });
    });
    return occurrences;
  }, [state.lessons, state.lessonOccurrences]);

  // Get coach color
  const getCoachColor = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    if (!coach) return '#757575';
    const colors = ['#d32f2f', '#ff6f00', '#fbc02d', '#388e3c', '#1976d2', '#7b1fa2'];
    const index = state.coaches.indexOf(coach) % colors.length;
    return colors[index];
  };

  const handleOpenDialog = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        name: lesson.name || '',
        dayOfWeek: lesson.dayOfWeek || '',
        startTime: lesson.startTime || '10:00',
        coachId: lesson.coachId || '',
        startDate: lesson.startDate || format(new Date(), 'yyyy-MM-dd'),
        endDate: lesson.endDate || '',
        participants: lesson.participants || [],
      });
    } else {
      setEditingLesson(null);
      setFormData({
        name: '',
        dayOfWeek: '',
        startTime: '10:00',
        coachId: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        participants: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLesson(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.dayOfWeek || !formData.coachId || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const lessonData = {
      id: editingLesson?.id || Date.now().toString(),
      ...formData,
    };

    if (editingLesson) {
      // Sync participants with student classSeries
      const oldParticipants = editingLesson.participants || [];
      const newParticipants = formData.participants || [];
      
      // Find students that were removed
      const removedStudents = oldParticipants.filter(id => !newParticipants.includes(id));
      // Find students that were added
      const addedStudents = newParticipants.filter(id => !oldParticipants.includes(id));
      
      // Update students' classSeries
      removedStudents.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          const updatedClassSeries = (student.classSeries || []).filter(id => id !== lessonData.id);
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              ...student,
              classSeries: updatedClassSeries,
            },
          });
        }
      });
      
      addedStudents.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          const updatedClassSeries = [...(student.classSeries || []), lessonData.id];
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              ...student,
              classSeries: updatedClassSeries,
            },
          });
        }
      });
      
      dispatch({ type: 'UPDATE_LESSON_SERIES', payload: lessonData });
    } else {
      // For new class, sync participants with students
      formData.participants.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          const updatedClassSeries = [...(student.classSeries || []), lessonData.id];
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              ...student,
              classSeries: updatedClassSeries,
            },
          });
        }
      });
      
      dispatch({ type: 'ADD_LESSON_SERIES', payload: lessonData });
    }
    handleCloseDialog();
  };

  const handleOccurrenceClick = (event, occurrence) => {
    setSelectedOccurrence(occurrence);
    setAnchorEl(event.currentTarget);
  };

  const handleCancelOccurrence = () => {
    if (!selectedOccurrence) return;
    dispatch({
      type: 'CANCEL_LESSON_OCCURRENCE',
      payload: {
        occurrenceId: selectedOccurrence.id,
        ...selectedOccurrence,
      },
    });
    setAnchorEl(null);
    setSelectedOccurrence(null);
  };

  const handleUndoCancel = () => {
    if (!selectedOccurrence) return;
    dispatch({
      type: 'UNDO_CANCEL_LESSON_OCCURRENCE',
      payload: {
        occurrenceId: selectedOccurrence.id,
        ...selectedOccurrence,
      },
    });
    setAnchorEl(null);
    setSelectedOccurrence(null);
  };

  const handleParticipantToggle = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(studentId)
        ? prev.participants.filter((id) => id !== studentId)
        : [...prev.participants, studentId],
    }));
  };

  const getCoachName = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    return coach ? coach.name : 'Unknown';
  };

  const getStudentName = (studentId) => {
    const student = state.students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  // Week calendar rendering - start with Monday
  const weekStart = startOfWeek(calendarDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getOccurrencesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allOccurrences.filter(occ => occ.date === dateStr);
  };

  // Get day names for the week (Monday to Sunday)
  const dayNames = weekDays.map(day => {
    const dayIndex = getDay(day);
    return daysOfWeek[dayIndex].substring(0, 3); // Convert to Mon, Tue, etc.
  });

  const handleOpenParticipantEditor = (lesson) => {
    setEditingLessonForParticipants(lesson);
    // Set formData participants to match the lesson
    setFormData({
      ...formData,
      participants: lesson.participants || [],
    });
    setParticipantDrawerOpen(true);
  };

  const handleSaveParticipants = () => {
    if (!editingLessonForParticipants) return;
    
    const isNewLesson = editingLessonForParticipants.id === 'new';
    const lesson = isNewLesson ? null : state.lessons.find(l => l.id === editingLessonForParticipants.id);
    
    const oldParticipants = (lesson?.participants || []);
    const newParticipants = formData.participants || [];
    
    if (isNewLesson) {
      // For new lesson, just update formData
      setFormData({ ...formData, participants: newParticipants });
    } else if (lesson) {
      // Find students that were removed
      const removedStudents = oldParticipants.filter(id => !newParticipants.includes(id));
      // Find students that were added
      const addedStudents = newParticipants.filter(id => !oldParticipants.includes(id));
      
      // Update students' classSeries
      removedStudents.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          const updatedClassSeries = (student.classSeries || []).filter(id => id !== lesson.id);
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              ...student,
              classSeries: updatedClassSeries,
            },
          });
        }
      });
      
      addedStudents.forEach(studentId => {
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          const updatedClassSeries = [...(student.classSeries || []), lesson.id];
          dispatch({
            type: 'UPDATE_STUDENT',
            payload: {
              ...student,
              classSeries: updatedClassSeries,
            },
          });
        }
      });
      
      dispatch({ 
        type: 'UPDATE_LESSON_SERIES', 
        payload: {
          ...lesson,
          participants: newParticipants,
        }
      });
    }
    
    setParticipantDrawerOpen(false);
    setEditingLessonForParticipants(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Classes Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Class Series
        </Button>
      </Box>

      {/* Calendar - Week view for desktop, One-day view for mobile */}
      {isMobile ? (
        // Mobile: One-day calendar with day switcher
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {format(mobileSelectedDay, 'EEEE, MMM d, yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => setMobileSelectedDay(addDays(mobileSelectedDay, -1))}
                  size="small"
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Button 
                  onClick={() => setMobileSelectedDay(new Date())} 
                  size="small"
                  variant="outlined"
                >
                  Today
                </Button>
                <IconButton 
                  onClick={() => setMobileSelectedDay(addDays(mobileSelectedDay, 1))}
                  size="small"
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                minHeight: 200,
                border: '2px solid',
                borderColor: isSameDay(mobileSelectedDay, new Date()) ? 'primary.main' : 'divider',
                p: 2,
                cursor: 'pointer',
                bgcolor: isSameDay(mobileSelectedDay, new Date()) ? 'primary.light' : 'background.paper',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {daysOfWeek[getDay(mobileSelectedDay)]}
              </Typography>
              {(() => {
                const occurrences = getOccurrencesForDate(mobileSelectedDay);
                if (occurrences.length === 0) {
                  return (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No classes scheduled
                    </Typography>
                  );
                }
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {occurrences.map((occ) => {
                      const color = getCoachColor(occ.lesson.coachId);
                      return (
                        <Chip
                          key={occ.id}
                          label={`${occ.lesson.startTime} ${occ.lesson.name}`}
                          size="medium"
                          sx={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            height: 'auto',
                            py: 1.5,
                            fontSize: '0.9rem',
                            bgcolor: occ.cancelled ? 'grey.400' : color,
                            color: 'white',
                            textDecoration: occ.cancelled ? 'line-through' : 'none',
                            opacity: occ.cancelled ? 0.5 : 1,
                            cursor: 'pointer',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOccurrenceClick(e, occ);
                          }}
                        />
                      );
                    })}
                  </Box>
                );
              })()}
            </Box>
          </CardContent>
        </Card>
      ) : (
        // Desktop: Week calendar view
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </Typography>
              <Box>
                <IconButton onClick={() => setCalendarDate(addDays(calendarDate, -7))}>
                  <ArrowBackIosIcon />
                </IconButton>
                <Button onClick={() => setCalendarDate(new Date())} size="small">Today</Button>
                <IconButton onClick={() => setCalendarDate(addDays(calendarDate, 7))}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>
            <Grid container spacing={1}>
              {(() => {
                // Calculate max occurrences for any day to set consistent height
                const maxOccurrences = Math.max(...weekDays.map(day => getOccurrencesForDate(day).length), 1);
                const baseHeight = 80; // Base height for header
                const chipHeight = 28; // Height per chip
                const chipSpacing = 4; // Spacing between chips
                const minDayHeight = baseHeight + (maxOccurrences * (chipHeight + chipSpacing));
                
                return dayNames.map((day, idx) => {
                  const dayDate = weekDays[idx];
                  const occurrences = getOccurrencesForDate(dayDate);
                  const isToday = isSameDay(dayDate, new Date());
                  return (
                    <Grid item xs={12/7} key={format(dayDate, 'yyyy-MM-dd')}>
                      <Box
                        sx={{
                          minHeight: minDayHeight,
                          border: '1px solid',
                          borderColor: isToday ? 'primary.main' : 'divider',
                          borderWidth: isToday ? 2 : 1,
                          p: 1,
                          cursor: occurrences.length > 0 ? 'pointer' : 'default',
                          bgcolor: isToday ? 'primary.light' : 'background.paper',
                          borderRadius: 1,
                        }}
                      onClick={(e) => {
                        if (occurrences.length > 0) {
                          handleOccurrenceClick(e, occurrences[0]);
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {day}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: isToday ? 600 : 400, mb: 1 }}>
                        {format(dayDate, 'd')}
                      </Typography>
                      {occurrences.map((occ) => {
                        const color = getCoachColor(occ.lesson.coachId);
                        return (
                          <Chip
                            key={occ.id}
                            label={`${occ.lesson.startTime} ${occ.lesson.name}`}
                            size="small"
                            sx={{
                              width: '100%',
                              mt: 0.5,
                              fontSize: '0.7rem',
                              bgcolor: occ.cancelled ? 'grey.400' : color,
                              color: 'white',
                              textDecoration: occ.cancelled ? 'line-through' : 'none',
                              opacity: occ.cancelled ? 0.5 : 1,
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOccurrenceClick(e, occ);
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Grid>
                );
              })})()}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Lesson Series List */}
      <Grid container spacing={2}>
        {state.lessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {lesson.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.dayOfWeek} • {lesson.startTime} (1 hour)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coach: {getCoachName(lesson.coachId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(lesson.startDate), 'MMM d')} - {lesson.endDate ? format(new Date(lesson.endDate), 'MMM d, yyyy') : 'Ongoing'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(lesson)}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Participants ({lesson.participants?.length || 0}):
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PeopleIcon />}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          participants: lesson.participants || [],
                        });
                        handleOpenParticipantEditor(lesson);
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {lesson.participants?.slice(0, 5).map((studentId) => (
                      <Chip
                        key={studentId}
                        label={getStudentName(studentId)}
                        size="small"
                      />
                    ))}
                    {lesson.participants && lesson.participants.length > 5 && (
                      <Chip
                        label={`+${lesson.participants.length - 5} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {state.lessons.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No class series configured yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Add First Class Series
          </Button>
        </Box>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: { zIndex: 1400 }
        }}
      >
        <DialogTitle>
          {editingLesson ? 'Edit Class Series' : 'Add New Class Series'}
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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  Participants:
                </Typography>
                <Button
                  size="small"
                  startIcon={<PeopleIcon />}
                  onClick={() => {
                    setEditingLessonForParticipants(editingLesson || { id: 'new', ...formData });
                    setParticipantDrawerOpen(true);
                  }}
                >
                  Edit Participants ({formData.participants.length})
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: 40, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {formData.participants.length > 0 ? (
                  formData.participants.slice(0, 10).map((studentId) => (
                    <Chip
                      key={studentId}
                      label={getStudentName(studentId)}
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No participants selected. Click "Edit Participants" to add.
                  </Typography>
                )}
                {formData.participants.length > 10 && (
                  <Chip
                    label={`+${formData.participants.length - 10} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
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

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          setSelectedOccurrence(null);
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          {selectedOccurrence && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {selectedOccurrence.lesson.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(selectedOccurrence.date), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedOccurrence.lesson.startTime} (1 hour)
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleOpenDialog(selectedOccurrence.lesson);
                    setAnchorEl(null);
                    setSelectedOccurrence(null);
                  }}
                  fullWidth
                >
                  Edit Parent Series
                </Button>
                {selectedOccurrence.cancelled ? (
                  <Button
                    variant="outlined"
                    startIcon={<UndoIcon />}
                    onClick={handleUndoCancel}
                    fullWidth
                  >
                    Undo Cancel
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelOccurrence}
                    fullWidth
                  >
                    Cancel Occurrence
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Popover>

      {/* Participant Editor Drawer */}
      <Drawer
        anchor="right"
        open={participantDrawerOpen}
        onClose={() => {
          setParticipantDrawerOpen(false);
          setEditingLessonForParticipants(null);
          setParticipantSearchQuery('');
        }}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 500, md: 600 },
            zIndex: 1400
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', pb: 10 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Edit Participants
          </Typography>
          {editingLessonForParticipants && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {editingLessonForParticipants.name} • {editingLessonForParticipants.dayOfWeek} {editingLessonForParticipants.startTime}
              </Typography>
              <TextField
                fullWidth
                placeholder="Search students..."
                value={participantSearchQuery}
                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                <Grid container spacing={2}>
                  {state.students
                    .filter(s => s.isActive !== false)
                    .filter(s => {
                      if (!participantSearchQuery.trim()) return true;
                      const query = participantSearchQuery.toLowerCase();
                      return s.name.toLowerCase().includes(query);
                    })
                    .map((student) => {
                    const isSelected = formData.participants.includes(student.id);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={student.id}>
                        <Card
                          sx={{
                            border: isSelected ? '2px solid' : '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.light' : 'background.paper',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: isSelected ? 'primary.light' : 'action.hover',
                            },
                          }}
                          onClick={() => handleParticipantToggle(student.id)}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleParticipantToggle(student.id)}
                                />
                              }
                              label={
                                <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                  {student.name}
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                {state.students.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No students available. Add students first.
                  </Typography>
                )}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                pt: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                position: 'sticky',
                bottom: 0,
                bgcolor: 'background.paper',
                zIndex: 1300,
                pb: 2
              }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setParticipantDrawerOpen(false);
                    setEditingLessonForParticipants(null);
                    setParticipantSearchQuery('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSaveParticipants}
                >
                  Save ({formData.participants.length} selected)
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
