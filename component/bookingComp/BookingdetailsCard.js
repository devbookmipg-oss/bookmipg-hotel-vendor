'use client';

import {
  Paper,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  Calendar,
  Phone,
  Mail,
  Users,
  Bed,
  FileText,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { GetCustomDate } from '@/utils/DateFetcher';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Confirmed':
      return {
        icon: <Check size={16} />,
        bgColor: '#d4edda',
        textColor: '#155724',
        label: 'Confirmed',
      };
    case 'Blocked':
      return {
        icon: <AlertCircle size={16} />,
        bgColor: '#fff3cd',
        textColor: '#856404',
        label: 'Blocked',
      };
    case 'Cancelled':
      return {
        icon: <XCircle size={16} />,
        bgColor: '#f8d7da',
        textColor: '#721c24',
        label: 'Cancelled',
      };
    default:
      return {
        icon: null,
        bgColor: '#e2e3e5',
        textColor: '#383d41',
        label: 'Booking',
      };
  }
};

const Section = ({ icon: Icon, title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ color: '#c20f12' }}>
        <Icon size={20} />
      </Box>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#1a1a1a',
        }}
      >
        {title}
      </Typography>
    </Stack>
    <Box sx={{ ml: 4.5 }}>{children}</Box>
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
    <Typography
      variant="body2"
      sx={{ color: '#666', fontWeight: 500, fontSize: '0.813rem' }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: '#1a1a1a', fontWeight: 600, fontSize: '0.813rem' }}
    >
      {value}
    </Typography>
  </Stack>
);

export default function BookingDetailsCard({ booking }) {
  const statusConfig = getStatusConfig(booking?.booking_status);

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1.5,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        mb: 3,
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          p: 2.5,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontWeight: 500,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              Booking ID
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1a1a1a',
                mt: 0.5,
              }}
            >
              {booking?.booking_id}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.textColor,
              px: 2,
              py: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {statusConfig.icon}
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, fontSize: '0.813rem' }}
            >
              {statusConfig.label}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ p: 3 }}>
        {/* Booking Timeline */}
        <Section icon={Calendar} title="Booking Timeline">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#666',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Check In
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '0.938rem',
                  }}
                >
                  {GetCustomDate(booking?.checkin_date)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#666',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Check Out
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '0.938rem',
                  }}
                >
                  {GetCustomDate(booking?.checkout_date)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#666',
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  Booked On
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '0.938rem',
                  }}
                >
                  {GetCustomDate(booking?.createdAt)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Section>
        <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />

        {/* Rooms Information */}
        <Section icon={Bed} title="Rooms Booked">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {booking?.rooms?.map((room, index) => (
              <Chip
                key={index}
                label={room?.room_no}
                sx={{
                  backgroundColor: '#c20f12',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.813rem',
                  borderRadius: 1,
                  height: 28,
                }}
              />
            ))}
          </Stack>
        </Section>
        <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
        {/* Booking Details */}
        <Section icon={FileText} title="Booking Details">
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <InfoRow label="Type" value={booking?.booking_type || 'N/A'} />

            <InfoRow label="Meal Plan" value={booking?.meal_plan || 'N/A'} />
            {booking?.remarks && (
              <InfoRow label="Notes" value={booking?.remarks} />
            )}
          </Box>
        </Section>
        {/* Guest Information */}
        <Section icon={Users} title="Guest Information">
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <InfoRow label="Name" value={booking?.customer?.name} />
            <InfoRow label="Phone" value={booking?.customer?.mobile} />
            <InfoRow label="Email" value={booking?.customer?.email || 'N/A'} />
            <InfoRow
              label="Guests"
              value={`${booking?.adult} Adult${booking?.children > 0 ? `, ${booking?.children} Child` : ''}`}
            />
          </Box>
        </Section>

        <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
      </Box>
    </Paper>
  );
}
