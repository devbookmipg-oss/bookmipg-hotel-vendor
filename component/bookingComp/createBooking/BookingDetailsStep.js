'use client';
import React, { useEffect } from 'react';
import {
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { Calendar, Users, Home } from 'lucide-react';

// Section Component - OUTSIDE render to prevent recreation
const Section = ({ icon: Icon, title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Icon size={20} color="#c20f12" />
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#666' }}
      >
        {title}
      </Typography>
    </Box>
    <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ pt: 3 }}>{children}</CardContent>
    </Card>
  </Box>
);

export default function BookingDetailsStep({
  bookingDetails,
  setBookingDetails,
  hotelData,
}) {
  const todaysdate = GetTodaysDate().dateString;

  useEffect(() => {
    setBookingDetails({
      ...bookingDetails,
      checkin_time: hotelData.hotel_checkin,
      checkout_time: hotelData.hotel_checkout,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelData]);

  const handleChange = (field, value) => {
    setBookingDetails({ ...bookingDetails, [field]: value });
  };

  return (
    <Box>
      {/* Dates Section */}
      <Section icon={Calendar} title="Check-in & Check-out">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Check-in Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={bookingDetails.checkin_date || ''}
              onChange={(e) => handleChange('checkin_date', e.target.value)}
              inputProps={{ min: todaysdate }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Check-out Date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={bookingDetails.checkout_date || ''}
              onChange={(e) => handleChange('checkout_date', e.target.value)}
              inputProps={{ min: todaysdate }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="time"
              label="Check-in Time"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={bookingDetails.checkin_time || ''}
              onChange={(e) => handleChange('checkin_time', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="time"
              label="Check-out Time"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={bookingDetails.checkout_time || ''}
              onChange={(e) => handleChange('checkout_time', e.target.value)}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Guests Section */}
      <Section icon={Users} title="Guest Details">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Number of Adults"
              size="small"
              value={bookingDetails.adult || ''}
              onChange={(e) => handleChange('adult', e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Number of Children"
              size="small"
              value={bookingDetails.children || ''}
              onChange={(e) => handleChange('children', e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* Booking Details Section */}
      <Section icon={Home} title="Booking Information">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              label="Booking Type"
              size="small"
              value={bookingDetails.booking_type || ''}
              onChange={(e) => handleChange('booking_type', e.target.value)}
            >
              <MenuItem value="FIT">FIT (Individual)</MenuItem>
              <MenuItem value="Group">Group</MenuItem>
              <MenuItem value="Corporate">Corporate</MenuItem>
              <MenuItem value="Corporate Group">Corporate Group</MenuItem>
              <MenuItem value="Social Event">Social Event</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              label="Booking Status"
              size="small"
              value={bookingDetails.booking_status || ''}
              onChange={(e) => handleChange('booking_status', e.target.value)}
            >
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Blocked">Blocked</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              label="Meal Plan"
              size="small"
              value={bookingDetails.meal_plan || ''}
              onChange={(e) => handleChange('meal_plan', e.target.value)}
            >
              <MenuItem value="">Not Selected</MenuItem>
              <MenuItem value="EP">EP - Room Only</MenuItem>
              <MenuItem value="CP">CP - Room + Breakfast</MenuItem>
              <MenuItem value="MAP">MAP - Room + B&apos;fast + Dinner</MenuItem>
              <MenuItem value="AP">AP - All Meals Included</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Special Remarks"
              size="small"
              placeholder="Any special requests?"
              value={bookingDetails.remarks || ''}
              onChange={(e) => handleChange('remarks', e.target.value)}
            />
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
}
