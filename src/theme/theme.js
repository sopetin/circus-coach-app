import { createTheme } from '@mui/material/styles';

// Modern circus color palette - vibrant but elegant
const circusColors = {
  primary: '#e91e63', // Modern pink-red
  secondary: '#ff6b35', // Vibrant orange
  accent: '#ffd23f', // Bright yellow
  success: '#4caf50', // Fresh green
  warning: '#ff9800', // Warm orange
  error: '#f44336', // Clear red
  info: '#2196f3', // Bright blue
  background: '#fafbfc',
  paper: '#ffffff',
  surface: '#f5f7fa',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: circusColors.primary,
      light: '#f48fb1',
      dark: '#c2185b',
      contrastText: '#fff',
    },
    secondary: {
      main: circusColors.secondary,
      light: '#ff9a66',
      dark: '#e65100',
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
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    overline: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.04)',
    '0px 4px 8px rgba(0,0,0,0.06)',
    '0px 8px 16px rgba(0,0,0,0.08)',
    '0px 12px 24px rgba(0,0,0,0.1)',
    '0px 16px 32px rgba(0,0,0,0.12)',
    '0px 20px 40px rgba(0,0,0,0.14)',
    '0px 24px 48px rgba(0,0,0,0.16)',
    '0px 28px 56px rgba(0,0,0,0.18)',
    '0px 32px 64px rgba(0,0,0,0.2)',
    '0px 36px 72px rgba(0,0,0,0.22)',
    '0px 40px 80px rgba(0,0,0,0.24)',
    '0px 44px 88px rgba(0,0,0,0.26)',
    '0px 48px 96px rgba(0,0,0,0.28)',
    '0px 52px 104px rgba(0,0,0,0.3)',
    '0px 56px 112px rgba(0,0,0,0.32)',
    '0px 60px 120px rgba(0,0,0,0.34)',
    '0px 64px 128px rgba(0,0,0,0.36)',
    '0px 68px 136px rgba(0,0,0,0.38)',
    '0px 72px 144px rgba(0,0,0,0.4)',
    '0px 76px 152px rgba(0,0,0,0.42)',
    '0px 80px 160px rgba(0,0,0,0.44)',
    '0px 84px 168px rgba(0,0,0,0.46)',
    '0px 88px 176px rgba(0,0,0,0.48)',
    '0px 92px 184px rgba(0,0,0,0.5)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: '#ffffff',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0px 24px 48px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${circusColors.primary} 0%, ${circusColors.secondary} 100%)`,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0px 16px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(233, 30, 99, 0.08)',
          },
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${circusColors.primary} 0%, ${circusColors.secondary} 100%)`,
            color: 'white',
            '&:hover': {
              background: `linear-gradient(135deg, ${circusColors.primary}dd 0%, ${circusColors.secondary}dd 100%)`,
            },
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(233, 30, 99, 0.08)',
          },
          '&.Mui-selected': {
            background: `linear-gradient(135deg, ${circusColors.primary} 0%, ${circusColors.secondary} 100%)`,
            color: 'white',
            border: 'none',
            '&:hover': {
              background: `linear-gradient(135deg, ${circusColors.primary}dd 0%, ${circusColors.secondary}dd 100%)`,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          minHeight: 48,
          fontFamily: '"Roboto", sans-serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
        },
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.3,
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
          lineHeight: 1.4,
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1.125rem',
          lineHeight: 1.4,
        },
        body1: {
          fontWeight: 400,
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontWeight: 400,
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
        caption: {
          fontWeight: 400,
          fontSize: '0.75rem',
          lineHeight: 1.4,
        },
        subtitle1: {
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1.5,
        },
        subtitle2: {
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            fontFamily: '"Roboto", sans-serif',
            fontSize: '0.9375rem',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: circusColors.primary,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Roboto", sans-serif',
            fontSize: '0.9375rem',
            fontWeight: 500,
          },
          '& .MuiInputBase-input': {
            fontFamily: '"Roboto", sans-serif',
            fontSize: '0.9375rem',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
          fontSize: '0.9375rem',
          fontFamily: '"Roboto", sans-serif',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${circusColors.primary} 0%, ${circusColors.secondary} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${circusColors.primary}dd 0%, ${circusColors.secondary}dd 100%)`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
          fontFamily: '"Roboto", sans-serif',
          height: 28,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 500,
          fontSize: '0.9375rem',
        },
        secondary: {
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 400,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        label: {
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: '"Roboto", sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '0.875rem',
          fontWeight: 400,
        },
        head: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        body: {
          fontWeight: 400,
          fontSize: '0.875rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '0.9375rem',
          fontWeight: 400,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
          fontWeight: 500,
          fontSize: '0.9375rem',
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '0.75rem',
          fontWeight: 400,
        },
      },
    },
  },
});
