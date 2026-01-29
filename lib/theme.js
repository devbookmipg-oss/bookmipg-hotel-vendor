import { createTheme } from '@mui/material/styles';

const PRIMARY_COLOR = '#c20f12';
const PRIMARY_LIGHT = '#e63946';
const PRIMARY_DARK = '#a00c0f';
const SECONDARY_COLOR = '#f77f88';
const NEUTRAL_DARK = '#2c3e50';
const NEUTRAL_LIGHT = '#ecf0f1';
const SUCCESS_COLOR = '#27ae60';
const WARNING_COLOR = '#f39c12';
const ERROR_COLOR = '#e74c3c';
const INFO_COLOR = '#3498db';

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#fff',
    },
    secondary: {
      main: SECONDARY_COLOR,
      light: '#f9a3ad',
      dark: '#d4525d',
      contrastText: '#fff',
    },
    success: {
      main: SUCCESS_COLOR,
      light: '#52c77d',
      dark: '#1e8449',
    },
    warning: {
      main: WARNING_COLOR,
      light: '#f5b041',
      dark: '#ca6f1e',
    },
    error: {
      main: ERROR_COLOR,
      light: '#ec7063',
      dark: '#c0392b',
    },
    info: {
      main: INFO_COLOR,
      light: '#5dade2',
      dark: '#2980b9',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: NEUTRAL_DARK,
      secondary: '#7f8c8d',
      disabled: '#bdc3c7',
    },
    divider: '#ecf0f1',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.95rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  spacing: 4,
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: 6,
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        sizeMedium: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
      },
      defaultProps: {
        variant: 'contained',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: PRIMARY_COLOR,
            },
            '&.Mui-focused fieldset': {
              borderColor: PRIMARY_COLOR,
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input::placeholder': {
            opacity: 0.6,
          },
        },
      },
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
        input: {
          padding: '8px 12px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: NEUTRAL_DARK,
          '&.Mui-focused': {
            color: PRIMARY_COLOR,
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: PRIMARY_COLOR,
          '& .MuiTableCell-head': {
            backgroundColor: PRIMARY_COLOR,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            padding: '8px 12px',
            borderBottom: `2px solid ${PRIMARY_DARK}`,
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: 'rgba(194, 15, 18, 0.04)',
            },
            '& .MuiTableCell-body': {
              fontSize: '0.8125rem',
              padding: '6px 12px',
              borderBottom: `1px solid #f0f0f0`,
            },
          },
          '& .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: 'rgba(248, 249, 250, 0.5)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        body: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          lineHeight: 1.4,
        },
        head: {
          padding: '8px 12px',
          fontSize: '0.8125rem',
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          fontWeight: 700,
          color: PRIMARY_COLOR,
          padding: '16px 24px',
          borderBottom: `1px solid ${NEUTRAL_LIGHT}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '20px 24px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px',
          gap: '8px',
          justifyContent: 'flex-end',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          height: '24px',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: NEUTRAL_LIGHT,
          color: NEUTRAL_DARK,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '6px',
          borderRadius: 6,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(194, 15, 18, 0.08)',
          },
        },
        small: {
          padding: '4px',
        },
        medium: {
          padding: '6px',
        },
        large: {
          padding: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${NEUTRAL_LIGHT}`,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          '&:last-child': {
            paddingBottom: '12px',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          borderColor: '#e0e0e0',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: PRIMARY_COLOR,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            padding: '8px 4px',
          },
          '& .MuiDataGrid-cell': {
            padding: '4px 8px',
            fontSize: '0.8125rem',
            borderBottom: `1px solid #f0f0f0`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(194, 15, 18, 0.04)',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'rgba(194, 15, 18, 0.08)',
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
        separator: {
          margin: '0 4px',
        },
        li: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            fontSize: '0.8125rem',
            minWidth: '28px',
            height: '28px',
            margin: '0 2px',
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4,
          borderRadius: 2,
          backgroundColor: '#e0e0e0',
        },
        bar: {
          borderRadius: 2,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '8px 12px',
          borderRadius: 6,
        },
        icon: {
          marginRight: '8px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: NEUTRAL_DARK,
          color: '#ffffff',
          fontSize: '0.75rem',
          padding: '6px 10px',
          borderRadius: 4,
        },
        arrow: {
          color: NEUTRAL_DARK,
        },
      },
    },
  },
});

export default theme;
