'use client';
import GlobalProvider from '@/context';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalProvider>
            {children}
            <ToastContainer />
          </GlobalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
