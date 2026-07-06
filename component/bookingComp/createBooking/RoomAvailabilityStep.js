'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GetDataList } from '@/utils/ApiFunctions';
import {
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Collapse,
  IconButton,
} from '@mui/material';
import { useAuth } from '@/context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  Grid as GridIcon,
} from 'lucide-react';
import dayjs from 'dayjs';

const buttonAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.1 },
  },
};

const rowAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const RoomAvailabilityStep = ({
  bookingDetails,
  selectedRooms,
  setSelectedRooms,
  roomTokens,
  setRoomTokens,
  bookingData,
}) => {
  const { auth } = useAuth();
  const categories = GetDataList({ auth, endPoint: 'room-categories' });
  const rooms = GetDataList({ auth, endPoint: 'rooms' });
  const bookings = GetDataList({ auth, endPoint: 'room-bookings' });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedDates, setExpandedDates] = useState(() => new Set());

  const dateRange = useMemo(() => {
    const dates = [];
    const start = dayjs(bookingDetails?.checkin_date);
    const checkout = dayjs(bookingDetails?.checkout_date);

    if (!start.isValid() || !checkout.isValid() || checkout.isBefore(start)) {
      return dates;
    }

    let current = start;

    while (current.isBefore(checkout, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return dates;
  }, [bookingDetails?.checkin_date, bookingDetails?.checkout_date]);

  useEffect(() => {
    setExpandedDates(new Set());
  }, [dateRange]);

  const getSavedRoomDetailsForDate = useCallback(
    (roomNo, date) => {
      const targetDate = dayjs(date);
      return roomTokens.find((token) => {
        if (token.room !== roomNo) return false;

        const inDate = dayjs(token.in_date);
        const outDate = dayjs(token.out_date);

        return (
          targetDate.isSame(inDate, 'day') ||
          (targetDate.isAfter(inDate, 'day') &&
            targetDate.isBefore(outDate, 'day'))
        );
      });
    },
    [roomTokens],
  );

  useEffect(() => {
    if (
      bookingData?.documentId &&
      roomTokens?.length > 0 &&
      selectedRooms?.length === 0 &&
      rooms?.length
    ) {
      const selections = [];

      roomTokens.forEach((token) => {
        const room = rooms.find((r) => r.room_no === token.room);

        if (!room) return;

        let current = dayjs(token.in_date);
        const checkout = dayjs(token.out_date);

        while (current.isBefore(checkout, 'day')) {
          const dateString = current.format('YYYY-MM-DD');
          const savedToken = getSavedRoomDetailsForDate(token.room, dateString);

          selections.push({
            key: `${token.room}-${dateString}`,
            ...room,
            date: dateString,
            rate: savedToken?.rate ?? savedToken?.price ?? undefined,
            gst: savedToken?.gst,
            item: savedToken?.item,
            hsn: savedToken?.hsn,
            invoice: savedToken?.invoice,
          });

          current = current.add(1, 'day');
        }
      });

      setSelectedRooms(selections);
    }
  }, [
    bookingData?.documentId,
    roomTokens,
    rooms,
    selectedRooms?.length,
    setSelectedRooms,
    getSavedRoomDetailsForDate,
  ]);

  const toggleDateExpansion = (date) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const roomsByCategory = useMemo(() => {
    if (!rooms || !categories) return {};

    const grouped = {};

    categories.forEach((cat) => {
      grouped[cat.documentId] = {
        name: cat.name,
        rooms: rooms.filter((r) => r.category?.documentId === cat.documentId),
      };
    });

    return grouped;
  }, [rooms, categories]);

  const filteredRoomsByCategory = useMemo(() => {
    if (!roomsByCategory) return {};

    if (selectedCategory === 'all') return roomsByCategory;

    return {
      [selectedCategory]: roomsByCategory[selectedCategory],
    };
  }, [roomsByCategory, selectedCategory]);

  const getOccupiedRoomNosForDate = useCallback(
    (date) => {
      const occupiedRoomNos = new Set();
      const selectedDate = dayjs(date);

      bookings?.forEach((booking) => {
        if (
          booking.documentId === bookingData?.documentId ||
          booking.checked_out ||
          booking.booking_status === 'Cancelled'
        ) {
          return;
        }

        booking.room_tokens?.forEach((token) => {
          const inDate = dayjs(token.in_date);
          const outDate = dayjs(token.out_date);

          const occupiedOnDate =
            selectedDate.isSame(inDate, 'day') ||
            (selectedDate.isAfter(inDate, 'day') &&
              selectedDate.isBefore(outDate, 'day'));

          if (!occupiedOnDate) return;

          const shouldBlock =
            booking.booking_status === 'Blocked' ||
            (booking.booking_status === 'Confirmed' &&
              booking.checked_out !== true);

          if (shouldBlock) {
            occupiedRoomNos.add(token.room);
          }
        });
      });

      return occupiedRoomNos;
    },
    [bookings, bookingData?.documentId],
  );

  const isRoomAvailableForDate = useCallback(
    (room, date) => {
      const occupied = getOccupiedRoomNosForDate(date);
      return !occupied.has(room.room_no);
    },
    [getOccupiedRoomNosForDate],
  );

  const getRoomDateKey = (roomNo, date) => `${roomNo}-${date}`;

  const normalizeRoomSelection = useCallback(
    (selection = {}) => {
      const latestRoom =
        rooms?.find(
          (room) =>
            room.documentId === selection.documentId ||
            room.room_no === selection.room_no,
        ) || selection;

      return {
        ...latestRoom,
        ...selection,
        category: {
          ...(latestRoom.category || {}),
          ...(selection.category || {}),
        },
      };
    },
    [rooms],
  );

  const getRoomTokenDetails = useCallback(
    (room = {}) => {
      const normalizedRoom = normalizeRoomSelection(room);
      const category = normalizedRoom.category || {};

      return {
        item:
          category.name ||
          normalizedRoom.item ||
          normalizedRoom.room_type ||
          'Room',
        hsn: category.hsn || normalizedRoom.hsn || '',
        rate: Number(category.tariff ?? normalizedRoom.rate ?? 0),
        gst: Number(category.gst ?? normalizedRoom.gst ?? 0),
      };
    },
    [normalizeRoomSelection],
  );

  const buildRoomTokens = useCallback(
    (selections) => {
      const groupedByRoom = selections.reduce((acc, selection) => {
        const normalizedSelection = normalizeRoomSelection(selection);
        const roomKey = normalizedSelection.room_no;

        if (!acc[roomKey]) {
          acc[roomKey] = {
            room: normalizedSelection,
            dates: [],
          };
        }

        acc[roomKey].dates.push(normalizedSelection.date);
        return acc;
      }, {});

      const tokens = [];

      Object.values(groupedByRoom).forEach(({ room, dates }) => {
        const normalizedDates = [
          ...new Set(
            dates
              .map((value) => {
                if (!value) return null;
                const parsedDate = dayjs(value);
                return parsedDate.isValid()
                  ? parsedDate.format('YYYY-MM-DD')
                  : null;
              })
              .filter(Boolean),
          ),
        ].sort();

        if (!normalizedDates.length) return;

        const { item, hsn, rate, gst } = getRoomTokenDetails(room);

        let currentBlock = [normalizedDates[0]];

        const pushToken = (blockDates) => {
          if (!blockDates?.length) return;

          const in_date = blockDates[0];
          const lastDate = dayjs(blockDates[blockDates.length - 1]);
          const out_date = lastDate.add(1, 'day').format('YYYY-MM-DD');
          const days = blockDates.length;

          tokens.push({
            id: `${room.room_no}-${in_date}-${out_date}`,
            room: room.room_no,
            hsn,
            item,
            rate,
            gst,
            amount: (rate + (rate * gst) / 100) * days,
            days,
            invoice: false,
            in_date,
            out_date,
          });
        };

        for (let i = 1; i < normalizedDates.length; i++) {
          const prev = dayjs(normalizedDates[i - 1]);
          const curr = dayjs(normalizedDates[i]);
          const diffDays = curr.diff(prev, 'day');

          if (diffDays === 1) {
            currentBlock.push(normalizedDates[i]);
          } else {
            pushToken(currentBlock);
            currentBlock = [normalizedDates[i]];
          }
        }

        pushToken(currentBlock);
      });

      return tokens;
    },
    [normalizeRoomSelection, getRoomTokenDetails],
  );

  useEffect(() => {
    if (!selectedRooms || selectedRooms.length === 0) {
      setRoomTokens([]);
      return;
    }

    setRoomTokens(buildRoomTokens(selectedRooms));
  }, [selectedRooms, setRoomTokens, buildRoomTokens]);

  const getAvailableRoomsForDate = (date) => {
    return Object.values(filteredRoomsByCategory).flatMap((catData) =>
      (catData.rooms || []).filter((room) =>
        isRoomAvailableForDate(room, date),
      ),
    );
  };

  const isRoomSelectedForDate = (roomNo, date) => {
    return selectedRooms.some((r) => r.room_no === roomNo && r.date === date);
  };

  const isDateFullySelected = (date) => {
    const availableRooms = getAvailableRoomsForDate(date);
    return (
      availableRooms.length > 0 &&
      availableRooms.every((room) => isRoomSelectedForDate(room.room_no, date))
    );
  };

  const isAllSelected = () => {
    return dateRange.every((date) => {
      const availableRooms = getAvailableRoomsForDate(date);
      return (
        availableRooms.length === 0 ||
        availableRooms.every((room) =>
          isRoomSelectedForDate(room.room_no, date),
        )
      );
    });
  };

  const handleToggleDateSelection = (date) => {
    const availableRooms = getAvailableRoomsForDate(date);
    const currentlySelected = isDateFullySelected(date);

    let updatedSelectedRooms = selectedRooms;

    if (currentlySelected) {
      updatedSelectedRooms = selectedRooms.filter((r) => r.date !== date);
    } else {
      const newSelections = availableRooms.reduce((acc, room) => {
        const exists = selectedRooms.some(
          (r) => r.room_no === room.room_no && r.date === date,
        );
        if (!exists) {
          acc.push({
            key: getRoomDateKey(room.room_no, date),
            ...room,
            date,
          });
        }
        return acc;
      }, []);
      updatedSelectedRooms = [...selectedRooms, ...newSelections];
    }

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  const handleToggleAllRooms = () => {
    const currentlyAllSelected = isAllSelected();

    if (currentlyAllSelected) {
      setSelectedRooms([]);
      setRoomTokens([]);
      return;
    }

    const allSelections = dateRange.flatMap((date) =>
      getAvailableRoomsForDate(date).map((room) => ({
        key: getRoomDateKey(room.room_no, date),
        ...room,
        date,
      })),
    );

    setSelectedRooms(allSelections);
    setRoomTokens(buildRoomTokens(allSelections));
  };

  const handleRoomDateSelection = (room, date) => {
    const exists = selectedRooms.some(
      (r) => r.room_no === room.room_no && r.date === date,
    );

    let updatedSelectedRooms;

    if (exists) {
      updatedSelectedRooms = selectedRooms.filter(
        (r) => !(r.room_no === room.room_no && r.date === date),
      );
    } else {
      updatedSelectedRooms = [
        ...selectedRooms,
        {
          key: getRoomDateKey(room.room_no, date),
          ...room,
          date,
        },
      ];
    }

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  const removeSelection = (key) => {
    const updatedSelectedRooms = selectedRooms.filter((r) => r.key !== key);

    setSelectedRooms(updatedSelectedRooms);
    setRoomTokens(buildRoomTokens(updatedSelectedRooms));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2.5 }}>
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
            onClick={() => setSelectedCategory('all')}
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
              key={category.documentId}
              variant={
                selectedCategory === category.documentId
                  ? 'contained'
                  : 'outlined'
              }
              size="small"
              onClick={() => setSelectedCategory(category.documentId)}
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

      <Box
        sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllSelected()}
              onChange={handleToggleAllRooms}
              color="primary"
            />
          }
          label="Select all rooms"
          sx={{
            '.MuiFormControlLabel-label': {
              fontWeight: 600,
              color: '#424242',
            },
          }}
        />
      </Box>

      <AnimatePresence mode="popLayout">
        {dateRange.map((date, dateIndex) => {
          const formattedDate = dayjs(date).format('ddd, MMM DD');

          return (
            <motion.div
              key={date}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={rowAnimation}
              transition={{ delay: dateIndex * 0.08 }}
            >
              <Card
                sx={{
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#f8f8f8',
                    color: '#1a1a1a',
                    p: { xs: 1.25, sm: 1.5 },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.8, sm: 1.25 },
                    flexWrap: 'wrap',
                    borderBottom: '1px solid #ececec',
                  }}
                >
                  <Calendar size={16} color="#c20f12" />
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {formattedDate}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDateFullySelected(date)}
                        onChange={() => handleToggleDateSelection(date)}
                        sx={{
                          color: '#c20f12',
                          '&.Mui-checked': {
                            color: '#c20f12',
                          },
                        }}
                      />
                    }
                    label="All"
                    sx={{
                      color: '#424242',
                      '.MuiFormControlLabel-label': {
                        color: '#424242',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => toggleDateExpansion(date)}
                    sx={{ ml: 'auto', color: '#c20f12', p: 0.5 }}
                    aria-label={
                      expandedDates.has(date)
                        ? 'Collapse room list'
                        : 'Expand room list'
                    }
                    size="small"
                  >
                    {expandedDates.has(date) ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={expandedDates.has(date)}>
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 } }}>
                    {Object.entries(filteredRoomsByCategory).map(
                      ([catId, catData]) => {
                        const availableRoomsForDate = (
                          catData.rooms || []
                        ).filter((room) => isRoomAvailableForDate(room, date));

                        if (availableRoomsForDate.length === 0) return null;

                        return (
                          <Box key={catId} mb={{ xs: 1.5, sm: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                mb: 0.75,
                                pb: 0.5,
                                borderBottom: '1px solid #e0e0e0',
                              }}
                            >
                              <Typography
                                variant="caption"
                                fontWeight="600"
                                sx={{
                                  color: '#424242',
                                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                }}
                              >
                                {catData.name}
                              </Typography>
                            </Box>

                            <Box
                              display="flex"
                              flexWrap="wrap"
                              gap={{ xs: 0.5, sm: 0.75 }}
                            >
                              <AnimatePresence mode="popLayout">
                                {availableRoomsForDate.map((room) => {
                                  const isSelected = isRoomSelectedForDate(
                                    room.room_no,
                                    date,
                                  );

                                  return (
                                    <motion.div
                                      key={`${room.documentId}-${date}`}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      whileHover="hover"
                                      variants={buttonAnimation}
                                    >
                                      <Button
                                        onClick={() =>
                                          handleRoomDateSelection(room, date)
                                        }
                                        variant={
                                          isSelected ? 'contained' : 'outlined'
                                        }
                                        color={
                                          isSelected ? 'primary' : 'inherit'
                                        }
                                        sx={{
                                          px: { xs: 0.8, sm: 1.2 },
                                          py: { xs: 0.4, sm: 0.6 },
                                          minWidth: { xs: '36px', sm: '48px' },
                                          fontWeight: 'bold',
                                          fontSize: {
                                            xs: '0.7rem',
                                            sm: '0.85rem',
                                          },
                                          textTransform: 'uppercase',
                                          borderRadius: 0.8,
                                          border: isSelected
                                            ? '2px solid #c20f12'
                                            : '1px solid #bdbdbd',
                                          transition: 'all 0.2s ease-in-out',
                                          bgcolor: isSelected
                                            ? '#c20f12'
                                            : 'transparent',
                                          color: isSelected
                                            ? 'white'
                                            : '#424242',
                                          '&:hover': {
                                            bgcolor: isSelected
                                              ? '#b10f12'
                                              : '#f5f5f5',
                                            boxShadow: 1,
                                          },
                                        }}
                                      >
                                        {room.room_no}
                                      </Button>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </Box>
                          </Box>
                        );
                      },
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};

export default RoomAvailabilityStep;
