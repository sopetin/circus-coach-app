import { createTheme } from '@mui/material/styles';

// Circus color palette - vibrant but professional
const circusColors = {
  primary: '#d32f2f', // Deep red (circus tent)
  secondary: '#ff6f00', // Orange (circus energy)
  accent: '#fbc02d', // Yellow (circus lights)
  success: '#388e3c', // Green
  warning: '#f57c00', // Orange
  error: '#d32f2f', // Red
  info: '#1976d2', // Blue
  background: '#fafafa',
  paper: '#ffffff',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: circusColors.primary,
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#fff',
    },
    secondary: {
      main: circusColors.secondary,
      light: '#ff9f40',
      dark: '#c43e00',
      contrastText: '#fff',
    },
    error: {
      main: circusColors.error,
    },
    warning: {
      main: circusColors.warning,
    },
    info: {
      main: circusColors.info,
    },
    success: {
      main: circusColors.success,
    },
    background: {
      default: circusColors.background,
      paper: circusColors.paper,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
