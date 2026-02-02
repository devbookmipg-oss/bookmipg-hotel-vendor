'use client';

import React, { useState } from 'react';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Check, Tag, Grid as GridIcon } from 'lucide-react';
import { CalculateDays } from '@/utils/CalculateDays';

const MotionCard = motion(Card);

const RoomAvailabilityStep = ({
  bookingDetails,
  selectedRooms,
  setSelectedRooms,
  roomTokens,
  setRoomTokens,
  bookingData,
}) => {
  const { auth } = useAuth();
  const totalDays = CalculateDays({
    checkin: bookingDetails.checkin_date,
    checkout: bookingDetails.checkout_date,
  });
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });

  const isRoomAvailable = (room, bookingDetails) => {
    const { checkin_date, checkout_date } = bookingDetails;

    if (!room.room_bookings || room.room_bookings.length === 0) return true;

    return !room.room_bookings.some((booking) => {
      if (booking.documentId === bookingData.documentId) return false;
      if (booking.booking_status === 'Cancelled') return false;

      return (
        (checkin_date >= booking.checkin_date &&
          checkin_date < booking.checkout_date) ||
        (checkout_date > booking.checkin_date &&
          checkout_date <= booking.checkout_date) ||
        (checkin_date <= booking.checkin_date &&
          checkout_date >= booking.checkout_date)
      );
    });
  };

  const filteredRooms = React.useMemo(() => {
    if (!rooms) return [];

    return rooms.filter((room) => {
      const categoryMatch =
        selectedCategory === 'all' ||
        room.category?.documentId === selectedCategory;
      const available = isRoomAvailable(room, bookingDetails);
      return categoryMatch && available;
    });
  }, [rooms, selectedCategory, bookingDetails]);

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleRoomSelection = (room) => {
    const exists = selectedRooms.find((r) => r.documentId === room.documentId);
    if (exists) {
      setSelectedRooms(
        selectedRooms.filter((r) => r.documentId !== room.documentId),
      );
      setRoomTokens(roomTokens.filter((token) => token.room !== room.room_no));
    } else {
      const roomToAdd = rooms.find((r) => r.documentId === room.documentId);
      if (roomToAdd) {
        setSelectedRooms([...selectedRooms, roomToAdd]);
        setRoomTokens([
          ...roomTokens,
          {
            room: room.room_no,
            hsn: room?.category.hsn,
            item: room.category.name,
            days: totalDays,
            rate: room.category.tariff,
            gst: room.category.gst,
            amount: room.category.total * totalDays,
          },
        ]);
      }
    }
  };

  return (
    <Box>
      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#666',
            display: 'block',
            mb: 1,
          }}
        >
          Filter by Category
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handleCategoryFilter('all')}
            startIcon={<GridIcon size={16} />}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: selectedCategory === 'all' ? '#c20f12' : 'inherit',
              borderColor: selectedCategory === 'all' ? '#c20f12' : '#ddd',
            }}
          >
            All Rooms
          </Button>

          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.documentId
                  ? 'contained'
                  : 'outlined'
              }
              size="small"
              onClick={() => handleCategoryFilter(category.documentId)}
              startIcon={<Tag size={16} />}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor:
                  selectedCategory === category.documentId
                    ? '#c20f12'
                    : 'inherit',
                borderColor:
                  selectedCategory === category.documentId ? '#c20f12' : '#ddd',
              }}
            >
              {category.name}
            </Button>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Room Grid */}
      {filteredRooms.length > 0 ? (
        <Grid container spacing={2}>
          <AnimatePresence>
            {filteredRooms?.map((room, index) => {
              const isSelected = selectedRooms.some(
                (r) => r.documentId === room.documentId,
              );

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={room.documentId}>
                  <MotionCard
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRoomSelection(room)}
                    whileHover={{ y: -4 }}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isSelected
                        ? '2px solid #c20f12'
                        : '1px solid #e0e0e0',
                      background: isSelected
                        ? 'linear-gradient(135deg, #fff5f5, #ffe8e8)'
                        : '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(194, 15, 18, 0.12)',
                      },
                    }}
                  >
                    {/* Selection Indicator Badge */}
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: '#c20f12',
                          color: '#fff',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '0 8px 0 8px',
                        }}
                      >
                        <Check size={18} />
                      </Box>
                    )}

                    <CardContent sx={{ pb: 2, pt: 2 }}>
                      {/* Room Number */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Bed size={20} color="#c20f12" />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: '#1a1a1a' }}
                        >
                          Room {room.room_no}
                        </Typography>
                      </Box>

                      {/* Category */}
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ fontWeight: 600, display: 'block', mb: 1 }}
                      >
                        {room.category?.name}
                      </Typography>

                      {/* Floor & Occupancy */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          <strong>Floor:</strong> {room.floor}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          <strong>Capacity:</strong>{' '}
                          {room.occupancy_count || '—'}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Rate */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Per Night
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: '#c20f12' }}
                        >
                          ₹{(room.category?.tariff || 0).toFixed(0)}
                        </Typography>
                      </Box>

                      {/* Total for stay */}
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                      >
                        {totalDays} night{totalDays !== 1 ? 's' : ''} ×
                      </Typography>
                    </CardContent>
                  </MotionCard>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      ) : (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography color="textSecondary" sx={{ mb: 1 }}>
            No rooms available for the selected dates
          </Typography>
        </Box>
      )}

      {/* Selected Rooms Summary */}
      {selectedRooms.length > 0 && (
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}
          >
            Selected Rooms ({selectedRooms.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedRooms.map((room) => (
              <Chip
                key={room?.documentId}
                label={`Room ${room?.room_no} - ${room?.category?.name}`}
                onDelete={() => handleRoomSelection(room)}
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
        </Box>
      )}
    </Box>
  );
};

export default RoomAvailabilityStep;
