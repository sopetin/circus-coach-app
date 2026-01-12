import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';

const screens = [
  {
    path: '/students',
    title: 'Students',
    icon: <PeopleIcon sx={{ fontSize: 60 }} />,
    description: 'Add and manage students, track membership and balance',
    color: '#d32f2f',
  },
  {
    path: '/coaches',
    title: 'Coaches',
    icon: <PersonIcon sx={{ fontSize: 60 }} />,
    description: 'Manage coaches and view dashboards',
    color: '#ff6f00',
  },
  {
    path: '/lessons',
    title: 'Lessons',
    icon: <EventIcon sx={{ fontSize: 60 }} />,
    description: 'Configure lessons and calendar',
    color: '#fbc02d',
  },
  {
    path: '/visits',
    title: 'Visits',
    icon: <CheckCircleIcon sx={{ fontSize: 60 }} />,
    description: 'Track student visits and attendance',
    color: '#388e3c',
  },
  {
    path: '/membership',
    title: 'Membership',
    icon: <SettingsIcon sx={{ fontSize: 60 }} />,
    description: 'Configure membership settings',
    color: '#1976d2',
  },
];

export default function ScreenSelector() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Select Screen
      </Typography>
      <Grid container spacing={3}>
        {screens.map((screen) => (
          <Grid item xs={12} sm={6} md={4} key={screen.path}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(screen.path)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: screen.color,
                    }}
                  >
                    {screen.icon}
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                    >
                      {screen.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {screen.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
