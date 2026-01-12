import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { theme } from './theme/theme';
import ScreenSelector from './screens/ScreenSelector';
import StudentsScreen from './screens/StudentsScreen';
import CoachesScreen from './screens/CoachesScreen';
import LessonsScreen from './screens/LessonsScreen';
import VisitsScreen from './screens/VisitsScreen';
import MembershipScreen from './screens/MembershipScreen';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<ScreenSelector />} />
              <Route path="/students" element={<StudentsScreen />} />
              <Route path="/coaches" element={<CoachesScreen />} />
              <Route path="/lessons" element={<LessonsScreen />} />
              <Route path="/visits" element={<VisitsScreen />} />
              <Route path="/membership" element={<MembershipScreen />} />
            </Routes>
          </MainLayout>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
