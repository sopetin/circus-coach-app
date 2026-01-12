import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  students: [],
  coaches: [],
  lessons: [],
  visits: [],
  membershipConfig: {
    lessonsPerPayment: 8,
    freeSkipLessons: 1,
  },
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
    case 'ADD_LESSON':
      return {
        ...state,
        lessons: [...state.lessons, action.payload],
      };
    case 'UPDATE_LESSON':
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
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
    case 'CANCEL_LESSON':
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id ? { ...l, cancelled: true, ...action.payload } : l
        ),
      };
    case 'UNDO_CANCEL_LESSON':
      return {
        ...state,
        lessons: state.lessons.map(l =>
          l.id === action.payload.id ? { ...l, cancelled: false } : l
        ),
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('circusAppData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('circusAppData', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
