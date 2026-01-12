import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { loadDataFromFirebase, saveDataToFirebase, setupFirebaseListener, isFirebaseConfigured } from '../utils/firebaseSync';

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
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const isInitialMount = useRef(true);
  const isFirebaseUpdate = useRef(false); // Track if update is from Firebase to prevent save loop
  const firebaseUnsubscribe = useRef(null);

  // Helper function to process and migrate data
  const processData = (parsed) => {
    // Check if data is already in new format (has startDate on all lessons)
    const needsMigration = parsed.lessons && parsed.lessons.length > 0 && parsed.lessons.some(l => !l.startDate || !l.endDate);
    
    let finalData;
    if (needsMigration) {
      finalData = migrateData(parsed);
      console.log('Data migrated from old format');
    } else {
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
    return finalData;
  };

  // Load data from Firebase and localStorage on mount
  useEffect(() => {
    const loadInitialData = async () => {
      let loadedData = null;
      let dataSource = 'none';

      // Try Firebase first if configured
      if (isFirebaseConfigured()) {
        try {
          const firebaseData = await loadDataFromFirebase();
          if (firebaseData) {
            loadedData = firebaseData;
            dataSource = 'firebase';
            console.log('Data loaded from Firebase');
          }
        } catch (error) {
          console.error('Error loading from Firebase:', error);
        }
      }

      // Fallback to localStorage if Firebase didn't have data
      if (!loadedData) {
        const savedData = localStorage.getItem('circusAppData');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            loadedData = parsed;
            dataSource = 'localStorage';
            
            // Create backup before migration (only if data exists)
            try {
              const backupKey = `circusAppData_backup_${Date.now()}`;
              localStorage.setItem(backupKey, savedData);
              console.log('Data backed up to:', backupKey);
            } catch (backupError) {
              console.warn('Could not create backup:', backupError);
            }
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
          }
        }
      }

      // Process and load the data
      if (loadedData) {
        const finalData = processData(loadedData);
        isFirebaseUpdate.current = true; // Prevent saving back to Firebase immediately
        dispatch({ type: 'LOAD_DATA', payload: finalData });
        setLastSaveTime(new Date());
        console.log(`Data loaded successfully from ${dataSource}:`, {
          coaches: finalData.coaches?.length || 0,
          lessons: finalData.lessons?.length || 0,
          students: finalData.students?.length || 0,
        });
        
        // If we loaded from localStorage and Firebase is configured, sync to Firebase
        if (dataSource === 'localStorage' && isFirebaseConfigured()) {
          setTimeout(() => {
            saveDataToFirebase(finalData).then(success => {
              if (success) {
                console.log('Local data synced to Firebase');
              }
            });
          }, 1000); // Small delay to ensure state is set
        }
      } else {
        console.log('No saved data found - starting fresh');
      }

      isInitialMount.current = false;
    };

    loadInitialData();
  }, []);

  // Set up Firebase real-time listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    // Set up listener for real-time updates
    const unsubscribe = setupFirebaseListener((firebaseData) => {
      if (!firebaseData) return;
      
      // Don't process if this is the initial load (already handled above)
      if (isInitialMount.current) return;
      
      // Don't process if we just saved this data
      if (isFirebaseUpdate.current) {
        isFirebaseUpdate.current = false;
        return;
      }

      console.log('Real-time update received from Firebase');
      const finalData = processData(firebaseData);
      isFirebaseUpdate.current = true; // Prevent saving back
      dispatch({ type: 'LOAD_DATA', payload: finalData });
      setLastSaveTime(new Date());
      
      // Also update localStorage
      try {
        localStorage.setItem('circusAppData', JSON.stringify(finalData));
      } catch (error) {
        console.error('Error updating localStorage from Firebase:', error);
      }
    });

    firebaseUnsubscribe.current = unsubscribe;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Save data to localStorage and Firebase whenever state changes (with debouncing)
  useEffect(() => {
    // Skip if this is an update from Firebase (to prevent save loop)
    if (isFirebaseUpdate.current) {
      isFirebaseUpdate.current = false;
      return;
    }

    // Skip initial mount
    if (isInitialMount.current) {
      return;
    }

    // Debounce: wait 500ms before saving to avoid too many writes
    const timeoutId = setTimeout(() => {
      // Save to localStorage
      try {
        localStorage.setItem('circusAppData', JSON.stringify(state));
        setLastSaveTime(new Date());
        console.log('Data saved to localStorage');
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

      // Save to Firebase if configured
      if (isFirebaseConfigured()) {
        saveDataToFirebase(state).then(success => {
          if (success) {
            console.log('Data saved to Firebase');
          } else {
            console.warn('Failed to save to Firebase');
          }
        }).catch(error => {
          console.error('Error saving to Firebase:', error);
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Also save before page unload (immediate save, no debounce)
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem('circusAppData', JSON.stringify(state));
        console.log('Data saved before page unload');
        
        // Also save to Firebase synchronously if possible
        if (isFirebaseConfigured()) {
          // Use sendBeacon or similar for reliable save on unload
          saveDataToFirebase(state).catch(error => {
            console.error('Error saving to Firebase on unload:', error);
          });
        }
      } catch (error) {
        console.error('Error saving before unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Expose save function for manual saves
  const saveData = React.useCallback(async () => {
    try {
      localStorage.setItem('circusAppData', JSON.stringify(state));
      setLastSaveTime(new Date());
      console.log('Data manually saved to localStorage');
      
      // Also save to Firebase if configured
      if (isFirebaseConfigured()) {
        const success = await saveDataToFirebase(state);
        if (success) {
          console.log('Data manually saved to Firebase');
          return true;
        } else {
          console.warn('Failed to save to Firebase');
          return false;
        }
      }
      
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
