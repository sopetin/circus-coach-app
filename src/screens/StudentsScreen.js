import React, { useState, useMemo, useEffect } from 'react';
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
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Avatar,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import { format, parseISO, isAfter, isBefore, isSameDay, addDays, getDay, startOfWeek, differenceInWeeks, differenceInMonths, differenceInDays } from 'date-fns';
import { getAnimalEmoji } from '../utils/animalEmojis';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentsScreen() {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    classSeries: [],
    lastPaymentDate: '',
    lessonsCount: 8,
    remainingLessons: 8, // Editable remaining lessons
    isActive: true,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('zero'); // 'all', 'active', 'inactive', 'paid', 'zero'
  const [sortBy, setSortBy] = useState('payDue'); // 'name' or 'payDue'
  const [studentOrder, setStudentOrder] = useState([]); // Store stable order
  const [undoSnackbar, setUndoSnackbar] = useState({ open: false, studentId: null, previousData: null });

  // Listen for openStudentProfile event from Visits screen
  useEffect(() => {
    const handleOpenProfile = (event) => {
      const { studentId } = event.detail;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        handleOpenDialog(student);
      }
    };
    window.addEventListener('openStudentProfile', handleOpenProfile);
    return () => {
      window.removeEventListener('openStudentProfile', handleOpenProfile);
    };
  }, [state.students]);

  // Sync editingStudent with state updates (e.g., after payment)
  useEffect(() => {
    if (editingStudent && dialogOpen) {
      const updatedStudent = state.students.find(s => s.id === editingStudent.id);
      if (updatedStudent) {
        // Only update if there are actual changes to avoid infinite loops
        if (updatedStudent.lessonsCount !== editingStudent.lessonsCount || 
            updatedStudent.lastPaymentDate !== editingStudent.lastPaymentDate) {
          setEditingStudent(updatedStudent);
          // Also update formData
          const payments = updatedStudent.payments || [];
          const lastPayment = payments.length > 0 
            ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
          const lessons = calculateStudentLessons(updatedStudent);
          setFormData(prev => ({
            ...prev,
            lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'yyyy-MM-dd') : prev.lastPaymentDate,
            lessonsCount: updatedStudent.lessonsCount || prev.lessonsCount,
            remainingLessons: lessons.remainingLessons,
          }));
        }
      }
    }
  }, [state.students, editingStudent?.id, dialogOpen]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate pay due (weeks/months since last payment)
  const calculatePayDue = (student) => {
    if (!student || !student.lastPaymentDate) {
      return { weeks: null, months: null, days: null, text: 'No payment' };
    }
    
    const lastPayment = new Date(student.lastPaymentDate);
    const today = new Date();
    const days = differenceInDays(today, lastPayment);
    const weeks = differenceInWeeks(today, lastPayment);
    const months = differenceInMonths(today, lastPayment);
    
    let text = '';
    if (months > 0) {
      text = `${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (weeks > 0) {
      text = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
      text = `${days} ${days === 1 ? 'day' : 'days'}`;
    }
    
    return { weeks, months, days, text };
  };

  // Calculate lessons for a student
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

    // Get all assigned lesson series
    const assignedSeries = state.lessons.filter(l => student.classSeries.includes(l.id));
    
    // Generate all lesson occurrences from last payment date to today
    const allLessons = [];
    assignedSeries.forEach(series => {
      if (!series.startDate || !series.endDate) return;
      
      const seriesStart = new Date(series.startDate);
      const seriesEnd = new Date(series.endDate);
      const dayIndex = daysOfWeek.indexOf(series.dayOfWeek);
      
      // Find first occurrence of this day after last payment date
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

    // Get visited lessons
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

    // Calculate missed lessons (scheduled but not visited and the planned day has already passed)
    // Exclude cancelled lessons
    const visitedDates = new Set(visitedLessons.map(v => v.date));
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const missedLessons = allLessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      lessonDate.setHours(23, 59, 59, 999);
      // Check if lesson is cancelled
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

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      const payments = student.payments || [];
      const lastPayment = payments.length > 0 
        ? payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;
      const lessons = calculateStudentLessons(student);
      const remainingLessons = lessons.remainingLessons;
      
      // Sync classSeries with actual lesson participants (bidirectional)
      const actualClassSeries = state.lessons
        .filter(lesson => lesson.participants?.includes(student.id))
        .map(lesson => lesson.id);
      
      // Merge with student's classSeries (in case of inconsistencies)
      const mergedClassSeries = [...new Set([...(student.classSeries || []), ...actualClassSeries])];
      
      setFormData({
        name: student.name,
        classSeries: mergedClassSeries,
        lastPaymentDate: lastPayment ? format(new Date(lastPayment.date), 'yyyy-MM-dd') : '',
        lessonsCount: student.lessonsCount || 0,
        remainingLessons: remainingLessons, // Store calculated remaining lessons
        isActive: student.isActive !== false,
      });
      setTabValue(0);
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        classSeries: [],
        lastPaymentDate: format(new Date(), 'yyyy-MM-dd'),
        lessonsCount: 8,
        remainingLessons: 8,
        isActive: true,
      });
      setTabValue(0);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
    setTabValue(0);
  };

  // Auto-save on form data change
  useEffect(() => {
    if (!dialogOpen || !formData.name.trim()) return;
    
    // Calculate lessonsCount from remainingLessons + visited lessons
    let lessonsCount = formData.lessonsCount;
    if (editingStudent && formData.remainingLessons !== undefined) {
      const lessons = calculateStudentLessons(editingStudent);
      const visitedCount = lessons.visitedLessons.length;
      // If remainingLessons was manually edited, calculate lessonsCount from it
      lessonsCount = formData.remainingLessons + visitedCount;
    }

    const studentData = {
      id: editingStudent?.id || Date.now().toString(),
      name: formData.name,
      classSeries: formData.classSeries,
      lastPaymentDate: formData.lastPaymentDate,
      lessonsCount: lessonsCount,
      isActive: formData.isActive,
      payments: editingStudent?.payments || [],
      visits: editingStudent?.visits || [],
      editHistory: editingStudent?.editHistory || [],
    };

    // Sync classSeries with class participants (bidirectional sync)
    if (editingStudent) {
      // Remove student from classes they're no longer assigned to
      state.lessons.forEach(lesson => {
        const wasParticipant = lesson.participants?.includes(editingStudent.id);
        const isNowParticipant = formData.classSeries.includes(lesson.id);
        
        if (wasParticipant && !isNowParticipant) {
          // Remove from class participants
          const updatedLesson = {
            ...lesson,
            participants: (lesson.participants || []).filter(id => id !== editingStudent.id),
          };
          dispatch({ type: 'UPDATE_LESSON_SERIES', payload: updatedLesson });
        } else if (!wasParticipant && isNowParticipant) {
          // Add to class participants
          const updatedLesson = {
            ...lesson,
            participants: [...(lesson.participants || []), editingStudent.id],
          };
          dispatch({ type: 'UPDATE_LESSON_SERIES', payload: updatedLesson });
        }
      });
      
      dispatch({ type: 'UPDATE_STUDENT', payload: studentData });
    } else if (formData.name.trim()) {
      // For new student, add them to selected classes
      formData.classSeries.forEach(lessonId => {
        const lesson = state.lessons.find(l => l.id === lessonId);
        if (lesson && !lesson.participants?.includes(studentData.id)) {
          const updatedLesson = {
            ...lesson,
            participants: [...(lesson.participants || []), studentData.id],
          };
          dispatch({ type: 'UPDATE_LESSON_SERIES', payload: updatedLesson });
        }
      });
      
      studentData.payments = [];
      studentData.visits = [];
      studentData.editHistory = [];
      dispatch({ type: 'ADD_STUDENT', payload: studentData });
    }
  }, [formData, dialogOpen, editingStudent]);

  const handlePay = (student, lessons = 8) => {
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

    // Store previous data for undo
    const previousData = {
      lastPaymentDate: latestStudent.lastPaymentDate,
      lessonsCount: latestStudent.lessonsCount,
      payments: latestStudent.payments || [],
    };

    // Calculate current remaining lessons before payment
    // Then set payment date to today (resets the period) and add 8 to remaining
    // Since lastPaymentDate will be today, visited/missed will be 0, so:
    // new lessonsCount = current remaining lessons + 8
    const currentRemainingLessons = currentLessons.remainingLessons;
    const newLessonsCount = currentRemainingLessons + lessons;

    // Update the student directly with new payment date and lessons count
    dispatch({
      type: 'UPDATE_STUDENT',
      payload: {
        ...latestStudent,
        lastPaymentDate: today,
        lessonsCount: newLessonsCount,
        payments: [...(latestStudent.payments || []), payment],
      },
    });

    // Show undo snackbar
    setUndoSnackbar({
      open: true,
      studentId: student.id,
      previousData,
    });
  };

  const handleUndoPay = () => {
    if (!undoSnackbar.studentId || !undoSnackbar.previousData) return;
    
    const student = state.students.find(s => s.id === undoSnackbar.studentId);
    if (student) {
      // Remove the last payment
      const payments = student.payments || [];
      const updatedPayments = payments.slice(0, -1);
      
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: {
          ...student,
          lastPaymentDate: undoSnackbar.previousData.lastPaymentDate,
          lessonsCount: undoSnackbar.previousData.lessonsCount,
          payments: updatedPayments,
        },
      });
    }
    
    setUndoSnackbar({ open: false, studentId: null, previousData: null });
  };

  const handleClassSeriesToggle = (seriesId) => {
    setFormData((prev) => ({
      ...prev,
      classSeries: prev.classSeries.includes(seriesId)
        ? prev.classSeries.filter((id) => id !== seriesId)
        : [...prev.classSeries, seriesId],
    }));
  };

  const handleMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const getClassSeriesName = (seriesId) => {
    const series = state.lessons.find(l => l.id === seriesId);
    if (!series) return 'Unknown';
    return `${series.name} - ${series.dayOfWeek} ${series.startTime}`;
  };

  const getStudentVisits = (studentId) => {
    return state.visits.filter(v => v.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleRemovePayment = (paymentId) => {
    if (!editingStudent) return;
    const updatedPayments = (editingStudent.payments || []).filter(p => p.id !== paymentId);
    
    // If this was the last payment, we might need to update lastPaymentDate
    let newLastPaymentDate = editingStudent.lastPaymentDate;
    if (updatedPayments.length > 0) {
      const lastPayment = updatedPayments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      newLastPaymentDate = lastPayment.date;
    } else {
      newLastPaymentDate = '';
    }
    
    dispatch({
      type: 'UPDATE_STUDENT',
      payload: {
        ...editingStudent,
        payments: updatedPayments,
        lastPaymentDate: newLastPaymentDate,
      },
    });
    
    // Update formData
    setFormData({
      ...formData,
      lastPaymentDate: newLastPaymentDate,
    });
  };

  const handleRemoveVisit = (visitId) => {
    dispatch({
      type: 'REMOVE_VISIT',
      payload: { id: visitId },
    });
  };

  const handleRemoveMissedLesson = (lesson) => {
    // Mark missed lesson as visited by adding a visit
    const lessonObj = state.lessons.find(l => l.id === lesson.seriesId);
    if (lessonObj && editingStudent) {
      dispatch({
        type: 'ADD_VISIT',
        payload: {
          id: `${Date.now()}-${lesson.seriesId}-${editingStudent.id}`,
          date: lesson.date,
          lessonId: lesson.seriesId,
          studentId: editingStudent.id,
          coachId: lessonObj.coachId || '',
          className: lessonObj.name || '',
        },
      });
    }
  };

  // Filter students based on search query and filter type
  const filteredStudents = useMemo(() => {
    let students = state.students;
    
    // Apply filter type
    if (filterType === 'active') {
      students = students.filter(s => s.isActive !== false);
    } else if (filterType === 'inactive') {
      students = students.filter(s => s.isActive === false);
    } else if (filterType === 'paid') {
      students = students.filter(s => {
        if (s.isActive === false) return false;
        const lessons = calculateStudentLessons(s);
        return lessons.remainingLessons > 0;
      });
    } else if (filterType === 'zero') {
      students = students.filter(s => {
        if (s.isActive === false) return false;
        const lessons = calculateStudentLessons(s);
        return lessons.remainingLessons === 0;
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      students = students.filter(student => {
        const nameParts = student.name.toLowerCase().split(' ');
        return nameParts.some(part => part.includes(query)) || student.name.toLowerCase().includes(query);
      });
    }
    
    // Apply sorting - maintain stable order until user changes sort option
    let sortedStudents;
    
    // If we have a stored order and it matches current students, maintain that order
    if (studentOrder.length > 0 && 
        studentOrder.every(id => students.some(s => s.id === id)) &&
        students.every(s => studentOrder.includes(s.id))) {
      // Maintain stored order
      sortedStudents = [...students].sort((a, b) => {
        const indexA = studentOrder.indexOf(a.id);
        const indexB = studentOrder.indexOf(b.id);
        return indexA - indexB;
      });
    } else {
      // Apply new sorting
      sortedStudents = [...students].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'payDue') {
          const payDueA = calculatePayDue(a);
          const payDueB = calculatePayDue(b);
          
          // Students with no payment go to the end
          if (!payDueA.weeks && payDueB.weeks) return 1;
          if (payDueA.weeks && !payDueB.weeks) return -1;
          if (!payDueA.weeks && !payDueB.weeks) return a.name.localeCompare(b.name);
          
          // Sort by days (most overdue first)
          return (payDueB.days || 0) - (payDueA.days || 0);
        }
        return 0;
      });
      
      // Store the new order (only update if order actually changed)
      const newOrder = sortedStudents.map(s => s.id);
      if (JSON.stringify(newOrder) !== JSON.stringify(studentOrder)) {
        setStudentOrder(newOrder);
      }
    }
    
    return sortedStudents;
  }, [state.students, searchQuery, filterType, sortBy, studentOrder]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Students ({filteredStudents.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Student
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <TextField
          fullWidth
          placeholder="Search students by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setFilterType(newValue);
          }}
          size="small"
        >
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="paid">Paid</ToggleButton>
          <ToggleButton value="zero">To pay</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              setSortBy(newValue);
              setStudentOrder([]); // Clear stored order when user manually changes sort
            }
          }}
          size="small"
        >
          <ToggleButton value="payDue">Pay Due</ToggleButton>
          <ToggleButton value="name">Name</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={1.5}>
        {filteredStudents.map((student) => {
          const lessons = calculateStudentLessons(student);
          const hasNegativeBalance = (student.balance || 0) < 0;
          const isInactive = student.isActive === false;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
              <Card
                onClick={() => handleOpenDialog(student)}
                sx={{
                  borderRadius: 3,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isInactive ? 0.5 : 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  },
                  ...(hasNegativeBalance && {
                    borderLeft: '3px solid #d32f2f',
                  }),
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'grey.200',
                        fontSize: '1.6rem',
                        border: '2px solid',
                        borderColor: 'grey.300',
                        flexShrink: 0,
                      }}
                    >
                      {getAnimalEmoji(student.id)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.25,
                        }}
                      >
                        {student.name}
                      </Typography>
                      {lessons.lastPaymentDate ? (
                        <>
                          <Typography 
                            variant="caption" 
                            color={lessons.remainingLessons === 0 ? "error" : "text.secondary"} 
                            display="block"
                            sx={{ fontWeight: lessons.remainingLessons === 0 ? 600 : 400 }}
                          >
                            {lessons.remainingLessons} lessons
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Paid: {format(lessons.lastPaymentDate, 'MMM d, yyyy')}
                            {(() => {
                              // Only show Due if remaining lessons are 0 or negative
                              if (lessons.remainingLessons > 0) return null;
                              const payDue = calculatePayDue(student);
                              if (!payDue.days && payDue.days !== 0) return null;
                              return (
                                <span 
                                  style={{ 
                                    color: payDue.days > 30 ? '#d32f2f' : payDue.days > 14 ? '#ed6c02' : 'inherit',
                                    fontWeight: payDue.days > 30 ? 600 : 400
                                  }}
                                >
                                  {' '}({payDue.days} {payDue.days === 1 ? 'day' : 'days'})
                                </span>
                              );
                            })()}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No payments
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentLessons = calculateStudentLessons(student);
                          if (currentLessons.remainingLessons >= 8) {
                            alert('Student already has 8 or more lessons remaining. Cannot add more payments.');
                            return;
                          }
                          if (student.isActive === false) {
                            alert('Cannot pay for inactive student.');
                            return;
                          }
                          handlePay(student, 8);
                        }}
                        disabled={lessons.remainingLessons >= 8 || student.isActive === false}
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: 'success.dark',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'grey.300',
                            color: 'grey.500',
                          },
                        }}
                      >
                        <AttachMoneyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {hasNegativeBalance && (
                    <Chip 
                      label="Negative Balance" 
                      size="small" 
                      color="error"
                      sx={{ mt: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredStudents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No students found' : 'No students yet'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2 }}
            >
              Add First Student
            </Button>
          )}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? `Student Profile: ${editingStudent.name}` : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Profile" />
              <Tab label="History" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Payment Section - Moved to Top */}
              {editingStudent && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Payment Date"
                      type="date"
                      value={formData.lastPaymentDate}
                      onChange={(e) => setFormData({ ...formData, lastPaymentDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Remaining Lessons"
                      type="number"
                      value={(() => {
                        // Always use the latest student from state to ensure accurate calculation
                        const latestStudent = editingStudent 
                          ? (state.students.find(s => s.id === editingStudent.id) || editingStudent)
                          : null;
                        if (!latestStudent) return 0;
                        const lessons = calculateStudentLessons(latestStudent);
                        return lessons.remainingLessons;
                      })()}
                      InputProps={{ readOnly: true }}
                      helperText="Calculated from payments and visits"
                      sx={{
                        '& .MuiInputBase-input': {
                          color: (() => {
                            const latestStudent = editingStudent 
                              ? (state.students.find(s => s.id === editingStudent.id) || editingStudent)
                              : null;
                            if (!latestStudent) return 'inherit';
                            const lessons = calculateStudentLessons(latestStudent);
                            return lessons.remainingLessons <= 0 ? 'error.main' : 'inherit';
                          })(),
                          fontWeight: (() => {
                            const latestStudent = editingStudent 
                              ? (state.students.find(s => s.id === editingStudent.id) || editingStudent)
                              : null;
                            if (!latestStudent) return 'inherit';
                            const lessons = calculateStudentLessons(latestStudent);
                            return lessons.remainingLessons <= 0 ? 600 : 'inherit';
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
                        const latestStudent = state.students.find(s => s.id === editingStudent.id) || editingStudent;
                        const currentLessons = calculateStudentLessons(latestStudent);
                        if (currentLessons.remainingLessons >= 8) {
                          alert('Student already has 8 or more lessons remaining. Cannot add more payments.');
                          return;
                        }
                        handlePay(latestStudent, 8);
                        // The useEffect will automatically sync editingStudent with state updates
                      }}
                      sx={{ mt: 1 }}
                      disabled={(() => {
                        const latestStudent = state.students.find(s => s.id === editingStudent.id) || editingStudent;
                        const currentLessons = calculateStudentLessons(latestStudent);
                        return currentLessons.remainingLessons >= 8;
                      })()}
                    >
                      Pay (Add 8 lessons)
                    </Button>
                    {(() => {
                      const latestStudent = state.students.find(s => s.id === editingStudent.id) || editingStudent;
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
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              {editingStudent && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                      />
                    }
                    label="Inactive Student"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Classes:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {state.lessons.map((series) => {
                    const isAssigned = formData.classSeries.includes(series.id);
                    const isParticipant = series.participants?.includes(editingStudent?.id || '');
                    return (
                      <FormControlLabel
                        key={series.id}
                        control={
                          <Checkbox
                            checked={isAssigned}
                            onChange={() => handleClassSeriesToggle(series.id)}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{series.name} - {series.dayOfWeek} {series.startTime}</Typography>
                            {editingStudent && isParticipant && !isAssigned && (
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
              {editingStudent && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Classes Since Last Payment
                  </Typography>
                  {(() => {
                    const lessons = calculateStudentLessons(editingStudent);
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
                                    onDelete={() => handleRemoveMissedLesson(lesson)}
                                    deleteIcon={<CheckCircleIcon />}
                                  />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveMissedLesson(lesson)}
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
              )}
            </Grid>
          )}

          {tabValue === 1 && editingStudent && (
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
                      {editingStudent.payments?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{payment.lessons}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemovePayment(payment.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!editingStudent.payments || editingStudent.payments.length === 0) && (
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
                      {getStudentVisits(editingStudent.id).map((visit) => {
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
                                onClick={() => handleRemoveVisit(visit.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {getStudentVisits(editingStudent.id).length === 0 && (
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
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleOpenDialog(selectedStudent); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> Student Profile
        </MenuItem>
        <MenuItem onClick={() => { handlePay(selectedStudent); handleMenuClose(); }}>
          <AttachMoneyIcon sx={{ mr: 1 }} /> Pay (8 lessons)
        </MenuItem>
      </Menu>

      {/* Undo Snackbar */}
      <Snackbar
        open={undoSnackbar.open}
        autoHideDuration={5000}
        onClose={() => setUndoSnackbar({ open: false, studentId: null, previousData: null })}
        message="Payment added"
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<UndoIcon />}
            onClick={handleUndoPay}
          >
            Undo
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
  }
