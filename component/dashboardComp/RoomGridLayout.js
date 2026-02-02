'use client';

import React, { useMemo } from 'react';
import {
  Typography,
  Grid,
  Box,
  Chip,
  Stack,
  alpha,
  Card,
  CardContent,
  Divider,
} from '@mui/material';

import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import HotelIcon from '@mui/icons-material/Hotel';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KingBedIcon from '@mui/icons-material/KingBed';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';

const RoomGridLayout = ({ bookings, rooms, selectedDate }) => {
  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

  const getStatusData = useMemo(() => {
    const checkedInRooms = [];
    const blockedRooms = [];
    const confirmedRooms = [];
    const occupiedRoomNos = new Set();

    const selectedDateObj = new Date(selectedDate);

    bookings?.forEach((bk) => {
      const checkIn = new Date(bk.checkin_date);
      const checkOut = new Date(bk.checkout_date);

      const sameDayBooking = isSameDay(checkIn, checkOut);
      const isInRange =
        selectedDateObj >= checkIn && selectedDateObj < checkOut;

      if (sameDayBooking && isSameDay(selectedDateObj, checkIn)) {
        bk.rooms?.forEach((room) => {
          const roomInfo = rooms.find((r) => r.room_no === room.room_no);

          if (bk.checked_in === true && bk.checked_out !== true) {
            checkedInRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
              guestName: bk.guest_name || 'Guest',
            });
            occupiedRoomNos.add(room.room_no);
          } else if (bk.checked_in !== true && bk.checked_out !== true) {
            confirmedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
              guestName: bk.guest_name || 'Guest',
            });
            occupiedRoomNos.add(room.room_no);
          }
        });
        return;
      }

      if (isInRange) {
        if (bk.checked_in === true && bk.checked_out !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            checkedInRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
              guestName: bk.guest_name || 'Guest',
            });
            occupiedRoomNos.add(room.room_no);
          });
        }

        if (bk.booking_status === 'Confirmed' && bk.checked_in !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            confirmedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
              guestName: bk.guest_name || 'Guest',
            });
            occupiedRoomNos.add(room.room_no);
          });
        }

        if (bk.booking_status === 'Blocked' && bk.checked_in !== true) {
          bk.rooms?.forEach((room) => {
            const roomInfo = rooms.find((r) => r.room_no === room.room_no);
            blockedRooms.push({
              ...room,
              category: roomInfo?.category?.name || 'Uncategorized',
              bookingId: bk.documentId,
              guestName: bk.guest_name || 'Guest',
            });
            occupiedRoomNos.add(room.room_no);
          });
        }
      }
    });

    const availableRooms = rooms
      ?.filter((room) => !occupiedRoomNos.has(room.room_no))
      .map((room) => ({
        ...room,
        category: room.category?.name || 'Uncategorized',
      }));

    const groupByCategory = (roomArray) => {
      const grouped = {};
      roomArray?.forEach((room) => {
        const cat = room.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({
          room_no: room.room_no,
          bookingId: room.bookingId || null,
          guestName: room.guestName || null,
        });
      });
      return grouped;
    };

    return {
      availableGrouped: groupByCategory(availableRooms),
      checkedInGrouped: groupByCategory(checkedInRooms),
      confirmedGrouped: groupByCategory(confirmedRooms),
      blockedGrouped: groupByCategory(blockedRooms),
      occupiedRoomNos: Array.from(occupiedRoomNos),
    };
  }, [bookings, rooms, selectedDate]);

  const {
    availableGrouped,
    checkedInGrouped,
    confirmedGrouped,
    blockedGrouped,
    occupiedRoomNos,
  } = getStatusData;

  const availableCount = Object.values(availableGrouped).flat().length;
  const checkedInCount = Object.values(checkedInGrouped).flat().length;
  const confirmedCount = Object.values(confirmedGrouped).flat().length;
  const blockedCount = Object.values(blockedGrouped).flat().length;
  const totalRooms = rooms?.length || 0;
  const occupiedCount = occupiedRoomNos.length;

  const statusCards = [
    {
      title: 'Available Rooms',
      count: availableCount,
      icon: <EventAvailableIcon />,
      color: '#009905',
      bgColor: alpha('#009905', 0.08),
      borderColor: alpha('#009905', 0.3),
      data: availableGrouped,
      description: 'Ready for booking',
    },
    {
      title: 'Checked In',
      count: checkedInCount,
      icon: <HotelIcon />,
      color: '#3498db',
      bgColor: alpha('#3498db', 0.08),
      borderColor: alpha('#3498db', 0.3),
      data: checkedInGrouped,
      hasBookingLink: true,
      description: 'Currently occupied',
    },
    {
      title: 'Confirmed',
      count: confirmedCount,
      icon: <CheckCircleIcon />,
      color: '#9e007e',
      bgColor: alpha('#9e007e', 0.08),
      borderColor: alpha('#9e007e', 0.3),
      data: confirmedGrouped,
      hasBookingLink: true,
      description: 'Upcoming bookings',
    },
    {
      title: 'Blocked',
      count: blockedCount,
      icon: <BlockIcon />,
      color: '#f39c12',
      bgColor: alpha('#f39c12', 0.08),
      borderColor: alpha('#f39c12', 0.3),
      data: blockedGrouped,
      hasBookingLink: true,
      description: 'Temporarily unavailable',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Status Cards */}
      <Grid container spacing={3}>
        {statusCards.map((status, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                minHeight: 300,
                borderRadius: 3,
                border: `2px solid ${status.borderColor}`,
                backgroundColor: status.bgColor,
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 28px ${alpha(status.color, 0.15)}`,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        backgroundColor: alpha(status.color, 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${alpha(status.color, 0.3)}`,
                      }}
                    >
                      {React.cloneElement(status.icon, {
                        sx: {
                          color: status.color,
                          fontSize: 24,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        },
                      })}
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#2c3e50',
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {status.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#7f8c8d', fontSize: '0.75rem' }}
                      >
                        {status.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: alpha(status.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${status.color}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: status.color,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                      }}
                    >
                      {status.count}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: status.borderColor }} />

                {Object.keys(status.data).length > 0 ? (
                  <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                    {Object.entries(status.data).map(([category, rooms]) => (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: status.color,
                            fontWeight: 600,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          <KingBedIcon sx={{ fontSize: 14 }} />
                          {category} • {rooms.length}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.75,
                          }}
                        >
                          {rooms.map((room) => (
                            <Chip
                              key={room.room_no}
                              label={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  {status.hasBookingLink && (
                                    <EventIcon sx={{ fontSize: 12 }} />
                                  )}
                                  <span>{room.room_no}</span>
                                  {room.guestName && status.hasBookingLink && (
                                    <PeopleIcon
                                      sx={{ fontSize: 12, opacity: 0.7 }}
                                    />
                                  )}
                                </Box>
                              }
                              size="small"
                              clickable={status.hasBookingLink}
                              component={status.hasBookingLink ? 'a' : 'div'}
                              href={
                                status.hasBookingLink
                                  ? `/front-office/room-booking/${room.bookingId}`
                                  : undefined
                              }
                              sx={{
                                backgroundColor: alpha(status.color, 0.1),
                                color: status.color,
                                border: `1px solid ${alpha(status.color, 0.3)}`,
                                '&:hover': {
                                  backgroundColor: alpha(status.color, 0.2),
                                  transform: 'scale(1.05)',
                                },
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 26,
                                transition: 'all 0.2s ease',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: '#7f8c8d', fontStyle: 'italic' }}
                    >
                      No rooms in this category
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoomGridLayout;
