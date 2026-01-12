import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, getDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function VisitsScreen() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const [mobileSelectedDay, setMobileSelectedDay] = useState(new Date()); // For mobile one-day view
  const [selectedCoach, setSelectedCoach] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lessonToCancel, setLessonToCancel] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [profileTabValue, setProfileTabValue] = useState(0);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    classSeries: [],
    lastPaymentDate: '',
    lessonsCount: 8,
    remainingLessons: 8, // Editable remaining lessons
    isActive: true,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get coach color (same as LessonsScreen)
  const getCoachColor = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    if (!coach) return '#757575';
    const colors = ['#d32f2f', '#ff6f00', '#fbc02d', '#388e3c', '#1976d2', '#7b1fa2'];
    const index = state.coaches.indexOf(coach) % colors.length;
    return colors[index];
  };

  // Generate occurrences for a lesson series
  const generateOccurrences = (lesson) => {
    if (!lesson.startDate || !lesson.endDate) return [];
    const start = new Date(lesson.startDate);
    const end = new Date(lesson.endDate);
    const dayIndex = daysOfWeek.indexOf(lesson.dayOfWeek);
    const occurrences = [];
    
    let current = startOfWeek(start, { weekStartsOn: 0 });
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

  // Get all occurrences for the week - start with Monday
  const weekOccurrences = useMemo(() => {
    const occurrences = [];
    const weekStart = startOfWeek(calendarWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(calendarWeek, { weekStartsOn: 1 });
    
    state.lessons.forEach(lesson => {
      const lessonOccs = generateOccurrences(lesson);
      lessonOccs.forEach(occ => {
        const occDate = new Date(occ.date);
        if (occDate >= weekStart && occDate <= weekEnd) {
          const cancelled = state.lessonOccurrences?.[occ.id]?.cancelled;
          occurrences.push({
            ...occ,
            lesson,
            cancelled,
          });
        }
      });
    });
    return occurrences;
  }, [state.lessons, state.lessonOccurrences, calendarWeek]);

  // Get available lessons for selected date
  const availableLessons = useMemo(() => {
    if (!selectedDate) return [];
    const date = parseISO(selectedDate);
    const dayIndex = getDay(date);
    const dayName = daysOfWeek[dayIndex];
    
    return state.lessons.filter(l => {
      if (l.dayOfWeek !== dayName) return false;
      if (!l.startDate || !l.endDate) return false;
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return date >= start && date <= end;
    });
  }, [selectedDate, state.lessons]);

  // Get unique coaches for the day
  const availableCoaches = useMemo(() => {
    const coachIds = [...new Set(availableLessons.map(l => l.coachId))];
    return state.coaches.filter(c => coachIds.includes(c.id));
  }, [availableLessons, state.coaches]);

  // Initialize on mount and when date changes
  useEffect(() => {
    if (availableLessons.length > 0 && availableCoaches.length > 0) {
      if (!isInitialized || !selectedCoach) {
        // Always select first coach
        setSelectedCoach(availableCoaches[0].id);
        setIsInitialized(true);
      }
    } else if (availableLessons.length === 0) {
      // No classes available for this day, clear selections
      setSelectedCoach('');
      setSelectedLesson('');
      setIsInitialized(false);
    }
  }, [selectedDate, availableLessons.length, availableCoaches.length, isInitialized, selectedCoach]);

  // Auto-select first class when coach is selected or changes
  useEffect(() => {
    if (selectedCoach && availableLessons.length > 0) {
      const coachLessons = availableLessons.filter(l => l.coachId === selectedCoach);
      if (coachLessons.length > 0) {
        // Check if current selected lesson is valid for this coach
        const isValidLesson = coachLessons.find(l => l.id === selectedLesson);
        if (!isValidLesson || !selectedLesson) {
          // Select first class for the coach
          setSelectedLesson(coachLessons[0].id);
        }
      } else {
        setSelectedLesson('');
      }
    } else if (!selectedCoach) {
      setSelectedLesson('');
    }
  }, [selectedCoach, availableLessons, selectedDate, selectedLesson]);

  // Keep selectedStudentForProfile in sync with state updates
  useEffect(() => {
    if (selectedStudentForProfile && profileDialogOpen) {
      const updatedStudent = state.students.find(s => s.id === selectedStudentForProfile.id);
      if (updatedStudent) {
        setSelectedStudentForProfile(updatedStudent);
        // Update form data
        const payments = updatedStudent.payments || [];
        const lastPayment = payments.length > 0 
          ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : null;
        const actualClassSeries = state.lessons
          .filter(lesson => lesson.participants?.includes(updatedStudent.id))
          .map(lesson => lesson.id);
        const mergedClassSeries = [...new Set([...(updatedStudent.classSeries || []), ...actualClassSeries])];
        
        const lessons = calculateStudentLessons(updatedStudent);
        setProfileFormData({
          name: updatedStudent.name,
          classSeries: mergedClassSeries,
          lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'yyyy-MM-dd') : '',
          lessonsCount: updatedStudent.lessonsCount || 0,
          remainingLessons: lessons.remainingLessons,
          isActive: updatedStudent.isActive !== false,
        });
      }
    }
  }, [state.students, profileDialogOpen]);

  // Calculate lessons for a student (same as StudentsScreen)
  const calculateStudentLessons = (student) => {
    if (!student || !student.classSeries || student.classSeries.length === 0) {
      return {
        lastPaymentDate: null,
        totalLessons: 0,
        visitedLessons: [],
        missedLessons: [],
        remainingLessons: 0,
      };
    }

    // Get last payment date - use student.lastPaymentDate if available, otherwise from payments array
    let lastPaymentDate = null;
    if (student.lastPaymentDate) {
      lastPaymentDate = new Date(student.lastPaymentDate);
    } else {
      const payments = student.payments || [];
      const lastPayment = payments.length > 0 
        ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      lastPaymentDate = lastPayment ? new Date(lastPayment.date) : null;
    }

    if (!lastPaymentDate) {
      return {
        lastPaymentDate: null,
        totalLessons: 0,
        visitedLessons: [],
        missedLessons: [],
        remainingLessons: 0,
      };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const assignedSeries = state.lessons.filter(l => student.classSeries.includes(l.id));
    
    const allLessons = [];
    assignedSeries.forEach(series => {
      if (!series.startDate || !series.endDate) return;
      
      const seriesStart = new Date(series.startDate);
      const seriesEnd = new Date(series.endDate);
      const dayIndex = daysOfWeek.indexOf(series.dayOfWeek);
      
      let current = new Date(lastPaymentDate);
      if (getDay(current) !== dayIndex) {
        const daysUntilNext = (dayIndex - getDay(current) + 7) % 7;
        current = addDays(current, daysUntilNext || 7);
      }
      
      while (current <= today && current <= seriesEnd && current >= seriesStart) {
        const lessonDate = format(current, 'yyyy-MM-dd');
        const occurrenceId = `${series.id}-${lessonDate}`;
        const cancelled = state.lessonOccurrences?.[occurrenceId]?.cancelled;
        
        if (!cancelled) {
          allLessons.push({
            date: lessonDate,
            dateObj: new Date(current),
            seriesId: series.id,
            seriesName: series.name,
            startTime: series.startTime,
            dayOfWeek: series.dayOfWeek,
            occurrenceId,
          });
        }
        current = addDays(current, 7);
      }
    });

    const visitedLessons = state.visits
      .filter(v => v.studentId === student.id)
      .map(v => ({
        date: v.date,
        dateObj: new Date(v.date),
        seriesId: v.lessonId,
        seriesName: v.className,
      }))
      .filter(v => {
        const visitDate = v.dateObj;
        return visitDate >= lastPaymentDate && visitDate <= today;
      });

    const visitedDates = new Set(visitedLessons.map(v => v.date));
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const missedLessons = allLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(23, 59, 59, 999);
      const cancelled = state.lessonOccurrences?.[lesson.occurrenceId]?.cancelled;
      return !cancelled && !visitedDates.has(lesson.date) && lessonDate < now;
    });

    // Remaining lessons = lessonsCount (purchased) - visited only
    // Only count actual visits (when student was marked as visited), not missed lessons
    // This ensures students cannot have negative balance if they don't participate at all
    const lessonsCount = student.lessonsCount || 0;
    const remainingLessons = lessonsCount - visitedLessons.length;
    const totalScheduled = allLessons.length;

    return {
      lastPaymentDate,
      totalLessons: totalScheduled,
      visitedLessons: visitedLessons.sort((a, b) => a.dateObj - b.dateObj),
      missedLessons: missedLessons.sort((a, b) => a.dateObj - b.dateObj),
      remainingLessons: remainingLessons, // Allow negative values (only if they visit more than purchased)
    };
  };

  const getStudentVisits = (studentId) => {
    return state.visits.filter(v => v.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleProfileClassSeriesToggle = (seriesId) => {
    setProfileFormData((prev) => ({
      ...prev,
      classSeries: prev.classSeries.includes(seriesId)
        ? prev.classSeries.filter((id) => id !== seriesId)
        : [...prev.classSeries, seriesId],
    }));
  };

  const handleProfileSave = () => {
    if (!selectedStudentForProfile || !profileFormData.name.trim()) return;

    const studentData = {
      id: selectedStudentForProfile.id,
      name: profileFormData.name,
      classSeries: profileFormData.classSeries,
      lastPaymentDate: profileFormData.lastPaymentDate,
      lessonsCount: profileFormData.lessonsCount,
      isActive: profileFormData.isActive,
      payments: selectedStudentForProfile.payments || [],
      visits: selectedStudentForProfile.visits || [],
      editHistory: selectedStudentForProfile.editHistory || [],
    };

    // Sync classSeries with class participants (bidirectional sync)
    state.lessons.forEach(lesson => {
      const wasParticipant = lesson.participants?.includes(selectedStudentForProfile.id);
      const isNowParticipant = profileFormData.classSeries.includes(lesson.id);
      
      if (wasParticipant && !isNowParticipant) {
        const updatedLesson = {
          ...lesson,
          participants: (lesson.participants || []).filter(id => id !== selectedStudentForProfile.id),
        };
        dispatch({ type: 'UPDATE_LESSON_SERIES', payload: updatedLesson });
      } else if (!wasParticipant && isNowParticipant) {
        const updatedLesson = {
          ...lesson,
          participants: [...(lesson.participants || []), selectedStudentForProfile.id],
        };
        dispatch({ type: 'UPDATE_LESSON_SERIES', payload: updatedLesson });
      }
    });
    
    dispatch({ type: 'UPDATE_STUDENT', payload: studentData });
    
    // Update local state
    const updatedStudent = state.students.find(s => s.id === studentData.id);
    if (updatedStudent) {
      setSelectedStudentForProfile(updatedStudent);
    }
    
    // Close dialog after save
    setProfileDialogOpen(false);
    setSelectedStudentForProfile(null);
    setProfileTabValue(0);
  };

  const handleProfileRemovePayment = (paymentId) => {
    if (!selectedStudentForProfile) return;
    const updatedPayments = (selectedStudentForProfile.payments || []).filter(p => p.id !== paymentId);
    
    // If this was the last payment, we might need to update lastPaymentDate
    let newLastPaymentDate = selectedStudentForProfile.lastPaymentDate;
    if (updatedPayments.length > 0) {
      const lastPayment = updatedPayments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      newLastPaymentDate = lastPayment.date;
    } else {
      newLastPaymentDate = '';
    }
    
    dispatch({
      type: 'UPDATE_STUDENT',
      payload: {
        ...selectedStudentForProfile,
        payments: updatedPayments,
        lastPaymentDate: newLastPaymentDate,
      },
    });
    
    // Update formData and selectedStudentForProfile
    setProfileFormData({
      ...profileFormData,
      lastPaymentDate: newLastPaymentDate,
    });
    
    const updatedStudent = state.students.find(s => s.id === selectedStudentForProfile.id);
    if (updatedStudent) {
      setSelectedStudentForProfile(updatedStudent);
    }
  };

  const handleProfileRemoveVisit = (visitId) => {
    dispatch({
      type: 'REMOVE_VISIT',
      payload: { id: visitId },
    });
    
    // Refresh student from state
    if (selectedStudentForProfile) {
      const updatedStudent = state.students.find(s => s.id === selectedStudentForProfile.id);
      if (updatedStudent) {
        setSelectedStudentForProfile(updatedStudent);
      }
    }
  };

  const handleProfileRemoveMissedLesson = (lesson) => {
    // Mark missed lesson as visited by adding a visit
    const lessonObj = state.lessons.find(l => l.id === lesson.seriesId);
    if (lessonObj && selectedStudentForProfile) {
      dispatch({
        type: 'ADD_VISIT',
        payload: {
          id: `${Date.now()}-${lesson.seriesId}-${selectedStudentForProfile.id}`,
          date: lesson.date,
          lessonId: lesson.seriesId,
          studentId: selectedStudentForProfile.id,
          coachId: lessonObj.coachId || '',
          className: lessonObj.name || '',
        },
      });
      
      // Refresh student from state
      const updatedStudent = state.students.find(s => s.id === selectedStudentForProfile.id);
      if (updatedStudent) {
        setSelectedStudentForProfile(updatedStudent);
      }
    }
  };

  const handleProfilePay = (student, lessons = 8) => {
    // Get the latest student data from state to ensure we have the most current information
    const latestStudent = state.students.find(s => s.id === student.id) || student;
    const currentLessons = calculateStudentLessons(latestStudent);
    
    if (currentLessons.remainingLessons >= 8) {
      alert('Student already has 8 or more lessons remaining. Cannot add more payments.');
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const payment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lessons: lessons,
      amount: 1,
    };

    // Calculate current remaining lessons before payment
    // Then set payment date to today (resets the period) and add 8 to remaining
    // Since lastPaymentDate will be today, visited/missed will be 0, so:
    // new lessonsCount = current remaining lessons + 8
    const currentRemainingLessons = currentLessons.remainingLessons;
    const newLessonsCount = currentRemainingLessons + lessons;

    dispatch({
      type: 'UPDATE_STUDENT',
      payload: {
        ...latestStudent,
        lastPaymentDate: today,
        lessonsCount: newLessonsCount,
        payments: [...(latestStudent.payments || []), payment],
      },
    });

    // Update form data
    const updatedLessons = calculateStudentLessons({
      ...latestStudent,
      lastPaymentDate: today,
      lessonsCount: newLessonsCount,
    });
    setProfileFormData({
      ...profileFormData,
      lastPaymentDate: today,
      lessonsCount: newLessonsCount,
      remainingLessons: updatedLessons.remainingLessons,
    });

    // Refresh student from state
    const updatedStudent = state.students.find(s => s.id === student.id);
    if (updatedStudent) {
      setSelectedStudentForProfile(updatedStudent);
    }
  };

  // Get students for selected lesson (only active students, sorted by name)
  const getStudentsForLesson = () => {
    if (!selectedLesson) return [];
    
    const lesson = state.lessons.find(l => l.id === selectedLesson);
    if (!lesson || !lesson.participants) return [];
    
    return state.students
      .filter(s => lesson.participants.includes(s.id) && s.isActive !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Calculate available lessons for a student
  // Only count actual visits (when student was marked as visited), not missed lessons
  const calculateStudentAvailableLessons = (student) => {
    if (!student || !student.classSeries || student.classSeries.length === 0) {
      return 0;
    }

    // Get last payment date - use student.lastPaymentDate if available, otherwise from payments array
    let lastPaymentDate = null;
    if (student.lastPaymentDate) {
      lastPaymentDate = new Date(student.lastPaymentDate);
    } else {
      const payments = student.payments || [];
      const lastPayment = payments.length > 0 
        ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      lastPaymentDate = lastPayment ? new Date(lastPayment.date) : null;
    }

    if (!lastPaymentDate) {
      return 0;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get visited lessons (only actual visits, not missed)
    // Count all visits since last payment, regardless of which week we're viewing
    const visitedLessons = state.visits
      .filter(v => v.studentId === student.id)
      .map(v => ({
        date: v.date,
        dateObj: new Date(v.date),
      }))
      .filter(v => {
        const visitDate = v.dateObj;
        // Count all visits since last payment, not just up to today
        // This ensures the counter works correctly for any week
        return visitDate >= lastPaymentDate;
      });

    // Remaining lessons = lessonsCount (purchased) - visited only
    // This ensures students cannot have negative balance if they don't participate at all
    const lessonsCount = student.lessonsCount || 0;
    const remainingLessons = lessonsCount - visitedLessons.length;
    return remainingLessons; // Allow negative values (only if they visit more than purchased)
  };

  const handleToggleVisit = (studentId) => {
    if (!selectedLesson || !selectedDate) return;

    const existingVisit = state.visits.find(
      v => v.date === selectedDate && v.lessonId === selectedLesson && v.studentId === studentId
    );

    if (existingVisit) {
      dispatch({
        type: 'REMOVE_VISIT',
        payload: { id: existingVisit.id },
      });
    } else {
      const lesson = state.lessons.find(l => l.id === selectedLesson);
      if (lesson) {
        dispatch({
          type: 'ADD_VISIT',
          payload: {
            id: `${Date.now()}-${selectedLesson}-${studentId}`,
            date: selectedDate,
            lessonId: selectedLesson,
            studentId: studentId,
            coachId: lesson.coachId || '',
            className: lesson.name || '',
          },
        });
      }
    }
    // Force a re-render by updating a state that triggers recalculation
    // The component will automatically re-render when state.visits changes via context
  };

  const hasVisited = (studentId) => {
    if (!selectedLesson) return false;
    return state.visits.some(
      v => v.date === selectedDate && v.lessonId === selectedLesson && v.studentId === studentId
    );
  };

  const handleCancelLesson = () => {
    if (!lessonToCancel) return;
    const lesson = state.lessons.find(l => l.id === lessonToCancel);
    if (lesson) {
      const occurrenceId = `${lessonToCancel}-${selectedDate}`;
      dispatch({
        type: 'CANCEL_LESSON_OCCURRENCE',
        payload: {
          occurrenceId,
          date: selectedDate,
          lessonId: lessonToCancel,
        },
      });
    }
    setCancelDialogOpen(false);
    setLessonToCancel(null);
  };

  const getCoachName = (coachId) => {
    const coach = state.coaches.find(c => c.id === coachId);
    return coach ? coach.name : 'Unknown';
  };

  const getLessonName = (lessonId) => {
    const lesson = state.lessons.find(l => l.id === lessonId);
    return lesson ? lesson.name : 'Unknown';
  };

  const students = getStudentsForLesson();
  const hasNegativeBalance = (student) => {
    const remaining = calculateStudentAvailableLessons(student);
    return remaining <= 0;
  };

  // Filter lessons by selected coach
  const filteredLessons = useMemo(() => {
    if (!selectedCoach) return availableLessons;
    return availableLessons.filter(l => l.coachId === selectedCoach);
  }, [availableLessons, selectedCoach]);

  // Week calendar rendering
  const weekStart = startOfWeek(calendarWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(calendarWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getOccurrencesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return weekOccurrences.filter(occ => occ.date === dateStr);
  };

  // Get day names for the week (Monday to Sunday)
  const dayNames = weekDays.map(day => {
    const dayIndex = getDay(day);
    return daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1].substring(0, 3); // Convert to Mon, Tue, etc.
  });

  const handleDateClick = (date) => {
    const newDate = format(date, 'yyyy-MM-dd');
    if (newDate !== selectedDate) {
      setSelectedDate(newDate);
      // Sync mobile day view
      if (isMobile) {
        setMobileSelectedDay(date);
      }
      // Reset selections when date changes to trigger auto-selection
      setSelectedCoach('');
      setSelectedLesson('');
      setIsInitialized(false);
    }
  };

  const handleOccurrenceClick = (occurrence) => {
    // Preselect coach and class when clicking on an event
    if (occurrence.lesson) {
      const occDate = parseISO(occurrence.date);
      setSelectedDate(occurrence.date);
      // Sync mobile day view
      if (isMobile) {
        setMobileSelectedDay(occDate);
      }
      setSelectedCoach(occurrence.lesson.coachId);
      setSelectedLesson(occurrence.lessonId);
      setIsInitialized(true);
    }
  };

  // Sync mobile day view when day changes via switcher
  const handleMobileDayChange = (newDay) => {
    setMobileSelectedDay(newDay);
    const newDate = format(newDay, 'yyyy-MM-dd');
    if (newDate !== selectedDate) {
      setSelectedDate(newDate);
      // Reset selections when date changes
      setSelectedCoach('');
      setSelectedLesson('');
      setIsInitialized(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          {selectedDate && selectedCoach && selectedLesson ? (
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {format(new Date(selectedDate), 'MMM d, yyyy')} • {getCoachName(selectedCoach)} • {getLessonName(selectedLesson)}
            </Typography>
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Track Visits
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {availableLessons.length > 0 && selectedLesson && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => {
                setLessonToCancel(selectedLesson);
                setCancelDialogOpen(true);
              }}
            >
              Cancel Class
            </Button>
          )}
        </Box>
      </Box>

      {/* Calendar with Events - Week view for desktop, One-day view for mobile */}
      {isMobile ? (
        // Mobile: One-day calendar with day switcher
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {format(mobileSelectedDay, 'EEEE, MMM d, yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  onClick={() => handleMobileDayChange(addDays(mobileSelectedDay, -1))}
                  size="small"
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Button 
                  onClick={() => handleMobileDayChange(new Date())} 
                  size="small"
                  variant="outlined"
                >
                  Today
                </Button>
                <IconButton 
                  onClick={() => handleMobileDayChange(addDays(mobileSelectedDay, 1))}
                  size="small"
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              onClick={() => {
                handleDateClick(mobileSelectedDay);
              }}
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
                const dayStr = format(mobileSelectedDay, 'yyyy-MM-dd');
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
                            handleOccurrenceClick(occ);
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </Typography>
              <Box>
                <IconButton onClick={() => setCalendarWeek(addDays(calendarWeek, -7))}>
                  <ArrowBackIosIcon />
                </IconButton>
                <Button onClick={() => setCalendarWeek(new Date())} size="small">Today</Button>
                <IconButton onClick={() => setCalendarWeek(addDays(calendarWeek, 7))}>
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
                  const dayStr = format(dayDate, 'yyyy-MM-dd');
                  const isSelected = dayStr === selectedDate;
                  const isToday = isSameDay(dayDate, new Date());
                  const occurrences = getOccurrencesForDate(dayDate);
                  return (
                    <Grid item xs={12/7} key={dayStr}>
                      <Box
                        onClick={() => handleDateClick(dayDate)}
                        sx={{
                          minHeight: minDayHeight,
                          border: isSelected ? '2px solid' : '1px solid',
                          borderColor: isSelected ? 'primary.main' : (isToday ? 'primary.main' : 'divider'),
                          borderWidth: (isSelected || isToday) ? 2 : 1,
                          p: 1,
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'grey.200' : (isToday ? 'primary.light' : 'background.paper'),
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: isSelected ? 'grey.300' : 'action.hover',
                          },
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
                              handleOccurrenceClick(occ);
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

      {/* Coach and Class Selection - Only show if classes are available for selected date */}
      {selectedDate && availableLessons.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {availableCoaches.length > 1 && (
              <Box sx={{ flex: '1 1 auto', minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Select Coach: <span style={{ color: 'red' }}>*</span>
                </Typography>
                <ToggleButtonGroup
                  value={selectedCoach}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue) {
                      setSelectedCoach(newValue);
                      // Auto-select first class for the selected coach
                      const coachLessons = availableLessons.filter(l => l.coachId === newValue);
                      if (coachLessons.length > 0) {
                        setSelectedLesson(coachLessons[0].id);
                      } else {
                        setSelectedLesson('');
                      }
                    }
                  }}
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: '1 1 auto',
                      minWidth: 120,
                    },
                  }}
                >
                  {availableCoaches.map((coach) => (
                    <ToggleButton key={coach.id} value={coach.id} sx={{ py: 1.5 }}>
                      {coach.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}
            {availableCoaches.length === 1 && selectedCoach && (
              <Box sx={{ flex: '1 1 auto', minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Coach:
                </Typography>
                <ToggleButtonGroup
                  value={selectedCoach}
                  exclusive
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: '1 1 auto',
                      minWidth: 120,
                    },
                  }}
                >
                  <ToggleButton value={availableCoaches[0].id} sx={{ py: 1.5 }}>
                    {availableCoaches[0].name}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
            {selectedCoach && filteredLessons.length > 1 && (
              <Box sx={{ flex: '1 1 auto', minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Select Class: <span style={{ color: 'red' }}>*</span>
                </Typography>
                <ToggleButtonGroup
                  value={selectedLesson}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue) {
                      setSelectedLesson(newValue);
                    }
                  }}
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: '1 1 auto',
                      minWidth: 150,
                    },
                  }}
                >
                  {filteredLessons.map((lesson) => (
                    <ToggleButton key={lesson.id} value={lesson.id} sx={{ py: 1.5 }}>
                      {lesson.name} ({lesson.startTime})
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}
            {selectedCoach && filteredLessons.length === 1 && (
              <Box sx={{ flex: '1 1 auto', minWidth: 200 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Class:
                </Typography>
                <ToggleButtonGroup
                  value={selectedLesson}
                  exclusive
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: '1 1 auto',
                      minWidth: 150,
                    },
                  }}
                >
                  <ToggleButton value={filteredLessons[0].id} sx={{ py: 1.5 }}>
                    {filteredLessons[0].name} ({filteredLessons[0].startTime})
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Participants - Compact Grid - Only show if both coach and class are selected */}
      {selectedCoach && selectedLesson && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Participants ({students.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  // Select all students who haven't visited
                  students.forEach(student => {
                    if (!hasVisited(student.id)) {
                      handleToggleVisit(student.id);
                    }
                  });
                }}
              >
                Select All
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  // Unselect all students who have visited
                  students.forEach(student => {
                    if (hasVisited(student.id)) {
                      handleToggleVisit(student.id);
                    }
                  });
                }}
              >
                Unselect All
              </Button>
            </Box>
          </Box>
          <Grid container spacing={1}>
            {students.map((student) => {
              const visited = hasVisited(student.id);
              // Always recalculate with latest state.visits
              const availableLessons = calculateStudentAvailableLessons(student);
              const negative = availableLessons < 0; // Only color code negative, not 0
              // Include visits count in key to force re-render when visits change
              const studentVisitsCount = state.visits.filter(v => v.studentId === student.id).length;
              return (
                <Grid item xs={6} sm={4} md={3} key={`${student.id}-${studentVisitsCount}`}>
                  <Card
                    sx={{
                      border: visited ? '2px solid #388e3c' : '1px solid',
                      borderColor: visited ? '#388e3c' : 'divider',
                      bgcolor: visited ? 'success.light' : 'background.paper',
                      p: 1,
                      position: 'relative',
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        zIndex: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const studentData = state.students.find(s => s.id === student.id) || student;
                        setSelectedStudentForProfile(studentData);
                        const payments = studentData.payments || [];
                        const lastPayment = payments.length > 0 
                          ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                          : null;
                        const actualClassSeries = state.lessons
                          .filter(lesson => lesson.participants?.includes(studentData.id))
                          .map(lesson => lesson.id);
                        const mergedClassSeries = [...new Set([...(studentData.classSeries || []), ...actualClassSeries])];
                        
                        setProfileFormData({
                          name: studentData.name,
                          classSeries: mergedClassSeries,
                          lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'yyyy-MM-dd') : '',
                          lessonsCount: studentData.lessonsCount || 0,
                          isActive: studentData.isActive !== false,
                        });
                        setProfileTabValue(0);
                        setProfileDialogOpen(true);
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </IconButton>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={visited}
                          onChange={() => handleToggleVisit(student.id)}
                          color="success"
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {student.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color={negative ? "error" : "text.secondary"} 
                            display="block" 
                            sx={{ mt: 0.5, fontWeight: negative ? 600 : 400 }}
                          >
                            {availableLessons} lessons available
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0, pr: 3 }}
                    />
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {selectedDate && availableLessons.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No classes available for this date
          </Typography>
        </Box>
      )}
      {selectedDate && availableLessons.length > 0 && (!selectedCoach || !selectedLesson) && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Please select a coach and class to track visits
          </Typography>
        </Box>
      )}

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this lesson occurrence? You can undo this action later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button onClick={handleCancelLesson} variant="contained" color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Profile Dialog - Full version same as StudentsScreen */}
      {selectedStudentForProfile && (
        <Dialog 
          open={profileDialogOpen} 
          onClose={() => {
            setProfileDialogOpen(false);
            setSelectedStudentForProfile(null);
            setProfileTabValue(0);
          }} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Student Profile: {selectedStudentForProfile.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={profileTabValue} onChange={(e, v) => setProfileTabValue(v)}>
                <Tab label="Profile" />
                <Tab label="History" />
              </Tabs>
            </Box>

            {profileTabValue === 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Payment Section - Moved to Top */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Payment Date"
                    type="date"
                    value={profileFormData.lastPaymentDate}
                    onChange={(e) => setProfileFormData({ ...profileFormData, lastPaymentDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Remaining Lessons"
                    type="number"
                    value={selectedStudentForProfile ? (profileFormData.remainingLessons !== undefined ? profileFormData.remainingLessons : (() => {
                      // Fallback to calculated value if not set
                      const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                      const lessons = calculateStudentLessons(latestStudent);
                      return lessons.remainingLessons;
                    })()) : 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setProfileFormData({ ...profileFormData, remainingLessons: value });
                    }}
                    helperText="Editable - will update lessons count on save"
                    sx={{
                      '& .MuiInputBase-input': {
                        color: (() => {
                          const value = selectedStudentForProfile ? (profileFormData.remainingLessons !== undefined ? profileFormData.remainingLessons : (() => {
                            const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                            const lessons = calculateStudentLessons(latestStudent);
                            return lessons.remainingLessons;
                          })()) : 0;
                          return value <= 0 ? 'error.main' : 'inherit';
                        })(),
                        fontWeight: (() => {
                          const value = selectedStudentForProfile ? (profileFormData.remainingLessons !== undefined ? profileFormData.remainingLessons : (() => {
                            const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                            const lessons = calculateStudentLessons(latestStudent);
                            return lessons.remainingLessons;
                          })()) : 0;
                          return value <= 0 ? 600 : 'inherit';
                        })(),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AttachMoneyIcon />}
                    onClick={() => {
                      const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                      const currentLessons = calculateStudentLessons(latestStudent);
                      if (currentLessons.remainingLessons >= 8) {
                        alert('Student already has 8 or more lessons remaining. Cannot add more payments.');
                        return;
                      }
                      handleProfilePay(latestStudent, 8);
                    }}
                    sx={{ mt: 1 }}
                    disabled={(() => {
                      const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                      const currentLessons = calculateStudentLessons(latestStudent);
                      return currentLessons.remainingLessons >= 8;
                    })()}
                  >
                    Pay (Add 8 lessons)
                  </Button>
                  {(() => {
                    const latestStudent = state.students.find(s => s.id === selectedStudentForProfile.id) || selectedStudentForProfile;
                    const currentLessons = calculateStudentLessons(latestStudent);
                    if (currentLessons.remainingLessons >= 8) {
                      return (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          Already has {currentLessons.remainingLessons} lessons remaining
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={profileFormData.name}
                    onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!profileFormData.isActive}
                        onChange={(e) => setProfileFormData({ ...profileFormData, isActive: !e.target.checked })}
                      />
                    }
                    label="Inactive Student"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Classes:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {state.lessons.map((series) => {
                      const isAssigned = profileFormData.classSeries.includes(series.id);
                      const isParticipant = series.participants?.includes(selectedStudentForProfile.id);
                      return (
                        <FormControlLabel
                          key={series.id}
                          control={
                            <Checkbox
                              checked={isAssigned}
                              onChange={() => handleProfileClassSeriesToggle(series.id)}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>{series.name} - {series.dayOfWeek} {series.startTime}</Typography>
                              {isParticipant && !isAssigned && (
                                <Chip label="Currently assigned" size="small" color="info" />
                              )}
                            </Box>
                          }
                        />
                      );
                    })}
                    {state.lessons.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No classes available. Create classes first.
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Classes Since Last Payment
                  </Typography>
                  {(() => {
                    const lessons = calculateStudentLessons(selectedStudentForProfile);
                    if (!lessons.lastPaymentDate) {
                      return <Typography color="text.secondary">No payment date</Typography>;
                    }
                    return (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Period: {format(lessons.lastPaymentDate, 'MMM d, yyyy')} - {format(new Date(), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Remaining Lessons: {lessons.remainingLessons}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Visited ({lessons.visitedLessons.length}):
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {lessons.visitedLessons.map((lesson, idx) => (
                              <Chip
                                key={idx}
                                label={`${format(new Date(lesson.date), 'MMM d')} - ${lesson.seriesName}`}
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon />}
                              />
                            ))}
                            {lessons.visitedLessons.length === 0 && (
                              <Typography variant="body2" color="text.secondary">None</Typography>
                            )}
                          </Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Missed ({lessons.missedLessons.length}):
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {lessons.missedLessons.map((lesson, idx) => {
                              const lessonObj = state.lessons.find(l => l.id === lesson.seriesId);
                              return (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <Chip
                                    label={`${format(new Date(lesson.date), 'MMM d')} - ${lesson.seriesName}`}
                                    size="small"
                                    color="error"
                                    icon={<CancelIcon />}
                                    onDelete={() => handleProfileRemoveMissedLesson(lesson)}
                                    deleteIcon={<CheckCircleIcon />}
                                  />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleProfileRemoveMissedLesson(lesson)}
                                    sx={{ ml: 0.5 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              );
                            })}
                            {lessons.missedLessons.length === 0 && (
                              <Typography variant="body2" color="text.secondary">None</Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })()}
                </Grid>
              </Grid>
            )}

            {profileTabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Payments</Typography>
                  <TableContainer>
                    <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Lessons</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedStudentForProfile.payments?.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{format(new Date(payment.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{payment.lessons}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleProfileRemovePayment(payment.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!selectedStudentForProfile.payments || selectedStudentForProfile.payments.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">No payments yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Visits</Typography>
                  <TableContainer>
                    <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Coach</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {getStudentVisits(selectedStudentForProfile.id).map((visit) => {
                          const lesson = state.lessons.find(l => l.id === visit.lessonId);
                          const classTime = lesson ? lesson.startTime : 'N/A';
                          return (
                            <TableRow key={visit.id}>
                              <TableCell>{format(new Date(visit.date), 'MMM d, yyyy')}</TableCell>
                              <TableCell>{visit.className}</TableCell>
                              <TableCell>{classTime}</TableCell>
                              <TableCell>
                                {state.coaches.find(c => c.id === visit.coachId)?.name || 'Unknown'}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleProfileRemoveVisit(visit.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {getStudentVisits(selectedStudentForProfile.id).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">No visits yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setProfileDialogOpen(false);
              setSelectedStudentForProfile(null);
              setProfileTabValue(0);
            }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
