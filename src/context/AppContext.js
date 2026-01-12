import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { format } from 'date-fns';

const AppContext = createContext();

const initialState = {
  students: [],
  coaches: [],
  lessons: [], // Lesson series
  lessonOccurrences: {}, // Individual lesson occurrences that can be cancelled
  visits: [],
  membershipConfig: {
    lessonsPerPayment: 8,
    freeSkipLessons: 1,
  },
};

// Migration function to convert old data structure to new
const migrateData = (oldData) => {
  const migrated = { ...oldData };
  
  // Ensure lessonOccurrences exists
  if (!migrated.lessonOccurrences) {
    migrated.lessonOccurrences = {};
  }
  
  // Migrate lessons: convert old lesson format to lesson series
  if (migrated.lessons && migrated.lessons.length > 0) {
    migrated.lessons = migrated.lessons.map(lesson => {
      // If it's already a lesson series (has startDate/endDate), return as is
      if (lesson.startDate && lesson.endDate) {
        return lesson;
      }
      
      // Otherwise, convert old lesson to lesson series
      // Set default dates (3 months from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      
      return {
        ...lesson,
        name: lesson.className || lesson.name || 'Unnamed Lesson',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        participants: lesson.participants || [],
        // Remove old fields
        className: undefined,
        forKids: undefined,
        forAdults: undefined,
        kidsStartAge: undefined,
        kidsEndAge: undefined,
        adultsStartAge: undefined,
        adultsEndAge: undefined,
      };
    });
  }
  
  // Migrate students: convert classes array to classSeries array
  if (migrated.students && migrated.students.length > 0) {
    migrated.students = migrated.students.map(student => {
      const migratedStudent = { ...student };
      
      // If student has old 'classes' array (class names), convert to classSeries (lesson IDs)
      if (student.classes && Array.isArray(student.classes) && student.classes.length > 0) {
        // Try to match class names to lesson series
        const classSeries = [];
        student.classes.forEach(className => {
          // Try multiple matching strategies
          const matchingLesson = migrated.lessons.find(l => {
            const lessonName = l.name || l.className || '';
            return lessonName === className || 
                   lessonName.toLowerCase() === className.toLowerCase() ||
                   (l.className && l.className === className);
          });
          if (matchingLesson) {
            classSeries.push(matchingLesson.id);
          } else {
            // If no match found, log for debugging
            console.warn(`Could not match class "${className}" to any lesson series for student ${student.name}`);
          }
        });
        migratedStudent.classSeries = classSeries;
        // Keep old classes for reference but prefer classSeries
        if (classSeries.length > 0) {
          delete migratedStudent.classes;
        }
      } else if (!migratedStudent.classSeries) {
        migratedStudent.classSeries = [];
      }
      
      // Ensure new fields exist
      if (!migratedStudent.payments) {
        migratedStudent.payments = [];
      }
      if (!migratedStudent.visits) {
        migratedStudent.visits = [];
      }
      if (!migratedStudent.editHistory) {
        migratedStudent.editHistory = [];
      }
      
      // Remove old fields
      delete migratedStudent.isAdult;
      delete migratedStudent.membershipStart;
      
      return migratedStudent;
    });
  }
  
  // Ensure coaches array exists
  if (!migrated.coaches) {
    migrated.coaches = [];
  }
  
  // Ensure visits array exists
  if (!migrated.visits) {
    migrated.visits = [];
  }
  
  // Ensure membershipConfig exists
  if (!migrated.membershipConfig) {
    migrated.membershipConfig = {
      lessonsPerPayment: 8,
      freeSkipLessons: 1,
    };
  }
  
  return migrated;
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
      };
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, action.payload],
      };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    case 'ADD_COACH':
      return {
        ...state,
        coaches: [...state.coaches, action.payload],
      };
    case 'UPDATE_COACH':
      return {
        ...state,
        coaches: state.coaches.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };
    case 'ADD_LESSON_SERIES':
      return {
        ...state,
        lessons: [...state.lessons, action.payload],
      };
    case 'UPDATE_LESSON_SERIES':
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
      };
    case 'CANCEL_LESSON_OCCURRENCE':
      return {
        ...state,
        lessonOccurrences: {
          ...state.lessonOccurrences,
          [action.payload.occurrenceId]: { ...action.payload, cancelled: true },
        },
      };
    case 'UNDO_CANCEL_LESSON_OCCURRENCE':
      return {
        ...state,
        lessonOccurrences: {
          ...state.lessonOccurrences,
          [action.payload.occurrenceId]: { ...action.payload, cancelled: false },
        },
      };
    case 'ADD_VISIT':
      return {
        ...state,
        visits: [...state.visits, action.payload],
      };
    case 'REMOVE_VISIT':
      return {
        ...state,
        visits: state.visits.filter(v => v.id !== action.payload.id),
      };
    case 'ADD_PAYMENT':
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.payload.studentId) {
            const payments = s.payments || [];
            const paymentData = { ...action.payload };
            delete paymentData.studentId;
            delete paymentData.lastPaymentDate;
            delete paymentData.lessonsCount;
            return {
              ...s,
              lastPaymentDate: action.payload.lastPaymentDate || s.lastPaymentDate,
              lessonsCount: action.payload.lessonsCount !== undefined ? action.payload.lessonsCount : (s.lessonsCount || 0) + (action.payload.lessons || 8),
              payments: [...payments, paymentData],
            };
          }
          return s;
        }),
      };
    case 'ADD_EDIT_HISTORY':
      return {
        ...state,
        students: state.students.map(s => {
          if (s.id === action.payload.studentId) {
            const editHistory = s.editHistory || [];
            return {
              ...s,
              editHistory: [...editHistory, action.payload],
            };
          }
          return s;
        }),
      };
    case 'UPDATE_MEMBERSHIP_CONFIG':
      return {
        ...state,
        membershipConfig: { ...state.membershipConfig, ...action.payload },
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Load data from localStorage on mount (only once)
  useEffect(() => {
    if (isLoaded) return; // Prevent multiple loads
    
    const savedData = localStorage.getItem('circusAppData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Create backup before migration (only if data exists)
        try {
          const backupKey = `circusAppData_backup_${Date.now()}`;
          localStorage.setItem(backupKey, savedData);
          console.log('Data backed up to:', backupKey);
        } catch (backupError) {
          console.warn('Could not create backup:', backupError);
        }
        
        // Log original data for debugging
        console.log('Original data before migration:', {
          coaches: parsed.coaches?.length || 0,
          lessons: parsed.lessons?.length || 0,
          students: parsed.students?.length || 0,
          hasOldStructure: parsed.lessons?.some(l => !l.startDate) || false,
        });
        
        // Check if data is already in new format (has startDate on all lessons)
        const needsMigration = parsed.lessons && parsed.lessons.length > 0 && parsed.lessons.some(l => !l.startDate || !l.endDate);
        
        let finalData;
        if (needsMigration) {
          // Migrate old data structure to new format
          finalData = migrateData(parsed);
          console.log('Data migrated from old format');
        } else {
          // Data is already in new format, just ensure all fields exist
          finalData = {
            ...parsed,
            lessonOccurrences: parsed.lessonOccurrences || {},
            students: (parsed.students || []).map(s => ({
              ...s,
              classSeries: s.classSeries || [],
              payments: s.payments || [],
              visits: s.visits || [],
              editHistory: s.editHistory || [],
              lastPaymentDate: s.lastPaymentDate || (s.payments && s.payments.length > 0 
                ? format(new Date(s.payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date), 'yyyy-MM-dd')
                : ''),
              lessonsCount: s.lessonsCount !== undefined ? s.lessonsCount : 8,
            })),
            coaches: parsed.coaches || [],
            lessons: parsed.lessons || [],
            visits: parsed.visits || [],
            membershipConfig: parsed.membershipConfig || {
              lessonsPerPayment: 8,
              freeSkipLessons: 1,
            },
          };
          console.log('Data already in new format, no migration needed');
        }
        
        // Log final data
        console.log('Final data to load:', {
          coaches: finalData.coaches?.length || 0,
          lessons: finalData.lessons?.length || 0,
          students: finalData.students?.length || 0,
        });
        
        // Save data immediately (only if migrated)
        if (needsMigration) {
          try {
            localStorage.setItem('circusAppData', JSON.stringify(finalData));
            console.log('Migrated data saved to localStorage');
          } catch (saveError) {
            console.error('Error saving migrated data:', saveError);
          }
        }
        
        dispatch({ type: 'LOAD_DATA', payload: finalData });
        setIsLoaded(true);
        setLastSaveTime(new Date());
        console.log('Data loaded successfully:', {
          coaches: finalData.coaches?.length || 0,
          lessons: finalData.lessons?.length || 0,
          students: finalData.students?.length || 0,
        });
      } catch (e) {
        console.error('Error loading data:', e);
        // Try to restore from most recent backup
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('circusAppData_backup_')) {
            backups.push(key);
          }
        }
        if (backups.length > 0) {
          backups.sort().reverse();
          const latestBackup = backups[0];
          console.warn('Attempting to restore from backup:', latestBackup);
          try {
            const backupData = localStorage.getItem(latestBackup);
            if (backupData) {
              const parsed = JSON.parse(backupData);
              const migrated = migrateData(parsed);
              dispatch({ type: 'LOAD_DATA', payload: migrated });
              setIsLoaded(true);
              setLastSaveTime(new Date());
              console.log('Restored from backup successfully');
            }
          } catch (restoreError) {
            console.error('Failed to restore from backup:', restoreError);
            setIsLoaded(true); // Still mark as loaded to prevent infinite loop
          }
        } else {
          setIsLoaded(true); // No backups, start fresh
        }
      }
    } else {
      console.log('No saved data found in localStorage - starting fresh');
      setIsLoaded(true);
    }
  }, [isLoaded]);

  // Save data to localStorage whenever state changes (with debouncing and error handling)
  useEffect(() => {
    // Don't save until initial load is complete
    if (!isLoaded) return;
    
    // Debounce: wait 500ms before saving to avoid too many writes
    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = JSON.stringify(state);
        localStorage.setItem('circusAppData', dataToSave);
        setLastSaveTime(new Date());
        console.log('Data auto-saved:', {
          coaches: state.coaches?.length || 0,
          lessons: state.lessons?.length || 0,
          students: state.students?.length || 0,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        // Try to clear some space if quota exceeded
        if (error.name === 'QuotaExceededError') {
          console.warn('LocalStorage quota exceeded. Clearing old backups...');
          // Keep only the 5 most recent backups
          const backups = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('circusAppData_backup_')) {
              backups.push(key);
            }
          }
          backups.sort().reverse();
          // Remove old backups (keep only 5 most recent)
          backups.slice(5).forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.error('Error removing old backup:', e);
            }
          });
          // Try saving again
          try {
            localStorage.setItem('circusAppData', JSON.stringify(state));
            setLastSaveTime(new Date());
            console.log('Data saved after clearing old backups');
          } catch (retryError) {
            console.error('Still unable to save after clearing backups:', retryError);
          }
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [state, isLoaded]);

  // Also save before page unload (immediate save, no debounce)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem('circusAppData', JSON.stringify(state));
        console.log('Data saved before page unload');
      } catch (error) {
        console.error('Error saving before unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Expose save function for manual saves
  const saveData = React.useCallback(() => {
    try {
      localStorage.setItem('circusAppData', JSON.stringify(state));
      setLastSaveTime(new Date());
      console.log('Data manually saved');
      return true;
    } catch (error) {
      console.error('Error manually saving:', error);
      return false;
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch, saveData, lastSaveTime }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
