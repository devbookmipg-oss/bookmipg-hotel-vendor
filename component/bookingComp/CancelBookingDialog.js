import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const CancelBookingDialog = ({
  cancelDialog,
  setCancelDialog,
  handleCancelBooking,
}) => {
  return (
    <>
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>🚫Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)} variant="outlined">
            No
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="success"
            variant="contained"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelBookingDialog;
