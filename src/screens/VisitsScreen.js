import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import { useApp } from '../context/AppContext';
import { format, startOfDay, isSameDay, parseISO } from 'date-fns';

export default function VisitsScreen() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [cancelledLessons, setCancelledLessons] = useState([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lessonToCancel, setLessonToCancel] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-select current day's lesson and coach
  useEffect(() => {
    const today = new Date();
    const dayName = format(today, 'EEEE');
    const todayLessons = state.lessons.filter(
      l => l.dayOfWeek === dayName && !l.cancelled
    );
    
    if (todayLessons.length > 0) {
      const firstLesson = todayLessons[0];
      setSelectedLesson(firstLesson.id);
      setSelectedCoach(firstLesson.coachId);
    }
  }, [state.lessons]);

  const getStudentsForLesson = () => {
    if (!selectedLesson) return [];
    const lesson = state.lessons.find(l => l.id === selectedLesson);
    if (!lesson) return [];

    return state.students.filter(student => {
      // Check if student is enrolled in this class
      const hasClass = student.classes?.includes(lesson.className);
      if (!hasClass) return false;

      // Check age restrictions
      if (lesson.forKids && !student.isAdult) {
        if (lesson.kidsStartAge || lesson.kidsEndAge) {
          // Age filtering would go here if we had age data
        }
        return true;
      }
      if (lesson.forAdults && student.isAdult) {
        if (lesson.adultsStartAge || lesson.adultsEndAge) {
          // Age filtering would go here if we had age data
        }
        return true;
      }
      return false;
    });
  };

  const handleToggleVisit = (studentId) => {
    if (!selectedLesson || !selectedDate) return;

    const existingVisit = state.visits.find(
      v => v.date === selectedDate && v.lessonId === selectedLesson && v.studentId === studentId
    );

    if (existingVisit) {
      // Remove visit
      dispatch({
        type: 'REMOVE_VISIT',
        payload: { id: existingVisit.id },
      });
      
      // Increment lessons remaining back for student
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: {
            ...student,
            lessonsRemaining: (student.lessonsRemaining || 0) + 1,
          },
        });
      }
    } else {
      // Add visit
      const lesson = state.lessons.find(l => l.id === selectedLesson);
      dispatch({
        type: 'ADD_VISIT',
        payload: {
          id: Date.now().toString(),
          date: selectedDate,
          lessonId: selectedLesson,
          studentId: studentId,
          coachId: lesson?.coachId || '',
          className: lesson?.className || '',
        },
      });

      // Decrement lessons remaining for student
      const student = state.students.find(s => s.id === studentId);
      if (student && (student.lessonsRemaining || 0) > 0) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: {
            ...student,
            lessonsRemaining: (student.lessonsRemaining || 0) - 1,
          },
        });
      }
    }
  };

  const hasVisited = (studentId) => {
    return state.visits.some(
      v => v.date === selectedDate && v.lessonId === selectedLesson && v.studentId === studentId
    );
  };

  const handleCancelLesson = () => {
    if (!lessonToCancel) return;
    const lesson = state.lessons.find(l => l.id === lessonToCancel);
    if (lesson) {
      dispatch({ type: 'CANCEL_LESSON', payload: { id: lessonToCancel } });
      setCancelledLessons([...cancelledLessons, lessonToCancel]);
    }
    setCancelDialogOpen(false);
    setLessonToCancel(null);
  };

  const handleUndoCancel = (lessonId) => {
    dispatch({ type: 'UNDO_CANCEL_LESSON', payload: { id: lessonId } });
    setCancelledLessons(cancelledLessons.filter(id => id !== lessonId));
  };

  const getSelectedLessonData = () => {
    return state.lessons.find(l => l.id === selectedLesson);
  };

  const getCoachName = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    return coach ? coach.name : 'Unknown';
  };

  const availableLessons = state.lessons.filter(l => {
    if (l.cancelled) return false;
    if (selectedDate) {
      const date = parseISO(selectedDate);
      const dayName = format(date, 'EEEE');
      return l.dayOfWeek === dayName;
    }
    return true;
  });

  const students = getStudentsForLesson();
  const selectedLessonData = getSelectedLessonData();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Track Visits
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Lesson</InputLabel>
            <Select
              value={selectedLesson}
              onChange={(e) => {
                setSelectedLesson(e.target.value);
                const lesson = state.lessons.find(l => l.id === e.target.value);
                if (lesson) setSelectedCoach(lesson.coachId);
              }}
              label="Lesson"
            >
              {availableLessons.map((lesson) => (
                <MenuItem key={lesson.id} value={lesson.id}>
                  {lesson.className} - {lesson.startTime} ({getCoachName(lesson.coachId)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Coach</InputLabel>
            <Select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
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
      </Grid>

      {selectedLessonData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedLessonData.className}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedLessonData.dayOfWeek} • {selectedLessonData.startTime} - {selectedLessonData.endTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coach: {getCoachName(selectedLessonData.coachId)}
                </Typography>
              </Box>
              {!selectedLessonData.cancelled && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setLessonToCancel(selectedLessonData.id);
                    setCancelDialogOpen(true);
                  }}
                >
                  Cancel Class
                </Button>
              )}
              {selectedLessonData.cancelled && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<UndoIcon />}
                  onClick={() => handleUndoCancel(selectedLessonData.id)}
                >
                  Undo Cancel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedLesson && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Students ({students.length})
          </Typography>
          <Grid container spacing={2}>
            {students.map((student) => {
              const visited = hasVisited(student.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={student.id}>
                  <Card
                    sx={{
                      border: visited ? '2px solid #388e3c' : '2px solid transparent',
                      bgcolor: visited ? 'success.light' : 'background.paper',
                    }}
                  >
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={visited}
                            onChange={() => handleToggleVisit(student.id)}
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Lessons: {student.lessonsRemaining || 0}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {!selectedLesson && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Please select a date and lesson to track visits
          </Typography>
        </Box>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this lesson? You can undo this action later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button onClick={handleCancelLesson} variant="contained" color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
