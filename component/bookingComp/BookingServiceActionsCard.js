'use client';

import { useState } from 'react';
import { Paper, Typography, Grid, Button, Stack, Box } from '@mui/material';
import {
  Printer,
  Utensils,
  CreditCard,
  FileText,
  X,
  Edit,
  Hotel,
  LogIn,
  LogOut,
  Package,
} from 'lucide-react';

import {
  CreateInvoiceModal,
  ManageFood,
  ManagePayments,
  ManageRoomTariff,
  ManageServices,
} from './forms';
import { UpdateData } from '@/utils/ApiFunctions';
import CancelBookingDialog from './CancelBookingDialog';

import { SuccessToast } from '@/utils/GenerateToast';
import CheckoutDialog from './CheckoutDialog';
import CheckinDialog from './CheckinDialog';

const ActionButton = ({
  icon: Icon,
  label,
  color = 'primary',
  disabled = false,
  ...props
}) => {
  const colorMap = {
    primary: '#c20f12', // Red
    error: '#e74c3c', // Dark Red
    success: '#27ae60', // Green
    info: '#3498db', // Blue
    warning: '#f39c12', // Orange
  };

  return (
    <Button
      fullWidth
      variant="contained"
      disabled={disabled}
      sx={{
        backgroundColor: colorMap[color] || colorMap.primary,
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.813rem',
        textTransform: 'none',
        padding: '10px 8px',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&:hover:not(:disabled)': {
          opacity: 0.85,
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      }}
      {...props}
    >
      <Icon size={16} />
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
    </Button>
  );
};

export default function BookingServiceActionsCard({
  booking,
  auth,
  paymentMethods,
  menuItems,
  handlePrintBookingSlip,
  roomInvoices,
}) {
  const [invoiceModel, setInvoiceModel] = useState(false);
  const [serviceModel, setServiceModel] = useState(false);
  const [paymentModel, setPaymentModel] = useState(false);
  const [foodModel, setFoodModel] = useState(false);
  const [roomTariffDialog, setRoomTariffDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  // update service tokens
  const handleManageService = async (service) => {
    const prevServices = booking?.service_tokens || [];
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { service_tokens: [...prevServices, service] } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  // update food tokens
  const handleManageFood = async (food) => {
    const prevFoods = booking?.food_tokens || [];
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { food_tokens: [...prevFoods, food] } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManageRoomTariff = async (roomTokens) => {
    const cleanedRoomTokens = roomTokens.map(({ id, ...rest }) => rest);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { room_tokens: cleanedRoomTokens } },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };

  const handleManagePayments = async (payment) => {
    const prevPayments = booking?.payment_tokens || [];
    const newPaymentArray = [...prevPayments, payment];
    const cleanedPaymemtsItems = newPaymentArray.map(({ id, ...rest }) => rest);
    const res = await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: { data: { payment_tokens: cleanedPaymemtsItems } },
    });
    return res;
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

  const handleCheckin = async () => {
    await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: { data: { checked_in: true } },
    });
    setCheckinDialogOpen(false);
    SuccessToast('Checked In Successfully');
  };
  const handleCheckout = async () => {
    await UpdateData({
      endPoint: 'room-bookings',
      auth,
      id: booking?.documentId,
      payload: { data: { checked_out: true } },
    });
    setCheckoutDialogOpen(false);
    SuccessToast('Checked Out Successfully');
  };
  return (
    <>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 1.5,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          mb: 3,
          backgroundColor: '#fafafa',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
            p: 2.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '0.938rem',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Booking Actions
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            {/* Primary Actions */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#666',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Primary Actions
              </Typography>
              <Stack spacing={1.5}>
                <ActionButton
                  icon={Edit}
                  label="Edit Booking"
                  color="primary"
                  href={`/front-office/room-booking/edit-booking?bookingId=${booking?.documentId}`}
                  component="a"
                  disabled={booking.booking_status === 'Cancelled'}
                />
                {!booking.checked_in && (
                  <ActionButton
                    icon={LogIn}
                    label="Mark Check-In"
                    color="success"
                    disabled={
                      booking.booking_status === 'Cancelled' ||
                      booking.booking_status === 'Blocked'
                    }
                    onClick={() => setCheckinDialogOpen(true)}
                  />
                )}
                {booking.checked_in && !booking.checked_out && (
                  <ActionButton
                    icon={LogOut}
                    label="Mark Check-Out"
                    color="error"
                    disabled={booking.booking_status === 'Blocked'}
                    onClick={() => setCheckoutDialogOpen(true)}
                  />
                )}
              </Stack>
            </Box>

            {/* Divider */}
            <Box sx={{ height: '1px', backgroundColor: '#e0e0e0' }} />

            {/* Manage Charges */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#666',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Manage Charges
              </Typography>
              <Stack spacing={1.5}>
                <ActionButton
                  icon={Hotel}
                  label="Room Tariff"
                  color="warning"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={() => setRoomTariffDialog(true)}
                />
                <ActionButton
                  icon={Package}
                  label="Manage Services"
                  color="warning"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={() => setServiceModel(true)}
                />
                <ActionButton
                  icon={Utensils}
                  label="Manage Food"
                  color="warning"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={() => setFoodModel(true)}
                />
              </Stack>
            </Box>

            {/* Divider */}
            <Box sx={{ height: '1px', backgroundColor: '#e0e0e0' }} />

            {/* Financial */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#666',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Financial
              </Typography>
              <Stack spacing={1.5}>
                <ActionButton
                  icon={CreditCard}
                  label="Manage Payment"
                  color="info"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={() => setPaymentModel(true)}
                />
                <ActionButton
                  icon={FileText}
                  label="Create Invoice"
                  color="info"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={() => setInvoiceModel(true)}
                />
              </Stack>
            </Box>

            {/* Divider */}
            <Box sx={{ height: '1px', backgroundColor: '#e0e0e0' }} />

            {/* Other Actions */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#666',
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Other Actions
              </Typography>
              <Stack spacing={1.5}>
                <ActionButton
                  icon={Printer}
                  label="Print Booking Slip"
                  color="primary"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.booking_status === 'Blocked'
                  }
                  onClick={handlePrintBookingSlip}
                />
                <ActionButton
                  icon={X}
                  label="Cancel Booking"
                  color="error"
                  disabled={
                    booking.booking_status === 'Cancelled' ||
                    booking.checked_in === true ||
                    booking.checked_out == true
                  }
                  onClick={() => setCancelDialog(true)}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
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
      <ManageRoomTariff
        open={roomTariffDialog}
        setOpen={setRoomTariffDialog}
        booking={booking}
        handleManageRoomTariff={handleManageRoomTariff}
      />
      <CreateInvoiceModal
        open={invoiceModel}
        setOpen={setInvoiceModel}
        booking={booking}
        roomInvoices={roomInvoices}
        paymentMethods={paymentMethods}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <CancelBookingDialog
        cancelDialog={cancelDialog}
        setCancelDialog={setCancelDialog}
        handleCancelBooking={handleCancelBooking}
      />
      <CheckinDialog
        open={checkinDialogOpen}
        setOpen={setCheckinDialogOpen}
        handleSave={handleCheckin}
      />
      <CheckoutDialog
        open={checkoutDialogOpen}
        setOpen={setCheckoutDialogOpen}
        handleSave={handleCheckout}
      />
    </>
  );
}
