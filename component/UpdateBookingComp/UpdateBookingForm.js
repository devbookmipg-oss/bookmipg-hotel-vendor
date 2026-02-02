'use client';
import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Zoom,
  Divider,
} from '@mui/material';

import { CreateNewData, UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useRouter } from 'next/navigation';
import GuestStep from './GuestStep';
import BookingDetailsStep from './BookingDetailsStep';
import RoomAvailabilityStep from './RoomAvailabilityStep';
import FinalPreviewStep from './FinalPreviewStep';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { Check } from 'lucide-react';

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

const UpdateBookingForm = ({
  hotelData,
  paymentMethods,
  bookings,
  bookingData,
}) => {
  const router = useRouter();
  const { auth } = useAuth();
  const today = GetTodaysDate().dateString;
  const todaysdate = new Date(today);
  let tomorrow = new Date(today);
  tomorrow.setDate(todaysdate.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Shared state
  const [selectedGuest, setSelectedGuest] = useState(bookingData?.customer);
  const [bookingDetails, setBookingDetails] = useState({
    booking_type: bookingData?.booking_type || 'FIT',
    booking_status: bookingData?.booking_status || 'Confirmed',
    checkin_date: bookingData?.checkin_date || formatDate(todaysdate),
    checkout_date: bookingData?.checkout_date || formatDate(tomorrow),
    checkin_time: bookingData.checkin_time,
    checkout_time: bookingData.checkout_time,
    booking_referance: bookingData?.booking_referance,
    reference_no: bookingData?.reference_no,
    meal_plan: bookingData?.meal_plan || null,
    remarks: bookingData?.remarks || '',
    adult: bookingData?.adult || 1,
    children: bookingData?.children || 0,
  });

  const [selectedRooms, setSelectedRooms] = useState([...bookingData?.rooms]);
  const cleanedTokens = bookingData.room_tokens.map(({ id, ...rest }) => rest);
  const [roomTokens, setRoomTokens] = useState([...cleanedTokens]);
  const [paymentDetails, setPaymentDetails] = useState({
    date: bookingData?.advance_payment?.date,
    mode: bookingData?.advance_payment?.mode || '',
    amount: bookingData?.advance_payment?.amount || 0,
    remark: bookingData?.advance_payment?.remark || '',
  });
  const [error, setError] = useState('');

  const validateStep = () => {
    setError(''); // clear previous errors
    if (activeStep === 0 && !selectedGuest) {
      setError('Please select or add a guest before continuing.');
      return false;
    }
    if (
      activeStep === 1 &&
      (!bookingDetails.checkin_date || !bookingDetails.checkout_date)
    ) {
      setError('Please provide valid booking dates.');
      return false;
    }
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

      return newStep;
    });
  };

  const handleSubmitBooking = async () => {
    if (!validateStep()) return;
    const rooms = selectedRooms.map((r) => {
      return r.documentId;
    });
    try {
      setLoading(true);

      const payload = {
        customer: selectedGuest.documentId,
        ...bookingDetails,
        rooms: rooms,
        room_tokens: roomTokens,
        advance_payment: paymentDetails,
      };

      const res = await UpdateData({
        auth,
        endPoint: 'room-bookings',
        payload: { data: payload },
        id: bookingData.documentId,
      });
      SuccessToast('Booking Updated Successfully');
      router.push(`/front-office/room-booking/${res.data.data.documentId}`);
    } catch (err) {
      console.log(`Error creating booking: ${err}`);
      setLoading(false);
      ErrorToast('Someting went wrong');
    }
  };
  const totalAmount = roomTokens.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
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
                  setSelectedRooms={setSelectedRooms}
                  setRoomTokens={setRoomTokens}
                />
              )}
              {activeStep === 2 && (
                <RoomAvailabilityStep
                  bookingDetails={bookingDetails}
                  selectedRooms={selectedRooms}
                  setSelectedRooms={setSelectedRooms}
                  roomTokens={roomTokens}
                  setRoomTokens={setRoomTokens}
                  bookingData={bookingData}
                />
              )}
              {activeStep === 3 && (
                <FinalPreviewStep
                  selectedGuest={selectedGuest}
                  bookingDetails={bookingDetails}
                  paymentDetails={paymentDetails}
                  setPaymentDetails={setPaymentDetails}
                  onSubmit={handleSubmitBooking}
                  selectedRooms={selectedRooms}
                  roomTokens={roomTokens}
                  setRoomTokens={setRoomTokens}
                  paymentMethods={paymentMethods}
                />
              )}
            </Box>

            {/* Error Alert */}
            <Zoom in={!!error}>
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Zoom>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 4,
                p: 3,
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#666',
                  borderColor: '#e0e0e0',
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#ccc',
                  },
                  '&.Mui-disabled': {
                    color: '#bdbdbd',
                    borderColor: '#e0e0e0',
                  },
                }}
              >
                ← Back
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 && (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                      borderRadius: 1.5,
                      px: 4,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: '#c20f12',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#a60c0e',
                      },
                    }}
                  >
                    Next →
                  </Button>
                )}

                {activeStep === steps.length - 1 && (
                  <Button
                    onClick={handleSubmitBooking}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      borderRadius: 1.5,
                      px: 4,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: '#27ae60',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#229954',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#bdbdbd',
                        color: '#fff',
                      },
                    }}
                  >
                    {loading ? '⏳ Updating...' : '✅ Update Booking'}
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Side Summary Panel */}
        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Card
            elevation={2}
            sx={{ borderRadius: 2, position: 'sticky', top: 20 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#1a1a1a',
                  fontSize: '1rem',
                }}
              >
                Summary
              </Typography>

              {/* Guest Summary */}
              {selectedGuest && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#999',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Guest
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#1a1a1a',
                    }}
                  >
                    {selectedGuest.full_name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#666',
                      mt: 0.5,
                    }}
                  >
                    {selectedGuest.phone}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Dates Summary */}
              {bookingDetails.checkin_date && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#999',
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Dates
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      fontWeight: 600,
                    }}
                  >
                    {new Date(bookingDetails.checkin_date).toLocaleDateString()}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: '#666',
                    }}
                  >
                    to
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: '#1a1a1a',
                      fontWeight: 600,
                    }}
                  >
                    {new Date(
                      bookingDetails.checkout_date,
                    ).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Rooms Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#999',
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Rooms ({selectedRooms.length})
                </Typography>
                {selectedRooms.length > 0 ? (
                  selectedRooms.map((room, idx) => (
                    <Typography
                      key={idx}
                      sx={{
                        fontSize: '0.8rem',
                        color: '#1a1a1a',
                        fontWeight: 500,
                      }}
                    >
                      {room.room_number}
                    </Typography>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#999',
                      fontStyle: 'italic',
                    }}
                  >
                    No rooms selected
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Amount Summary */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#999',
                    mb: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Amount
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#c20f12',
                  }}
                >
                  ₹{totalAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default UpdateBookingForm;
