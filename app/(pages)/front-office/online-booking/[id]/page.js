'use client';
import {
  Typography,
  Container,
  Box,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { GetSingleData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { use } from 'react';
import dayjs from 'dayjs';
import { GetCustomDate } from '@/utils/DateFetcher';

export default function RoomBookings({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);

  const data = GetSingleData({
    endPoint: 'online-bookings',
    auth: auth,
    id: id,
  });

  if (!data) return <Loader />;

  const customer = data?.online_user || {};
  const rooms = data?.room_categories || [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/front-office/room-booking"
          >
            Room Booking
          </Link>
          <Typography color="text.primary">BMPGOB{data?.id}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Content */}

      <Box sx={{ m: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Customer Details */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  backdropFilter: 'blur(10px)',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(230,240,255,0.8))',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700, color: '#1976d2' }}
                  >
                    👤 Customer Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Typography variant="body1">
                      <b>Name:</b> {customer?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <b>Email:</b> {customer?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <b>Phone:</b> {customer?.phone || 'N/A'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Booking Details */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  backdropFilter: 'blur(10px)',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,245,230,0.8))',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700, color: '#ff9800' }}
                  >
                    🧾 Booking Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography>
                        <b>Booking ID:</b> BMPGOB{data?.id}
                      </Typography>
                      <Typography>
                        <b>Booking Date:</b> {GetCustomDate(data?.createdAt)}
                      </Typography>
                      <Typography>
                        <b>Status:</b>{' '}
                        <Chip
                          label={data?.status || 'Unknown'}
                          color={getStatusColor(data?.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography>
                        <b>Check-in:</b> {GetCustomDate(data?.check_in)}
                      </Typography>
                      <Typography>
                        <b>Check-out:</b> {GetCustomDate(data?.check_out)}
                      </Typography>
                      <Typography>
                        <b>Nights:</b> {data?.nights || '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography>
                        <b>Adults:</b> {data?.adults}
                      </Typography>
                      <Typography>
                        <b>Children:</b> {data?.childs}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: '#43a047', fontWeight: 700 }}
                      >
                        💰 ₹{data?.price?.toLocaleString() || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Rooms List */}
            <Grid size={{ xs: 12 }}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  backdropFilter: 'blur(10px)',
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,255,250,0.8))',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700, color: '#009688' }}
                  >
                    🏨 Booked Rooms
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    {rooms.length > 0 ? (
                      rooms.map((room, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card
                              elevation={2}
                              sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <CardContent>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                  sx={{ color: '#00796b' }}
                                >
                                  {room?.name || 'Room'}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ₹{room?.total || 0} / night
                                </Typography>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))
                    ) : (
                      <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                        No rooms found.
                      </Typography>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Box>
    </>
  );
}
