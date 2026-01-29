'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  CurrencyRupee as RupeeIcon,
  Payment as PaymentIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotesIcon from '@mui/icons-material/Notes';
import { GetCustomDate } from '@/utils/DateFetcher';
import { PaymentSlip } from '../printables/PaymentSlip';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { UpdateData } from '@/utils/ApiFunctions';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

export default function PaymentHistoryCard({ booking, hotel, auth }) {
  const payments = booking?.payment_tokens || [];
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // ---- Summary calculations ----
  const totalAmount = payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );
  const advancePayment = booking?.advance_payment || null;
  const advanceAmount = advancePayment?.amount || 0;
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0,
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0,
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0,
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;
  const amountPayed = totalAmount + advanceAmount;
  const dueAmount = grandTotal - amountPayed;

  // ---- Printing logic ----
  const componentRef = useRef(null);
  const handleReactToPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'res-inv',
  });
  const handlePrint = (row) => {
    setSelectedPayment(row);
    setTimeout(() => handleReactToPrint(), 100);
  };

  // ---- Delete logic ----
  const handleOpenDeleteDialog = (payment) => {
    setPaymentToDelete(payment);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      const filteredPayments = payments.filter(
        (p) => p.id !== paymentToDelete.id,
      );
      const cleanedPaymentsItems = filteredPayments.map(
        ({ id, ...rest }) => rest,
      );

      await UpdateData({
        endPoint: 'room-bookings',
        id: booking.documentId,
        payload: { data: { payment_tokens: cleanedPaymentsItems } },
        auth: auth,
      });

      SuccessToast('Payment record deleted successfully');
    } catch (err) {
      console.error('Error deleting payment record:', err);
      ErrorToast('Failed to delete payment record');
    } finally {
      setDeleteOpen(false);
      setPaymentToDelete(null);
    }
  };

  const SummaryBox = ({ icon: Icon, label, amount, color, bgColor }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
        border: `2px solid ${bgColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${bgColor}30`,
        },
      }}
    >
      <Box
        sx={{
          p: 0.8,
          borderRadius: 1,
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Icon sx={{ fontSize: '1.3rem' }} />
      </Box>
      <Stack spacing={0.3} flex={1}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          ₹{parseFloat(amount).toFixed(2)}
        </Typography>
      </Stack>
    </Box>
  );

  const PaymentCard = ({ payment, index }) => {
    const paymentDate = GetCustomDate(payment.date);
    const modeIcon = {
      Cash: '💵',
      Card: '💳',
      Cheque: '✓',
      UPI: '📱',
      'Bank Transfer': '🏦',
    };

    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          border: '1px solid #e8e8e8',
          background: '#fafafa',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            transform: 'translateX(4px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            borderRadius: '4px 0 0 4px',
            background: 'linear-gradient(180deg, #27ae60, #2ecc71)',
          },
        }}
      >
        {/* Header: Mode & Actions */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ fontSize: '1.3rem' }}>
              {modeIcon[payment.mode] || '💰'}
            </Box>
            <Stack spacing={0.3}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: '#1a1a1a' }}
              >
                {payment.mode || 'Unknown'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Payment #{index + 1}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handlePrint(payment)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(39, 174, 96, 0.1)',
                },
              }}
            >
              <PrintIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleOpenDeleteDialog(payment)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Amount */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            backgroundColor: 'rgba(194, 15, 18, 0.05)',
            border: '1px solid rgba(194, 15, 18, 0.1)',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
            Amount Paid
          </Typography>
          <Stack direction="row" spacing={0.3} alignItems="center">
            <RupeeIcon sx={{ fontSize: '1rem', color: '#c20f12' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#c20f12' }}>
              {payment.amount}
            </Typography>
          </Stack>
        </Box>

        {/* Details Grid */}
        <Stack spacing={1} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthIcon sx={{ fontSize: '1rem', color: '#3498db' }} />
            <Stack spacing={0.3} flex={1}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: '#999',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Date
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#1a1a1a' }}
              >
                {paymentDate || '—'}
              </Typography>
            </Stack>
          </Stack>

          {payment.remark && (
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <NotesIcon sx={{ fontSize: '1rem', color: '#f39c12', mt: 0.5 }} />
              <Stack spacing={0.3} flex={1}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: '#999',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                  }}
                >
                  Remarks
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#1a1a1a',
                    wordBreak: 'break-word',
                  }}
                >
                  {payment.remark}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>

        {/* Status Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label="Completed"
            color="success"
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Box>
      </Box>
    );
  };

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
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            color: '#fff',
            p: 2.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ fontSize: '1.4rem' }}>💳</Box>
            <Stack spacing={0.3} flex={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontSize: '1.1rem' }}
              >
                Payment History
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Track all payments & outstanding balance
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <CardContent>
          {/* Summary Section */}
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#666' }}
            >
              📊 Payment Summary
            </Typography>
            <Stack spacing={1}>
              <SummaryBox
                icon={RupeeIcon}
                label="Grand Total"
                amount={grandTotal}
                bgColor="#c20f12"
              />
              <SummaryBox
                icon={CheckCircleIcon}
                label="Total Paid"
                amount={amountPayed}
                bgColor="#27ae60"
              />
              <SummaryBox
                icon={AccessTimeIcon}
                label="Due Amount"
                amount={dueAmount}
                bgColor="#e74c3c"
              />
            </Stack>
          </Stack>

          {/* Divider */}
          <Box
            sx={{
              height: '1px',
              background:
                'linear-gradient(to right, transparent, #ddd, transparent)',
              my: 3,
            }}
          />

          {/* Payment List */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#666', mb: 1.5 }}
            >
              📋 Payment Records ({payments.length})
            </Typography>

            {payments.length > 0 ? (
              <Stack spacing={1.5}>
                {payments.map((payment, index) => (
                  <PaymentCard key={index} payment={payment} index={index} />
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px dashed #ddd',
                }}
              >
                <Box sx={{ fontSize: '2rem', mb: 1 }}>💼</Box>
                <Typography variant="body2" color="text.secondary">
                  No payment records found. Start by adding payment details.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Hidden Printable Component */}
      <div style={{ display: 'none' }}>
        <PaymentSlip
          ref={componentRef}
          data={selectedPayment}
          hotel={hotel}
          booking={booking}
          size="58mm"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment record of{' '}
            <strong>₹{paymentToDelete?.amount}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
