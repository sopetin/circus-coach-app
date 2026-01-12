import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import FestivalIcon from '@mui/icons-material/Festival';

const menuItems = [
  { path: '/students', label: 'Students', icon: PeopleIcon },
  { path: '/lessons', label: 'Classes', icon: EventIcon },
  { path: '/visits', label: 'Visits', icon: CheckCircleIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function MainLayout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Find current navigation value
  const currentValue = menuItems.findIndex(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  const handleNavigation = (event, newValue) => {
    if (newValue !== null && menuItems[newValue]) {
      navigate(menuItems[newValue].path);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(233, 30, 99, 0.95)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
            <FestivalIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                fontFamily: '"Roboto", sans-serif',
                textTransform: 'uppercase',
                fontSize: '1.5rem',
              }}
            >
              CIRCUS
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          pb: 10, // Add padding bottom for bottom navigation
        }}
      >
        {children}
      </Box>
      <BottomNavigation
        value={currentValue >= 0 ? currentValue : 0}
        onChange={handleNavigation}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer + 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={<IconComponent />}
            />
          );
        })}
      </BottomNavigation>
    </Box>
  );
}
