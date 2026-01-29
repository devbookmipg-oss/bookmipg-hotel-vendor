'use client';

import { Card, Typography, Stack, Box, Chip, Avatar } from '@mui/material';
import {
  CalendarMonth,
  Bed,
  Phone,
  People,
  Notes,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
  Email,
  SupervisedUserCircle,
} from '@mui/icons-material';
import { GetCustomDate } from '@/utils/DateFetcher';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Confirmed':
      return {
        icon: <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />,
        color: 'success',
        label: 'Confirmed',
        bg: 'rgba(39, 174, 96, 0.1)',
      };
    case 'Blocked':
      return {
        icon: <BlockIcon sx={{ fontSize: '1.2rem' }} />,
        color: 'warning',
        label: 'Blocked',
        bg: 'rgba(243, 156, 18, 0.1)',
      };
    case 'Cancelled':
      return {
        icon: <CancelIcon sx={{ fontSize: '1.2rem' }} />,
        color: 'error',
        label: 'Cancelled',
        bg: 'rgba(231, 76, 60, 0.1)',
      };
    default:
      return {
        icon: null,
        color: 'default',
        label: 'Booking',
        bg: '#f8f9fa',
      };
  }
};

export default function BookingDetailsCard({ booking }) {
  const statusConfig = getStatusConfig(booking?.booking_status);

  const InfoItem = ({ icon, label, value, color = 'primary' }) => (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: 'rgba(194, 15, 18, 0.03)',
        border: '1px solid rgba(194, 15, 18, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(194, 15, 18, 0.06)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          color: color,
          display: 'flex',
          pt: 0.3,
          minWidth: 'fit-content',
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.3} flex={1}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        background: '#fff',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Modern Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #c20f12 0%, #e63946 100%)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '-0.3px',
            }}
          >
            Booking #{booking?.booking_id}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Guest Information & Dates
          </Typography>
        </Stack>
        <Box
          sx={{
            background: statusConfig.bg,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            border: `1px solid`,
            borderColor: statusConfig.color,
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            {statusConfig.icon}
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: statusConfig.color }}
            >
              {statusConfig.label}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Guest Information Section */}
          <Stack spacing={1.5}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                ml: 0.5,
              }}
            >
              👤 Guest Details
            </Typography>
            <Stack spacing={1}>
              <InfoItem
                icon={<SupervisedUserCircle />}
                label="Guest Name"
                value={booking?.guest_name || 'N/A'}
                color="primary"
              />
              <InfoItem
                icon={<Phone />}
                label="Phone"
                value={booking?.phone || 'N/A'}
              />
              <InfoItem
                icon={<Email />}
                label="Email"
                value={booking?.email || 'N/A'}
              />
            </Stack>
          </Stack>

          {/* Booking Dates Section */}
          <Stack spacing={1.5}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                ml: 0.5,
              }}
            >
              📅 Stay Duration
            </Typography>
            <Stack spacing={1}>
              <InfoItem
                icon={<CalendarMonth sx={{ color: '#27ae60' }} />}
                label="Check-In"
                value={GetCustomDate(booking?.checkin_date)}
                color="#27ae60"
              />
              <InfoItem
                icon={<CalendarMonth sx={{ color: '#e74c3c' }} />}
                label="Check-Out"
                value={GetCustomDate(booking?.checkout_date)}
                color="#e74c3c"
              />
              <InfoItem
                icon={<CalendarMonth sx={{ color: '#3498db' }} />}
                label="Booked On"
                value={GetCustomDate(booking?.createdAt)}
                color="#3498db"
              />
            </Stack>
          </Stack>

          {/* Room & Booking Details */}
          <Stack spacing={1.5}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                ml: 0.5,
              }}
            >
              🏨 Booking Details
            </Typography>
            <Stack spacing={1}>
              <InfoItem
                icon={<Bed />}
                label="Room Number"
                value={booking?.room_no || 'N/A'}
              />
              <InfoItem
                icon={<People />}
                label="Guests"
                value={booking?.num_guests || 'N/A'}
              />
              <InfoItem
                icon={<Bed />}
                label="Room Type"
                value={booking?.room_type?.room_type || 'N/A'}
              />
              <InfoItem
                icon={<Notes />}
                label="Booking Type"
                value={booking?.booking_type || 'N/A'}
              />
            </Stack>
          </Stack>

          {/* Special Requests */}
          {booking?.special_request && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: '#fff3cd',
                borderLeft: '4px solid #f39c12',
              }}
            >
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: '#856404',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  ⭐ Special Requests
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#856404', lineHeight: 1.5 }}
                >
                  {booking?.special_request}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Card>
  );
}
