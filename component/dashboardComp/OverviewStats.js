'use client';
import React from 'react';
import { GetTodaysDate } from '@/utils/DateFetcher';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  alpha,
} from '@mui/material';
import {
  DoorOpen,
  DoorClosed,
  LogIn,
  LogOut,
  CheckCircle,
  Ban,
  Users,
  Calendar,
  TrendingUp,
  Bed,
  Hotel,
} from 'lucide-react';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const OverviewStats = ({ bookings, rooms }) => {
  const todaysDate = GetTodaysDate().dateString;

  const GetStats = () => {
    const today = new Date(todaysDate);

    let checkedIn = 0;
    let confirmed = 0;
    let blocked = 0;
    let expectedCheckins = 0;
    let expectedCheckouts = 0;
    let totalGuests = 0;

    const occupiedNos = new Set();

    const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      const roomCount = bk.rooms?.length || 0;
      const guestCount = parseInt(bk.no_of_guests) || 0;
      const sameDayBooking = isSameDay(checkIn, checkOut);
      const activeStay = today >= checkIn && today < checkOut;

      if (activeStay && bk.checked_in === true) {
        totalGuests += guestCount;
      }

      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in !== true &&
        bk.checked_out !== true &&
        isSameDay(checkIn, today)
      ) {
        expectedCheckins += roomCount;
      }

      if (
        bk.booking_status === 'Confirmed' &&
        bk.checked_in === true &&
        bk.checked_out !== true &&
        isSameDay(checkOut, today)
      ) {
        expectedCheckouts += roomCount;
      }

      if (bk.checked_out === true) return;

      if (sameDayBooking && isSameDay(today, checkIn)) {
        if (bk.checked_in === true) {
          checkedIn += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        } else if (bk.booking_status === 'Confirmed') {
          confirmed += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        } else if (bk.booking_status === 'Blocked') {
          blocked += roomCount;
          bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
        }
        return;
      }

      if (!activeStay) return;

      if (bk.checked_in === true) {
        checkedIn += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      } else if (bk.booking_status === 'Confirmed') {
        confirmed += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      } else if (bk.booking_status === 'Blocked') {
        blocked += roomCount;
        bk.rooms?.forEach((r) => occupiedNos.add(r.room_no));
      }
    });

    const available =
      rooms?.filter((r) => !occupiedNos.has(r.room_no)).length || 0;
    const totalRooms = rooms?.length || 0;
    const occupancyRate =
      totalRooms > 0 ? Math.round((checkedIn / totalRooms) * 100) : 0;

    return {
      available,
      checkedIn,
      confirmed,
      blocked,
      expectedCheckins,
      expectedCheckouts,
      totalGuests,
      totalRooms,
      occupancyRate,
    };
  };

  const statsData = GetStats();

  const stats = [
    {
      title: 'Available Rooms',
      count: statsData.available,
      color: '#009905',
      bgColor: alpha('#009905', 0.08),
      icon: <DoorOpen size={24} />,
      subtitle: 'Ready for booking',
    },
    {
      title: 'Occupied Rooms',
      count: statsData.checkedIn,
      color: '#c20f12',
      bgColor: alpha('#c20f12', 0.08),
      icon: <DoorClosed size={24} />,
      subtitle: `${statsData.occupancyRate}% occupancy`,
    },
    {
      title: 'Total Rooms',
      count: statsData.totalRooms,
      color: '#2c3e50',
      bgColor: alpha('#2c3e50', 0.08),
      icon: <Hotel size={24} />,
      subtitle: 'Hotel capacity',
    },
    {
      title: 'Current Guests',
      count: statsData.totalGuests,
      color: '#3498db',
      bgColor: alpha('#3498db', 0.08),
      icon: <Users size={24} />,
      subtitle: 'In-house guests',
    },
    {
      title: 'Expected Check-In',
      count: statsData.expectedCheckins,
      color: '#9e007e',
      bgColor: alpha('#9e007e', 0.08),
      icon: <LogIn size={24} />,
      subtitle: 'Today arrivals',
    },
    {
      title: 'Expected Checkout',
      count: statsData.expectedCheckouts,
      color: '#f39c12',
      bgColor: alpha('#f39c12', 0.08),
      icon: <LogOut size={24} />,
      subtitle: 'Today departures',
    },
    {
      title: 'Confirmed Bookings',
      count: statsData.confirmed,
      color: '#009905',
      bgColor: alpha('#009905', 0.08),
      icon: <CheckCircle size={24} />,
      subtitle: 'Upcoming reservations',
    },
    {
      title: 'Blocked Rooms',
      count: statsData.blocked,
      color: '#7f8c8d',
      bgColor: alpha('#7f8c8d', 0.08),
      icon: <Ban size={24} />,
      subtitle: 'Under maintenance',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {stats.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                scale: 1.02,
                boxShadow: `0 12px 32px ${alpha(item.color, 0.2)}`,
              }}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(item.color, 0.2)}`,
                backgroundColor: '#ffffff',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: item.color,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  {/* Top Row */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        backgroundColor: alpha(item.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${alpha(item.color, 0.3)}`,
                      }}
                    >
                      {React.cloneElement(item.icon, { color: item.color })}
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h3"
                        sx={{
                          color: item.color,
                          fontWeight: 800,
                          lineHeight: 1,
                          fontSize: '2rem',
                        }}
                      >
                        {item.count}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Bottom Row */}
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#2c3e50',
                        fontWeight: 700,
                        fontSize: '1rem',
                        mb: 0.5,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#7f8c8d',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Calendar size={12} />
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewStats;
