'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import {
  Print as PrintIcon,
  RoomService as RoomServiceIcon,
  Fastfood as FastfoodIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Hotel as HotelIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { ManageFood, ManagePayments, ManageServices } from './forms';
import { UpdateData } from '@/utils/ApiFunctions';
import CancelBookingDialog from './CancelBookingDialog';

export default function BookingServiceActionsCard({
  booking,
  auth,
  paymentMethods,
  menuItems,
  handlePrintBookingSlip,
}) {
  const [serviceModel, setServiceModel] = useState(false);
  const [paymentModel, setPaymentModel] = useState(false);
  const [foodModel, setFoodModel] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const handleManageService = async (services) => {
    const cleanedServiceItems = services.map(({ id, ...rest }) => rest);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { service_billing: cleanedServiceItems } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManagePayments = async (payments) => {
    const cleanedPaymemtsItems = payments.map(({ id, ...rest }) => rest);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { payment_tokens: cleanedPaymemtsItems } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManageFood = async (foods) => {
    const cleanedFoodItems = foods.map(({ id, ...rest }) => rest);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { food_items: cleanedFoodItems } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { booking_status: 'Cancelled' } },
      });
      setCancelDialog(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 4,
          p: 2,
          mb: 3,
          pb: 14,
          background: 'linear-gradient(135deg, #fafafa, #ffffff)',
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: 2, color: 'primary.main' }}
        >
          Manage Booking Services
        </Typography>

        <Grid container spacing={2}>
          {/* Edit */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<EditIcon />}
              sx={{ textTransform: 'none' }}
            >
              Edit Booking
            </Button>
          </Grid>

          {/* Cancel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => setCancelDialog(true)}
              disabled={booking.booking_status === 'Cancelled'}
            >
              Cancel Booking
            </Button>
          </Grid>
          {!booking.checked_in && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="outlined"
                color="success"
                startIcon={<LoginIcon />}
                sx={{ textTransform: 'none' }}
                disabled={booking.booking_status === 'Cancelled'}
              >
                Mark Check-In
              </Button>
            </Grid>
          )}

          {booking.checked_in && !booking.checked_out ? (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Mark Check-Out
                </Button>
              </Grid>
            </>
          ) : (
            <></>
          )}

          {/* Print */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              sx={{ textTransform: 'none' }}
              onClick={handlePrintBookingSlip}
            >
              Print Booking Slip
            </Button>
          </Grid>

          {/* Manage Services */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<RoomServiceIcon />}
              onClick={() => setServiceModel(true)}
              sx={{ textTransform: 'none' }}
            >
              Manage Services
            </Button>
          </Grid>

          {/* Manage Food */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              startIcon={<FastfoodIcon />}
              onClick={() => setFoodModel(true)}
              sx={{ textTransform: 'none' }}
            >
              Manage Food
            </Button>
          </Grid>

          {/* Manage Payment */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentModel(true)}
              sx={{ textTransform: 'none' }}
            >
              Manage Payment
            </Button>
          </Grid>
          {/* NEW: Manage Room Tariff */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<HotelIcon />}
              sx={{ textTransform: 'none' }}
            >
              Manage Room Tariff
            </Button>
          </Grid>
          {/* Create Invoice */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ReceiptIcon />}
              sx={{ textTransform: 'none' }}
            >
              Create Invoice
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialogs */}
      <ManageServices
        open={serviceModel}
        setOpen={setServiceModel}
        booking={booking}
        handleManageService={handleManageService}
      />
      <ManagePayments
        open={paymentModel}
        setOpen={setPaymentModel}
        booking={booking}
        handleManagePayments={handleManagePayments}
        paymentMethods={paymentMethods}
      />
      <ManageFood
        open={foodModel}
        setOpen={setFoodModel}
        booking={booking}
        handleManageFood={handleManageFood}
        menuItems={menuItems}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <CancelBookingDialog
        cancelDialog={cancelDialog}
        setCancelDialog={setCancelDialog}
        handleCancelBooking={handleCancelBooking}
      />
    </>
  );
}
