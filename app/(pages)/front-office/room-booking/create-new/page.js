'use client';
import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  Zoom,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Container,
} from '@mui/material';
import {
  GuestStep,
  RoomAvailabilityStep,
  BookingDetailsStep,
  FinalPreviewStep,
} from '@/component/bookingComp/createBooking';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { GetTodaysDate } from '@/utils/DateFetcher';
import {
  CreateNewData,
  GetDataList,
  GetSingleData,
} from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';

const steps = [
  { label: 'Guest', icon: '👤' },
  { label: 'Booking Details', icon: '📅' },
  { label: 'Room Availability', icon: '🛏️' },
  { label: 'Review & Confirm', icon: '✓' },
];

const generateNextBookingId = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return 'SOLV-1';
  }

  // Extract all numbers from booking_id like "INV-12" -> 12
  const numbers = bookings
    .map((inv) => parseInt(inv.booking_id?.replace('SOLV-', ''), 10))
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers);

  return `SOLV-${maxNumber + 1}`;
};

export default function BookingForm() {
  const router = useRouter();
  const { auth } = useAuth();
  const today = GetTodaysDate().dateString;
  const todaysdate = new Date(today);
  let tomorrow = new Date(today);
  tomorrow.setDate(todaysdate.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const hotelData = GetSingleData({
    endPoint: 'hotels',
    auth: auth,
    id: auth?.user?.hotel_id,
  });

  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Shared state
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    booking_type: 'FIT',
    booking_status: 'Confirmed',
    checkin_date: formatDate(todaysdate),
    checkout_date: formatDate(tomorrow),
  });

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomTokens, setRoomTokens] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({
    date: formatDate(todaysdate),
    mode: '',
    amount: 0,
    remark: '',
  });
  const [error, setError] = useState('');

  const validateStep = () => {
    setError(''); // clear previous errors

    // STEP 0 → Guest selection
    if (activeStep === 0 && !selectedGuest) {
      setError('Please select or add a guest before continuing.');
      return false;
    }

    // STEP 1 → Booking details
    if (activeStep === 1) {
      const { checkin_date, checkout_date } = bookingDetails;

      if (!checkin_date || !checkout_date) {
        setError('Please provide valid booking dates.');
        return false;
      }

      // ❌ Validation: Check-in must not be after Check-out
      if (checkin_date > checkout_date) {
        setError('Check-in date cannot be later than the check-out date.');
        return false;
      }
    }

    // STEP 2 → Rooms selection
    if (activeStep === 2 && selectedRooms.length === 0) {
      setError('Please select a room.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => {
      const newStep = prev - 1;

      // If going back from step 2 to 1
      if (prev === 2 && newStep === 1) {
        setSelectedRooms([]);
        setRoomTokens([]);
      }

      return newStep;
    });
  };
  const totalAmount = roomTokens.reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleSubmitBooking = async () => {
    if (!validateStep()) return;
    const rooms = selectedRooms.map((r) => {
      return r.documentId;
    });

    if (paymentDetails.amount > totalAmount) {
      setError('Advance payment cannot be more than total amount.');
      return;
    }
    try {
      setLoading(true);
      const newBookingId = generateNextBookingId(bookings);
      const payload = {
        booking_id: newBookingId,
        customer: selectedGuest.documentId,
        ...bookingDetails,
        rooms: rooms,
        room_tokens: roomTokens,
        advance_payment: paymentDetails,
        hotel_id: auth?.user?.hotel_id || '',
      };

      const res = await CreateNewData({
        auth,
        endPoint: 'room-bookings',
        payload: { data: payload },
      });
      SuccessToast('Booking Create Successfully');
      router.push(`/front-office/room-booking/${res.data.data.documentId}`);
    } catch (err) {
      console.log(`Error creating booking: ${err}`);
      setLoading(false);
      ErrorToast('Someting went wrong');
    }
  };

  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 2,
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">New Booking</Typography>
        </Breadcrumbs>
      </Box>

      {!hotelData || !paymentMethods || !bookings ? (
        <Loader />
      ) : (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
              gap: 3,
            }}
          >
            {/* Main Content */}
            <Box>
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Tab Navigation */}
                <Box
                  sx={{
                    borderBottom: '2px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Tabs
                    value={activeStep}
                    onChange={(e, newValue) => {
                      if (newValue < activeStep || validateStep()) {
                        setActiveStep(newValue);
                      }
                    }}
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        py: 2,
                        color: '#666',
                        transition: 'all 0.3s',
                      },
                      '& .MuiTab-root.Mui-selected': {
                        color: '#c20f12',
                        fontWeight: 700,
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#c20f12',
                        height: 3,
                      },
                    }}
                  >
                    {steps.map((step, idx) => (
                      <Tab
                        key={idx}
                        label={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <span>{step.icon}</span>
                            <span>{step.label}</span>
                            {idx < activeStep && (
                              <Check size={16} color="#4caf50" />
                            )}
                          </Box>
                        }
                        disabled={idx > activeStep}
                      />
                    ))}
                  </Tabs>
                </Box>

                {/* Step Content */}
                <Box sx={{ p: 4, minHeight: 400 }}>
                  {activeStep === 0 && (
                    <GuestStep
                      selectedGuest={selectedGuest}
                      setSelectedGuest={setSelectedGuest}
                    />
                  )}
                  {activeStep === 1 && (
                    <BookingDetailsStep
                      bookingDetails={bookingDetails}
                      setBookingDetails={setBookingDetails}
                      hotelData={hotelData}
                    />
                  )}
                  {activeStep === 2 && (
                    <RoomAvailabilityStep
                      bookingDetails={bookingDetails}
                      selectedRooms={selectedRooms}
                      setSelectedRooms={setSelectedRooms}
                      roomTokens={roomTokens}
                      setRoomTokens={setRoomTokens}
                    />
                  )}
                  {activeStep === 3 && (
                    <FinalPreviewStep
                      selectedGuest={selectedGuest}
                      bookingDetails={bookingDetails}
                      paymentDetails={paymentDetails}
                      setPaymentDetails={setPaymentDetails}
                      selectedRooms={selectedRooms}
                      roomTokens={roomTokens}
                      setRoomTokens={setRoomTokens}
                      paymentMethods={paymentMethods}
                    />
                  )}
                </Box>

                {/* Error Alert */}
                <Zoom in={!!error}>
                  <Alert
                    severity="error"
                    icon={<AlertCircle size={20} />}
                    sx={{ m: 2, borderRadius: 1 }}
                  >
                    {error}
                  </Alert>
                </Zoom>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 3,
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{
                      borderRadius: 1.5,
                      px: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    ← Back
                  </Button>

                  {activeStep < steps.length - 1 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{
                        borderRadius: 1.5,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
                      }}
                    >
                      Next →
                    </Button>
                  )}

                  {activeStep === steps.length - 1 && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSubmitBooking}
                      disabled={loading}
                      sx={{
                        borderRadius: 1.5,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#388e3c' },
                      }}
                    >
                      {loading ? '⏳ Creating...' : '✅ Confirm Booking'}
                    </Button>
                  )}
                </Box>
              </Paper>
            </Box>

            {/* Right Side Summary Panel */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Guest Summary */}
              {selectedGuest && (
                <Card sx={{ borderRadius: 2, border: '2px solid #e0e0e0' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      👤 Guest
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {selectedGuest.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      📞 {selectedGuest.mobile}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Booking Summary */}
              {bookingDetails.checkin_date && (
                <Card sx={{ borderRadius: 2, border: '2px solid #e0e0e0' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      📅 Dates
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption">
                        <strong>Check-in:</strong> {bookingDetails.checkin_date}
                      </Typography>
                      <Typography variant="caption">
                        <strong>Check-out:</strong>{' '}
                        {bookingDetails.checkout_date}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Rooms Summary */}
              {selectedRooms.length > 0 && (
                <Card sx={{ borderRadius: 2, border: '2px solid #e0e0e0' }}>
                  <CardContent sx={{ pb: 2 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      🛏️ Rooms ({selectedRooms.length})
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {selectedRooms.map((room) => (
                        <Typography key={room.documentId} variant="caption">
                          {room.room_no} - {room.category?.name}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Amount Summary */}
              {roomTokens.length > 0 && (
                <Card
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #e0e0e0',
                  }}
                >
                  <CardContent sx={{ pb: 2 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      💰 Amount
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption">Subtotal:</Typography>
                      <Typography variant="caption" fontWeight={700}>
                        ₹{totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    {paymentDetails.amount > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption">Advance:</Typography>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="primary"
                        >
                          ₹{parseFloat(paymentDetails.amount).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </Container>
      )}
    </>
  );
}
