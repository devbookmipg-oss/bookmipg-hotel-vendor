'use client';
import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

const Loader = () => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={100} />
        <Typography mt={2}>Loading Data...</Typography>
      </Box>
    </>
  );
};

export default Loader;
