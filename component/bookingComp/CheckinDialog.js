import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const CheckinDialog = ({ open, setopen, handleSave }) => {
  return (
    <>
      <Dialog open={open} onClose={() => setopen(false)}>
        <DialogTitle>Mark Check In</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to Check In.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setopen(false)} variant="outlined">
            No
          </Button>
          <Button onClick={handleSave} color="success" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CheckinDialog;
