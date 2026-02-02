'use client';
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Divider,
} from '@mui/material';
import { CalculateDays } from '@/utils/CalculateDays';
import { CreditCard, MapPin, User, DollarSign } from 'lucide-react';

// SectionCard Component - OUTSIDE render to prevent recreation and focus loss
const SectionCard = ({ icon: Icon, title, children }) => (
  <Card sx={{ borderRadius: 2, mb: 3, border: '1px solid #e0e0e0' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {Icon && <Icon size={20} color="#c20f12" />}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#666',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const FinalPreviewStep = ({
  selectedGuest,
  bookingDetails,
  selectedRooms,
  roomTokens,
  setRoomTokens,
  paymentDetails,
  setPaymentDetails,
  paymentMethods,
}) => {
  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });

  // ✅ Bidirectional handler
  const handleChange = (index, field, value) => {
    const updated = [...roomTokens];
    const room = { ...updated[index] };
    const numericValue = parseFloat(value) || 0;

    room[field] = numericValue;

    const rate = parseFloat(room.rate) || 0;
    const gst = parseFloat(room.gst) || 0;
    const days = parseFloat(room.days) || totalDays;
    const amount = parseFloat(room.amount) || 0;

    if (field === 'rate' || field === 'gst') {
      // Forward calc
      const newAmount = (rate + (rate * gst) / 100) * days;
      room.amount = parseFloat(newAmount.toFixed(2));
    } else if (field === 'amount') {
      // Reverse calc
      const base = amount / days;
      const newRate = base / (1 + gst / 100);
      room.rate = parseFloat(newRate.toFixed(2));
    }

    // Keep everything to 2 decimals
    room.rate = parseFloat((room.rate || 0).toFixed(2));
    room.amount = parseFloat((room.amount || 0).toFixed(2));

    updated[index] = room;
    setRoomTokens(updated);
  };

  const handleAdvanceChange = (field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalAmount = roomTokens.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <Box>
      {/* Guest Information */}
      {selectedGuest && (
        <SectionCard icon={User} title="Guest Information">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {selectedGuest.name}
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
                >
                  Mobile
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedGuest.mobile || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
                >
                  Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedGuest.email || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
                >
                  Company
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedGuest.company_name || '—'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
      )}

      {/* Booking Details */}
      <SectionCard icon={MapPin} title="Booking Details">
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
            >
              Check-in
            </Typography>
            <Chip
              label={bookingDetails.checkin_date}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
            >
              Check-out
            </Typography>
            <Chip
              label={bookingDetails.checkout_date}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
            >
              Duration
            </Typography>
            <Chip
              label={`${totalDays} night${totalDays !== 1 ? 's' : ''}`}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}
            >
              Type
            </Typography>
            <Chip
              label={bookingDetails.booking_type}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Selected Rooms */}
      <SectionCard
        icon={MapPin}
        title={`Selected Rooms (${selectedRooms.length})`}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedRooms.map((room) => (
            <Chip
              key={room.documentId}
              label={`Room ${room.room_no} - ${room.category.name}`}
              color="primary"
              variant="outlined"
              sx={{
                borderColor: '#c20f12',
                color: '#c20f12',
                fontWeight: 600,
              }}
            />
          ))}
        </Box>
      </SectionCard>

      {/* Room Pricing Table */}
      <Card
        sx={{
          borderRadius: 2,
          mb: 3,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Room
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    Type
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: '#1a1a1a' }}
                  >
                    Rate/Night
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: '#1a1a1a' }}
                  >
                    Days
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: '#1a1a1a' }}
                  >
                    GST %
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: '#1a1a1a' }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTokens.map((room, index) => (
                  <TableRow
                    key={room.room}
                    sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{room.room}</TableCell>
                    <TableCell>{room.item}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={room.rate}
                        onChange={(e) =>
                          handleChange(index, 'rate', e.target.value)
                        }
                        size="small"
                        variant="standard"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {room.days}
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={room.gst}
                        onChange={(e) =>
                          handleChange(index, 'gst', e.target.value)
                        }
                        size="small"
                        variant="standard"
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, color: '#c20f12' }}
                    >
                      <TextField
                        type="number"
                        value={room.amount}
                        onChange={(e) =>
                          handleChange(index, 'amount', e.target.value)
                        }
                        size="small"
                        variant="standard"
                        sx={{ width: 100, textAlign: 'right' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell
                    colSpan={5}
                    sx={{ fontWeight: 700, textAlign: 'right' }}
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#c20f12',
                    }}
                  >
                    ₹{totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Advance Payment */}
      <SectionCard icon={CreditCard} title="Advance Payment">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
            >
              Payment Mode
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={paymentDetails.mode}
              onChange={(e) => handleAdvanceChange('mode', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            >
              <MenuItem value="">Select Payment Mode</MenuItem>
              {paymentMethods?.map((method) => (
                <MenuItem key={method.documentId} value={method.name}>
                  {method.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
            >
              Advance Amount (₹)
            </Typography>
            <TextField
              type="number"
              fullWidth
              size="small"
              placeholder="0"
              value={paymentDetails.amount}
              onChange={(e) => handleAdvanceChange('amount', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          </Grid>
          <Grid size={12}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
            >
              Notes / Remarks
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              placeholder="Any special notes about this payment..."
              value={paymentDetails.remark || ''}
              onChange={(e) => handleAdvanceChange('remark', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      {/* Amount Summary */}
      <Card
        sx={{
          borderRadius: 2,
          border: '2px solid #c20f12',
          bgcolor: '#fff5f5',
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 2,
              textTransform: 'uppercase',
              color: '#c20f12',
            }}
          >
            💰 Payment Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Grid>
            {paymentDetails.amount > 0 && (
              <>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Advance Paid
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#4caf50' }}
                  >
                    ₹{parseFloat(paymentDetails.amount || 0).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Balance Due
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#ff9800' }}
                  >
                    ₹
                    {(
                      totalAmount - parseFloat(paymentDetails.amount || 0)
                    ).toFixed(2)}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinalPreviewStep;
