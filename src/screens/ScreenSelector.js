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
    color: '#e91e63',
  },
  {
    path: '/coaches',
    title: 'Coaches',
    icon: <PersonIcon sx={{ fontSize: 60 }} />,
    description: 'Manage coaches and view dashboards',
    color: '#ff6b35',
  },
  {
    path: '/lessons',
    title: 'Classes',
    icon: <EventIcon sx={{ fontSize: 60 }} />,
    description: 'Configure classes and calendar',
    color: '#ffd23f',
  },
  {
    path: '/visits',
    title: 'Visits',
    icon: <CheckCircleIcon sx={{ fontSize: 60 }} />,
    description: 'Track student visits and attendance',
    color: '#4caf50',
  },
  {
    path: '/membership',
    title: 'Membership',
    icon: <SettingsIcon sx={{ fontSize: 60 }} />,
    description: 'Configure membership settings',
    color: '#2196f3',
  },
];

export default function ScreenSelector() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700, background: 'linear-gradient(135deg, #e91e63 0%, #ff6b35 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Select Screen
      </Typography>
      <Grid container spacing={3}>
        {screens.map((screen) => (
          <Grid item xs={12} sm={6} md={4} key={screen.path}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${screen.color}15 0%, ${screen.color}05 100%)`,
                border: `1px solid ${screen.color}20`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0px 12px 32px ${screen.color}40`,
                  border: `1px solid ${screen.color}40`,
                },
              }}
              className="fade-in"
            >
              <CardActionArea
                onClick={() => navigate(screen.path)}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      color: screen.color,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${screen.color}20 0%, ${screen.color}10 100%)`,
                        mb: 2,
                      }}
                    >
                      {screen.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ mt: 1, mb: 1, fontWeight: 700 }}
                    >
                      {screen.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
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
