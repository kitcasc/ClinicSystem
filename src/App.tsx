import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';

// Pages
import PublicView from './pages/PublicView';
import StaffView from './pages/StaffView';
import DoctorView from './pages/DoctorView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<PublicView />} />
            <Route path="/staff" element={<StaffView />} />
            <Route path="/doctor" element={<DoctorView />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 