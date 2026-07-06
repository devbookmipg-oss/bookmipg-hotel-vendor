'use client';
import React, { useCallback, useEffect, useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { CalculateDays } from '@/utils/CalculateDays';
import { CreditCard, MapPin, User, DollarSign } from 'lucide-react';

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
  const [useBulkPrice, setUseBulkPrice] = useState(false);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkGst, setBulkGst] = useState('');

  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });

  const applyBulkChanges = useCallback(
    (priceValue, gstValue) => {
      const numericPrice = parseFloat(priceValue) || 0;
      const numericGst = parseFloat(gstValue) || 0;
      const hasPrice = priceValue !== '' && numericPrice >= 0;
      const hasGst = gstValue !== '' && numericGst >= 0;

      if (useBulkPrice && (hasPrice || hasGst)) {
        const updated = roomTokens.map((room) => {
          const currentRate = parseFloat(room.rate) || 0;
          const currentGst = parseFloat(room.gst) || 0;

          const rate = hasPrice ? numericPrice : currentRate;
          const gst = hasGst ? numericGst : currentGst;
          const days = parseFloat(room.days) || totalDays;
          const newAmount = (rate + (rate * gst) / 100) * days;

          return {
            ...room,
            rate: parseFloat(rate.toFixed(2)),
            gst: parseFloat(gst.toFixed(2)),
            amount: parseFloat(newAmount.toFixed(2)),
          };
        });

        setRoomTokens(updated);
      }
    },
    [roomTokens, setRoomTokens, totalDays, useBulkPrice],
  );

  useEffect(() => {
    if (useBulkPrice) {
      applyBulkChanges(bulkPrice, bulkGst);
    }
  }, [useBulkPrice, bulkPrice, bulkGst, applyBulkChanges]);

  const handleBulkModeChange = (checked) => {
    setUseBulkPrice(checked);
    if (!checked) {
      setBulkPrice('');
      setBulkGst('');
    }
  };

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
      const newAmount = (rate + (rate * gst) / 100) * days;
      room.amount = parseFloat(newAmount.toFixed(2));
    } else if (field === 'amount') {
      const base = amount / days;
      const newRate = base / (1 + gst / 100);
      room.rate = parseFloat(newRate.toFixed(2));
    }

    room.rate = parseFloat((room.rate || 0).toFixed(2));
    room.amount = parseFloat((room.amount || 0).toFixed(2));

    updated[index] = room;
    setRoomTokens(updated);
  };

  const handleBulkPriceChange = (value) => {
    setBulkPrice(value);
    applyBulkChanges(value, bulkGst);
  };

  const handleBulkGstChange = (value) => {
    setBulkGst(value);
    applyBulkChanges(bulkPrice, value);
  };

  const handleAdvanceChange = (field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalAmount = (roomTokens || []).reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );

  return (
    <Box>
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

      {selectedRooms.length > 0 && (
        <SectionCard icon={DollarSign} title="Selected Rooms">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedRooms.map((room) => (
              <Chip
                key={room.key || `${room.room_no}-${room.date}`}
                label={`Room ${room.room_no} • ${room.date}`}
                color="info"
                size="small"
              />
            ))}
          </Box>
        </SectionCard>
      )}

      {roomTokens.length > 0 && (
        <Card sx={{ borderRadius: 2, mb: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useBulkPrice}
                    onChange={(e) => handleBulkModeChange(e.target.checked)}
                    sx={{
                      color: '#c20f12',
                      '&.Mui-checked': { color: '#c20f12' },
                    }}
                  />
                }
                label="Set bulk price and GST"
                sx={{
                  '.MuiFormControlLabel-label': {
                    fontWeight: 600,
                    color: '#424242',
                  },
                }}
              />
            </Box>
            {useBulkPrice && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  label="Enter price for all rooms"
                  placeholder="0.00"
                  value={bulkPrice}
                  onChange={(e) => handleBulkPriceChange(e.target.value)}
                  size="small"
                  sx={{ width: 250 }}
                  inputProps={{ step: '0.01', min: '0' }}
                />
                <TextField
                  type="number"
                  label="Enter GST % for all rooms"
                  placeholder="0.00"
                  value={bulkGst}
                  onChange={(e) => handleBulkGstChange(e.target.value)}
                  size="small"
                  sx={{ width: 250 }}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

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
                    key={room.room || `${room.item}-${index}`}
                    sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{room.room}</TableCell>
                    <TableCell>
                      {room.item ||
                        room.room_type ||
                        room.category?.name ||
                        'Room'}
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={room.rate ?? ''}
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
                        value={room.gst ?? ''}
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
                        value={room.amount ?? ''}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
        </Grid>
      </SectionCard>

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
            {parseFloat(paymentDetails.amount || 0) > 0 && (
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
