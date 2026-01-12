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
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const classColors = {
  'Aerial Silks': '#d32f2f',
  'Acrobatics': '#ff6f00',
  'Juggling': '#fbc02d',
  'Clowning': '#388e3c',
  'Tightrope': '#1976d2',
};

export default function StudentsScreen() {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    isAdult: false,
    classes: [],
    balance: 0,
    membershipStart: format(new Date(), 'yyyy-MM-dd'),
    lessonsRemaining: 8,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const availableClasses = [
    'Aerial Silks',
    'Acrobatics',
    'Juggling',
    'Clowning',
    'Tightrope',
  ];

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        isAdult: student.isAdult || false,
        classes: student.classes || [],
        balance: student.balance || 0,
        membershipStart: student.membershipStart || format(new Date(), 'yyyy-MM-dd'),
        lessonsRemaining: student.lessonsRemaining || 8,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        isAdult: false,
        classes: [],
        balance: 0,
        membershipStart: format(new Date(), 'yyyy-MM-dd'),
        lessonsRemaining: 8,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const studentData = {
      id: editingStudent?.id || Date.now().toString(),
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      lessonsRemaining: parseInt(formData.lessonsRemaining) || 8,
    };

    if (editingStudent) {
      dispatch({ type: 'UPDATE_STUDENT', payload: studentData });
    } else {
      dispatch({ type: 'ADD_STUDENT', payload: studentData });
    }
    handleCloseDialog();
  };

  const handleClassToggle = (className) => {
    setFormData((prev) => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter((c) => c !== className)
        : [...prev.classes, className],
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

  const handleAddPayment = () => {
    if (selectedStudent) {
      const updated = {
        ...selectedStudent,
        balance: (selectedStudent.balance || 0) + 1,
        lessonsRemaining: (selectedStudent.lessonsRemaining || 0) + 8,
      };
      dispatch({ type: 'UPDATE_STUDENT', payload: updated });
    }
    handleMenuClose();
  };

  const getMembershipStatus = (student) => {
    if (!student.lessonsRemaining) return { status: 'Expired', color: 'error' };
    if (student.lessonsRemaining <= 2) return { status: 'Low', color: 'warning' };
    return { status: 'Active', color: 'success' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Students ({state.students.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Student
        </Button>
      </Box>

      <Grid container spacing={2}>
        {state.students.map((student) => {
          const membershipStatus = getMembershipStatus(student);
          return (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${membershipStatus.color === 'success' ? '#388e3c' : membershipStatus.color === 'warning' ? '#f57c00' : '#d32f2f'}`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {student.name}
                      </Typography>
                      <Chip
                        label={student.isAdult ? 'Adult' : 'Kid'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, student)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Classes:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {student.classes?.map((className) => (
                        <Chip
                          key={className}
                          label={className}
                          size="small"
                          sx={{
                            backgroundColor: classColors[className] || '#757575',
                            color: 'white',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Balance: {student.balance || 0} payment(s)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lessons Remaining: {student.lessonsRemaining || 0}
                    </Typography>
                    <Chip
                      label={membershipStatus.status}
                      size="small"
                      color={membershipStatus.color}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {state.students.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No students yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Add First Student
          </Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Edit Student' : 'Add New Student'}
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAdult}
                    onChange={(e) => setFormData({ ...formData, isAdult: e.target.checked })}
                  />
                }
                label="Adult (18+)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Classes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableClasses.map((className) => (
                  <FormControlLabel
                    key={className}
                    control={
                      <Checkbox
                        checked={formData.classes.includes(className)}
                        onChange={() => handleClassToggle(className)}
                      />
                    }
                    label={className}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Balance (payments)"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lessons Remaining"
                type="number"
                value={formData.lessonsRemaining}
                onChange={(e) => setFormData({ ...formData, lessonsRemaining: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Membership Start Date"
                type="date"
                value={formData.membershipStart}
                onChange={(e) => setFormData({ ...formData, membershipStart: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
        <MenuItem onClick={() => { handleOpenDialog(selectedStudent); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleAddPayment}>
          <AttachMoneyIcon sx={{ mr: 1 }} /> Add Payment
        </MenuItem>
      </Menu>
    </Box>
  );
}
