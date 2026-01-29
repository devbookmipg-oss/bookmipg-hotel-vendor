'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Divider,
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

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    disabled,
    color = 'primary',
    emoji,
  }) => (
    <Button
      fullWidth
      variant="outlined"
      color={color}
      onClick={onClick}
      disabled={disabled}
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.8,
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.85rem',
        transition: 'all 0.3s ease',
        border: `2px solid`,
        borderColor: `${color}.main`,
        color: `${color}.main`,
        backgroundColor: `${color}.main15`,
        '&:hover:not(:disabled)': {
          backgroundColor: `${color}.main20`,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      }}
    >
      <Box
        sx={{
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {emoji ? emoji : <Icon sx={{ fontSize: '1.4rem' }} />}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, textAlign: 'center' }}
      >
        {label}
      </Typography>
    </Button>
  );

  const isDisabledByStatus =
    booking.booking_status === 'Cancelled' ||
    booking.booking_status === 'Blocked';

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #c20f12 0%, #e63946 100%)',
            color: '#fff',
            p: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ fontSize: '1.4rem' }}>⚙️</Box>
            <Stack spacing={0.3} flex={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontSize: '1.1rem' }}
              >
                Booking Actions
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Manage booking services, payments, checkin/checkout & more
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <CardContent>
          {/* Primary Actions Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#666', mb: 2 }}
            >
              📋 Primary Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {/* Edit Booking */}
              <Box
                component="a"
                href={`/front-office/room-booking/edit-booking?bookingId=${booking?.documentId}`}
                sx={{
                  textDecoration: 'none',
                  '&:disabled': {
                    pointerEvents: 'none',
                  },
                }}
              >
                <ActionButton
                  icon={EditIcon}
                  emoji="✏️"
                  label="Edit Booking"
                  disabled={booking.booking_status === 'Cancelled'}
                  color="primary"
                />
              </Box>

              {/* Check-In */}
              {!booking.checked_in && (
                <ActionButton
                  icon={LoginIcon}
                  emoji="🔓"
                  label="Mark Check-In"
                  onClick={() => setCheckinDialogOpen(true)}
                  disabled={isDisabledByStatus}
                  color="success"
                />
              )}

              {/* Check-Out */}
              {booking.checked_in && !booking.checked_out && (
                <ActionButton
                  icon={LogoutIcon}
                  emoji="🔒"
                  label="Mark Check-Out"
                  onClick={() => setCheckoutDialogOpen(true)}
                  disabled={isDisabledByStatus}
                  color="error"
                />
              )}

              {/* Print */}
              <ActionButton
                icon={PrintIcon}
                emoji="🖨️"
                label="Print Slip"
                onClick={handlePrintBookingSlip}
                disabled={isDisabledByStatus}
                color="info"
              />

              {/* Cancel */}
              <ActionButton
                icon={CancelIcon}
                emoji="❌"
                label="Cancel Booking"
                onClick={() => setCancelDialog(true)}
                disabled={
                  isDisabledByStatus ||
                  booking.checked_in ||
                  booking.checked_out
                }
                color="error"
              />
            </Box>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }} />

          {/* Services & Billing Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#666', mb: 2 }}
            >
              💰 Services & Billing
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {/* Manage Services */}
              <ActionButton
                icon={RoomServiceIcon}
                emoji="🛎️"
                label="Manage Services"
                onClick={() => setServiceModel(true)}
                disabled={isDisabledByStatus}
                color="secondary"
              />

              {/* Manage Food */}
              <ActionButton
                icon={FastfoodIcon}
                emoji="🍽️"
                label="Manage Food"
                onClick={() => setFoodModel(true)}
                disabled={isDisabledByStatus}
                color="success"
              />

              {/* Manage Payment */}
              <ActionButton
                icon={PaymentIcon}
                emoji="💳"
                label="Manage Payment"
                onClick={() => setPaymentModel(true)}
                disabled={isDisabledByStatus}
                color="info"
              />

              {/* Manage Room Tariff */}
              <ActionButton
                icon={HotelIcon}
                emoji="🏨"
                label="Manage Room Tariff"
                onClick={() => setRoomTariffDialog(true)}
                disabled={isDisabledByStatus}
                color="warning"
              />

              {/* Create Invoice */}
              <ActionButton
                icon={ReceiptIcon}
                emoji="📄"
                label="Create Invoice"
                onClick={() => setInvoiceModel(true)}
                disabled={isDisabledByStatus}
                color="error"
              />
            </Box>
          </Box>

          {/* Status Info */}
          {isDisabledByStatus && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#ffe6e6',
                border: '1px solid #ffcccc',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ fontSize: '1rem' }}>ℹ️</Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: '#c20f12' }}
              >
                This booking is {booking.booking_status}. Some actions are
                disabled.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

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
