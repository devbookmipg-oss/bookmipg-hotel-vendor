'use client';

import { useState } from 'react';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';

import {
  BookingList,
  OverviewStats,
  RoomGridLayout,
} from '@/component/dashboardComp';
import { Loader } from '@/component/common';
import {
  Add,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  MeetingRoom,
  Today,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';

const formatDate = (date) =>
  date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  });

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  const [selectedDate, setSelectedDate] = useState(todaysDate);

  // Fetch all bookings
  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const rooms = GetDataList({
    auth,
    endPoint: 'rooms',
  });

  const handlePrev = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todaysDate);
  };

  // 🔹 Filter Logic
  const stayOver = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    const selectedDateObj = new Date(selectedDate);
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      selectedDateObj > checkIn &&
      selectedDateObj < checkOut
    );
  });

  const expectedCheckin = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const selectedDateObj = new Date(selectedDate);
    return (
      bk.checked_in !== true &&
      bk.checked_out !== true &&
      checkIn.toDateString() === selectedDateObj.toDateString() &&
      bk.booking_status === 'Confirmed'
    );
  });

  const expectedCheckout = bookings?.filter((bk) => {
    const checkOut = new Date(bk.checkout_date);
    const selectedDateObj = new Date(selectedDate);
    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      checkOut.toDateString() === selectedDateObj.toDateString() &&
      bk.booking_status === 'Confirmed'
    );
  });

  if (!bookings || !rooms) {
    return <Loader />;
  }

  return (
    <>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 0,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid #ecf0f1',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#2c3e50',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
              }}
            >
              <MeetingRoom sx={{ color: '#c20f12' }} />
              Booking Overview
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  startIcon={<Today />}
                  onClick={handleToday}
                  variant="outlined"
                  size="small"
                >
                  Today
                </Button>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    backgroundColor: alpha('#2c3e50', 0.05),
                    color: '#2c3e50',
                    '&:hover': {
                      backgroundColor: alpha('#2c3e50', 0.1),
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <TextField
                  size="small"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  sx={{
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <CalendarMonth
                        sx={{ mr: 1, color: '#7f8c8d', fontSize: 20 }}
                      />
                    ),
                  }}
                />

                <IconButton
                  onClick={handleNext}
                  sx={{
                    backgroundColor: alpha('#2c3e50', 0.05),
                    color: '#2c3e50',
                    '&:hover': {
                      backgroundColor: alpha('#2c3e50', 0.1),
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          <Button
            href="/front-office/room-booking/create-new"
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: '#c20f12',
              '&:hover': {
                backgroundColor: '#a00c0f',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            New Booking
          </Button>
        </Stack>
      </Paper>
      <OverviewStats bookings={bookings} rooms={rooms} />
      <RoomGridLayout
        bookings={bookings}
        rooms={rooms}
        selectedDate={selectedDate}
      />
      {/* <BookingList
        expectedCheckin={expectedCheckin}
        expectedCheckout={expectedCheckout}
        stayOver={stayOver}
        selectedDate={selectedDate}
      /> */}
    </>
  );
};

export default Page;
