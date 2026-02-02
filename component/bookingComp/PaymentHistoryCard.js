'use client';

import {
  Paper,
  Typography,
  Box,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  Grid,
} from '@mui/material';
import { CreditCard, Calendar, FileText, Trash2 } from 'lucide-react';
import { GetCustomDate } from '@/utils/DateFetcher';
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

  const SummaryBox = ({ label, amount, bgColor, accentColor }) => (
    <Box sx={{ backgroundColor: bgColor, p: 2, borderRadius: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: '#666',
          fontWeight: 600,
          mb: 0.5,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          color: accentColor,
          fontSize: '1.125rem',
        }}
      >
        ₹ {amount.toFixed(2)}
      </Typography>
    </Box>
  );

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
            Payment Status
          </Typography>
        </Box>

        {/* Summary Boxes */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <SummaryBox
              label="Grand Total"
              amount={grandTotal}
              bgColor="#f0f7ff"
              accentColor="#c20f12"
            />
            <SummaryBox
              label="Total Paid"
              amount={amountPayed}
              bgColor="#f5fff7"
              accentColor="#27ae60"
            />
            <SummaryBox
              label="Due Amount"
              amount={Math.max(dueAmount, 0)}
              bgColor="#fff5f7"
              accentColor={dueAmount > 0 ? '#e74c3c' : '#27ae60'}
            />
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#e0e0e0' }} />

        {/* Payment Records */}
        <Box sx={{ p: 3 }}>
          {payments?.length > 0 ? (
            <Stack spacing={2}>
              {payments.map((p, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box flex={1}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ mb: 1.5 }}
                      >
                        <Box sx={{ color: '#c20f12' }}>
                          <CreditCard size={18} />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontSize: '0.938rem',
                          }}
                        >
                          {p.mode}
                        </Typography>
                      </Stack>

                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ px: 1 }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Amount
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#1a1a1a',
                              fontWeight: 700,
                              fontSize: '0.813rem',
                            }}
                          >
                            ₹ {parseFloat(p.amount).toFixed(2)}
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ px: 1 }}
                        >
                          <Calendar size={14} style={{ color: '#999' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              fontSize: '0.75rem',
                            }}
                          >
                            {GetCustomDate(p.date) || '—'}
                          </Typography>
                        </Stack>

                        {p.remark && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ px: 1 }}
                          >
                            <FileText size={14} style={{ color: '#999' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#666',
                                fontSize: '0.75rem',
                              }}
                            >
                              {p.remark}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(p)}
                      sx={{ mt: -0.5 }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontStyle: 'italic',
                textAlign: 'center',
                py: 2,
              }}
            >
              No payment records
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Payment Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment record of{' '}
            <strong>₹{paymentToDelete?.amount}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">
            Cancel
          </Button>
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
