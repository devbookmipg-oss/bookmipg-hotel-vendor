import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

const CheckoutDialog = ({ open, setOpen, handleSave }) => {
  return (
    <>
      <Dialog open={open}>
        <DialogTitle>Mark Check Out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to Check Out.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="outlined">
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

export default CheckoutDialog;
