import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { theme } from './theme/theme';
import StudentsScreen from './screens/StudentsScreen';
import LessonsScreen from './screens/LessonsScreen';
import VisitsScreen from './screens/VisitsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MainLayout from './components/MainLayout';
import DataRecovery from './components/DataRecovery';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/students" replace />} />
              <Route path="/students" element={<StudentsScreen />} />
              <Route path="/lessons" element={<LessonsScreen />} />
              <Route path="/visits" element={<VisitsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
            <DataRecovery />
          </MainLayout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
