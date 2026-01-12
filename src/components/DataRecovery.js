import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApp } from '../context/AppContext';
import { generateSeedData } from '../utils/seedData';
import { format } from 'date-fns';

export default function DataRecovery({ open: externalOpen, onClose: externalOnClose }) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [localStorageData, setLocalStorageData] = useState(null);
  const [backups, setBackups] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef(null);

  // Use external open/close if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : open;
  const handleClose = externalOnClose || (() => setOpen(false));

  useEffect(() => {
    if (isOpen) {
      checkLocalStorage();
    }
  }, [isOpen]);

  const checkLocalStorage = () => {
    try {
      const data = localStorage.getItem('circusAppData');
      if (data) {
        const parsed = JSON.parse(data);
        setLocalStorageData(parsed);
      }

      // Find all backups
      const foundBackups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('circusAppData_backup_')) {
          try {
            const backupDataString = localStorage.getItem(key);
            const backupData = JSON.parse(backupDataString);
            const timestamp = parseInt(key.split('_').pop());
            const sizeInBytes = new Blob([backupDataString]).size;
            foundBackups.push({
              key,
              timestamp,
              date: new Date(timestamp),
              data: backupData,
              coaches: backupData.coaches?.length || 0,
              lessons: backupData.lessons?.length || 0,
              students: backupData.students?.length || 0,
              size: sizeInBytes,
            });
          } catch (e) {
            console.error('Error parsing backup:', key, e);
          }
        }
      }
      foundBackups.sort((a, b) => b.timestamp - a.timestamp);
      setBackups(foundBackups);
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
  };

  const createBackup = () => {
    try {
      const currentData = localStorage.getItem('circusAppData');
      if (!currentData) {
        alert('No data to backup!');
        return;
      }
      
      const timestamp = Date.now();
      const backupKey = `circusAppData_backup_${timestamp}`;
      localStorage.setItem(backupKey, currentData);
      
      // Refresh backups list
      checkLocalStorage();
      alert('Backup created successfully!');
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('localStorage is full! Please delete some old backups first.');
      } else {
        alert('Error creating backup: ' + e.message);
      }
    }
  };

  const restoreFromBackup = (backupKey) => {
    if (!window.confirm('This will replace all current data with the backup. Are you sure?')) {
      return;
    }
    
    try {
      const backupData = localStorage.getItem(backupKey);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        localStorage.setItem('circusAppData', backupData);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
        handleClose();
        alert('Data restored! Please refresh the page.');
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (e) {
      alert('Error restoring backup: ' + e.message);
    }
  };

  const deleteBackup = (backupKey) => {
    if (!window.confirm('Delete this backup? This cannot be undone.')) {
      return;
    }
    
    try {
      localStorage.removeItem(backupKey);
      checkLocalStorage();
    } catch (e) {
      alert('Error deleting backup: ' + e.message);
    }
  };

  // Escape CSV cell value
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const cellStr = String(value);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  // Convert JSON data to human-readable CSV format
  const jsonToCSV = (data) => {
    const rows = [];
    
    // Section: Students
    rows.push(['=== STUDENTS ===']);
    rows.push(['ID', 'Name', 'Last Payment Date', 'Lessons Count', 'Is Active', 'Class Series (comma-separated)', 'Payments (JSON)', 'Visits (JSON)', 'Edit History (JSON)']);
    (data.students || []).forEach(student => {
      rows.push([
        student.id || '',
        student.name || '',
        student.lastPaymentDate || '',
        student.lessonsCount || 0,
        student.isActive !== false ? 'Yes' : 'No',
        (student.classSeries || []).join(';'),
        JSON.stringify(student.payments || []),
        JSON.stringify(student.visits || []),
        JSON.stringify(student.editHistory || []),
      ]);
    });
    
    // Section: Coaches
    rows.push([]);
    rows.push(['=== COACHES ===']);
    rows.push(['ID', 'Name', 'Email', 'Phone']);
    (data.coaches || []).forEach(coach => {
      rows.push([
        coach.id || '',
        coach.name || '',
        coach.email || '',
        coach.phone || '',
      ]);
    });
    
    // Section: Classes (Lesson Series)
    rows.push([]);
    rows.push(['=== CLASSES ===']);
    rows.push(['ID', 'Name', 'Day of Week', 'Start Time', 'Coach ID', 'Start Date', 'End Date', 'Participants (comma-separated)']);
    (data.lessons || []).forEach(lesson => {
      rows.push([
        lesson.id || '',
        lesson.name || '',
        lesson.dayOfWeek || '',
        lesson.startTime || '',
        lesson.coachId || '',
        lesson.startDate || '',
        lesson.endDate || '',
        (lesson.participants || []).join(';'),
      ]);
    });
    
    // Section: Visits
    rows.push([]);
    rows.push(['=== VISITS ===']);
    rows.push(['ID', 'Date', 'Lesson ID', 'Student ID', 'Coach ID', 'Class Name']);
    (data.visits || []).forEach(visit => {
      rows.push([
        visit.id || '',
        visit.date || '',
        visit.lessonId || '',
        visit.studentId || '',
        visit.coachId || '',
        visit.className || '',
      ]);
    });
    
    // Section: Cancelled Lesson Occurrences
    rows.push([]);
    rows.push(['=== CANCELLED LESSONS ===']);
    rows.push(['Occurrence ID', 'Cancelled']);
    if (data.lessonOccurrences) {
      Object.entries(data.lessonOccurrences).forEach(([occurrenceId, occurrence]) => {
        if (occurrence.cancelled) {
          rows.push([occurrenceId, 'Yes']);
        }
      });
    }
    
    // Section: Membership Config
    rows.push([]);
    rows.push(['=== MEMBERSHIP CONFIG ===']);
    rows.push(['Lessons Per Payment', 'Free Skip Lessons']);
    rows.push([
      data.membershipConfig?.lessonsPerPayment || 8,
      data.membershipConfig?.freeSkipLessons || 1,
    ]);
    
    // Convert to CSV format
    return rows.map(row => row.map(escapeCSV).join(',')).join('\n');
  };

  // Parse CSV line handling quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current); // Add last field
    return result;
  };

  // Convert CSV format back to JSON
  const csvToJSON = (csvText) => {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Try new human-readable format first
    try {
      const result = {
        students: [],
        coaches: [],
        lessons: [],
        visits: [],
        lessonOccurrences: {},
        membershipConfig: {
          lessonsPerPayment: 8,
          freeSkipLessons: 1,
        },
      };
      
      let currentSection = null;
      let headerRow = null;
      let headerIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for section headers
        if (line.includes('=== STUDENTS ===')) {
          currentSection = 'students';
          headerIndex = i + 1;
          continue;
        } else if (line.includes('=== COACHES ===')) {
          currentSection = 'coaches';
          headerIndex = i + 1;
          continue;
        } else if (line.includes('=== CLASSES ===')) {
          currentSection = 'lessons';
          headerIndex = i + 1;
          continue;
        } else if (line.includes('=== VISITS ===')) {
          currentSection = 'visits';
          headerIndex = i + 1;
          continue;
        } else if (line.includes('=== CANCELLED LESSONS ===')) {
          currentSection = 'cancelled';
          headerIndex = i + 1;
          continue;
        } else if (line.includes('=== MEMBERSHIP CONFIG ===')) {
          currentSection = 'config';
          headerIndex = i + 1;
          continue;
        }
        
        // Skip empty lines
        if (!line || line === '') continue;
        
        // Parse header row
        if (i === headerIndex) {
          headerRow = parseCSVLine(line);
          continue;
        }
        
        // Parse data rows
        const columns = parseCSVLine(line);
        
        if (currentSection === 'students' && headerRow && columns.length >= headerRow.length) {
          let payments = [];
          let visits = [];
          let editHistory = [];
          
          try {
            if (columns[6] && columns[6].trim()) {
              payments = JSON.parse(columns[6]);
            }
          } catch (e) {
            console.warn('Failed to parse payments JSON:', e);
          }
          
          try {
            if (columns[7] && columns[7].trim()) {
              visits = JSON.parse(columns[7]);
            }
          } catch (e) {
            console.warn('Failed to parse visits JSON:', e);
          }
          
          try {
            if (columns[8] && columns[8].trim()) {
              editHistory = JSON.parse(columns[8]);
            }
          } catch (e) {
            console.warn('Failed to parse editHistory JSON:', e);
          }
          
          const student = {
            id: columns[0] || '',
            name: columns[1] || '',
            lastPaymentDate: columns[2] || '',
            lessonsCount: parseInt(columns[3]) || 0,
            isActive: columns[4] === 'Yes',
            classSeries: columns[5] ? columns[5].split(';').filter(id => id) : [],
            payments,
            visits,
            editHistory,
          };
          result.students.push(student);
        } else if (currentSection === 'coaches' && headerRow && columns.length >= headerRow.length) {
          const coach = {
            id: columns[0] || '',
            name: columns[1] || '',
            email: columns[2] || '',
            phone: columns[3] || '',
          };
          result.coaches.push(coach);
        } else if (currentSection === 'lessons' && headerRow && columns.length >= headerRow.length) {
          const lesson = {
            id: columns[0] || '',
            name: columns[1] || '',
            dayOfWeek: columns[2] || '',
            startTime: columns[3] || '',
            coachId: columns[4] || '',
            startDate: columns[5] || '',
            endDate: columns[6] || '',
            participants: columns[7] ? columns[7].split(';').filter(id => id) : [],
          };
          result.lessons.push(lesson);
        } else if (currentSection === 'visits' && headerRow && columns.length >= headerRow.length) {
          const visit = {
            id: columns[0] || '',
            date: columns[1] || '',
            lessonId: columns[2] || '',
            studentId: columns[3] || '',
            coachId: columns[4] || '',
            className: columns[5] || '',
          };
          result.visits.push(visit);
        } else if (currentSection === 'cancelled' && headerRow && columns.length >= headerRow.length) {
          const occurrenceId = columns[0] || '';
          if (occurrenceId) {
            result.lessonOccurrences[occurrenceId] = {
              cancelled: columns[1] === 'Yes',
            };
          }
        } else if (currentSection === 'config' && headerRow && i === headerIndex + 1) {
          result.membershipConfig = {
            lessonsPerPayment: parseInt(columns[0]) || 8,
            freeSkipLessons: parseInt(columns[1]) || 1,
          };
        }
      }
      
      // Validate we got some data
      if (result.students.length > 0 || result.coaches.length > 0 || result.lessons.length > 0) {
        return result;
      }
    } catch (e) {
      console.warn('Failed to parse human-readable CSV format, trying old format:', e);
    }
    
    // Fallback to old base64 format
    if (lines.length < 2) {
      throw new Error('Invalid CSV format');
    }
    
    const dataLine = lines[1];
    const columns = parseCSVLine(dataLine);
    
    let base64Data = columns[1] || '';
    base64Data = base64Data.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
    
    try {
      const jsonString = decodeURIComponent(escape(atob(base64Data)));
      return JSON.parse(jsonString);
    } catch (e) {
      try {
        return JSON.parse(base64Data);
      } catch (e2) {
        throw new Error('Invalid backup file format: ' + e.message);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadBackup = (backup) => {
    try {
      const csvData = jsonToCSV(backup.data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circus-backup-${format(backup.date, 'yyyy-MM-dd-HHmmss')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error downloading backup: ' + e.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let parsed;
        
        // Try CSV format first
        try {
          parsed = csvToJSON(content);
        } catch (csvError) {
          // Fallback to JSON format (for backward compatibility)
          try {
            parsed = JSON.parse(content);
          } catch (jsonError) {
            throw new Error('Invalid backup file format. Expected CSV or JSON.');
          }
        }
        
        // Validate it's a valid backup structure
        if (!parsed.students || !parsed.coaches || !parsed.lessons) {
          alert('Invalid backup file format. Expected students, coaches, and lessons.');
          return;
        }
        
        if (window.confirm('This will replace all current data with the uploaded backup. Are you sure?')) {
          const jsonString = JSON.stringify(parsed);
          localStorage.setItem('circusAppData', jsonString);
          dispatch({ type: 'LOAD_DATA', payload: parsed });
          handleClose();
          alert('Backup uploaded and restored! Please refresh the page.');
          setTimeout(() => window.location.reload(), 500);
        }
      } catch (error) {
        alert('Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const restoreFromJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      localStorage.setItem('circusAppData', jsonInput);
      dispatch({ type: 'LOAD_DATA', payload: parsed });
      alert('Data restored! Please refresh the page.');
      window.location.reload();
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
    }
  };

  const exportCurrentData = () => {
    try {
      const csvData = jsonToCSV(state);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circus-app-data-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error exporting data: ' + e.message);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Data Recovery Tool</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Data
            </Typography>
            {localStorageData ? (
              <Alert severity="info">
                <Typography>Coaches: {localStorageData.coaches?.length || 0}</Typography>
                <Typography>Lessons: {localStorageData.lessons?.length || 0}</Typography>
                <Typography>Students: {localStorageData.students?.length || 0}</Typography>
              </Alert>
            ) : (
              <Alert severity="warning">No data found in localStorage</Alert>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Backups ({backups.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={createBackup}
                size="small"
              >
                Add Backup
              </Button>
            </Box>
            {backups.length > 0 ? (
              <List>
                {backups.map((backup) => (
                  <ListItem
                    key={backup.key}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <ListItemText
                      primary={format(backup.date, 'MMM d, yyyy HH:mm')}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            Coaches: {backup.coaches} | Lessons: {backup.lessons} | Students: {backup.students}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Size: {formatFileSize(backup.size)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => restoreFromBackup(backup.key)}
                          color="primary"
                          title="Restore backup"
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => downloadBackup(backup)}
                          color="primary"
                          title="Download backup"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => deleteBackup(backup.key)}
                          color="error"
                          title="Delete backup"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No backups found. Click "Add Backup" to create one.</Alert>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Backup
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload a previously downloaded backup file (CSV format)
            </Alert>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              Upload Backup File
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Restore from JSON
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON data here..."
              sx={{ mb: 2 }}
            />
            <Button onClick={restoreFromJSON} variant="contained" fullWidth>
              Restore from JSON
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Current Data
            </Typography>
            <Button 
              onClick={exportCurrentData} 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              fullWidth
            >
              Download Current Data as CSV
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Generate Seed Data
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will replace all existing data with 200 students and classes for every day!
            </Alert>
            <Button 
              onClick={() => {
                if (window.confirm('This will CLEAR ALL existing data and generate 200 students + 28 classes. Are you sure?')) {
                  try {
                    console.log('=== SEED DATA GENERATION START ===');
                    
                    // First, clear ALL circus-related data from localStorage
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.includes('circus') || key.includes('Circus'))) {
                        keysToRemove.push(key);
                      }
                    }
                    keysToRemove.forEach(key => {
                      console.log('Removing old data:', key);
                      localStorage.removeItem(key);
                    });
                    
                    console.log('Current localStorage after clearing:', {
                      hasData: !!localStorage.getItem('circusAppData'),
                    });
                    
                    // Generate seed data
                    console.log('Generating seed data...');
                    const seedData = generateSeedData();
                    console.log('Generated seed data:', {
                      students: seedData.students.length,
                      coaches: seedData.coaches.length,
                      lessons: seedData.lessons.length,
                      firstStudent: seedData.students[0]?.name,
                      firstLesson: seedData.lessons[0]?.name,
                    });
                    
                    // Set new seed data
                    const dataString = JSON.stringify(seedData);
                    try {
                      localStorage.setItem('circusAppData', dataString);
                      console.log('Saved to localStorage, size:', dataString.length, 'chars');
                    } catch (e) {
                      if (e.name === 'QuotaExceededError') {
                        alert('localStorage is full! Please clear some data first.');
                        return;
                      }
                      throw e;
                    }
                    
                    // Verify it was saved correctly
                    const verify = JSON.parse(localStorage.getItem('circusAppData'));
                    console.log('Verified saved data:', {
                      students: verify.students?.length || 0,
                      coaches: verify.coaches?.length || 0,
                      lessons: verify.lessons?.length || 0,
                      firstStudentName: verify.students?.[0]?.name,
                    });
                    
                    if (verify.students?.length !== 200) {
                      throw new Error(`Expected 200 students but got ${verify.students?.length || 0}`);
                    }
                    
                    // Load into app state immediately
                    dispatch({ type: 'LOAD_DATA', payload: seedData });
                    handleClose();
                    
                    alert(`✅ Successfully generated ${seedData.students.length} students and ${seedData.lessons.length} classes!\n\nReloading page in 1 second...`);
                    console.log('=== SEED DATA GENERATION COMPLETE ===');
                    
                    // Force reload after a short delay
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  } catch (error) {
                    console.error('Error generating seed data:', error);
                    alert('Error generating seed data: ' + error.message + '\n\nCheck browser console (F12) for details.');
                  }
                }
              }} 
              variant="contained" 
              color="warning"
              fullWidth
              sx={{ mt: 2 }}
            >
              Generate 200 Students + Classes
            </Button>
            <Button 
              onClick={() => {
                if (window.confirm('This will CLEAR ALL data from localStorage. Are you sure?')) {
                  const keysToRemove = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('circus') || key.includes('Circus'))) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach(key => localStorage.removeItem(key));
                  alert('All data cleared! Reloading...');
                  window.location.reload();
                }
              }} 
              variant="outlined" 
              color="error"
              fullWidth
              sx={{ mt: 1 }}
            >
              Clear All Data
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
