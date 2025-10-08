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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import { GetSingleData, UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { use, useState } from 'react';
import dayjs from 'dayjs';
import { GetCustomDate } from '@/utils/DateFetcher';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';

export default function RoomBookings({ params }) {
  const { auth } = useAuth();
  const { id } = use(params);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const data = GetSingleData({
    endPoint: 'online-bookings',
    auth: auth,
    id: id,
  });

  if (!data) return <Loader />;

  const customer = data?.online_user || {};
  const rooms = data?.room_categories || [];

  const totalPrice = rooms.reduce((acc, room) => {
    const roomTotal = (room?.total || 0) * (data?.nights || 1);
    return acc + roomTotal;
  }, 0);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending approval':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const res = await UpdateData({
        auth,
        endPoint: 'online-bookings',
        payload: {
          data: {
            booking_status: 'Approved',
          },
        },
        id: id,
      });
      setLoading(false);
      setOpenConfirm(false);
      SuccessToast('Booking Accepted');
    } catch (err) {
      console.log(`error confirming booking: ${err}`);
      ErrorToast('Someting went wring');
    }
  };

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      const res = await UpdateData({
        auth,
        endPoint: 'online-bookings',
        payload: {
          data: {
            booking_status: 'Cancelled',
          },
        },
        id: id,
      });
      setLoading(false);
      setOpenCancel(false);
      SuccessToast('Booking Cancelled');
    } catch (err) {
      console.log(`error cancelling booking: ${err}`);
      ErrorToast('Someting went wring');
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
            href="/front-office/online-booking"
          >
            Online Booking
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
          <Box mb={2} textAlign={'end'}>
            {data?.booking_status == 'Pending Approval' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{ mr: 1, textTransform: 'none' }}
                  onClick={() => setOpenConfirm(true)}
                >
                  Accept Booking
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelOutlinedIcon />}
                  sx={{ textTransform: 'none' }}
                  onClick={() => setOpenCancel(true)}
                >
                  Cancel Booking
                </Button>
              </>
            )}

            {/* {data?.booking_status == 'Approved' && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LocalPrintshopOutlinedIcon />}
                sx={{ textTransform: 'none' }}
              >
                Print Booking Slip
              </Button>
            )} */}
          </Box>
          <Grid container spacing={3}>
            {/* Customer Details */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  pb: 7,
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
                      <span style={{ fontWeight: 600 }}>Name:</span>{' '}
                      {customer?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <span style={{ fontWeight: 600 }}>Email:</span>{' '}
                      {customer?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <span style={{ fontWeight: 600 }}>Phone:</span>{' '}
                      {customer?.phone || 'N/A'}
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
                        <span style={{ fontWeight: 600 }}>Booking ID:</span>{' '}
                        BMPGOB{data?.id}
                      </Typography>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Booking Date:</span>{' '}
                        {GetCustomDate(data?.createdAt)}
                      </Typography>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Status:</span>{' '}
                        <Chip
                          label={data?.booking_status || 'Unknown'}
                          color={getStatusColor(data?.booking_status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Check-in:</span>{' '}
                        {GetCustomDate(data?.check_in)}
                      </Typography>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Check-out:</span>{' '}
                        {GetCustomDate(data?.check_out)}
                      </Typography>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Nights:</span>{' '}
                        {data?.nights || '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Adults:</span>{' '}
                        {data?.adults}
                      </Typography>
                      <Typography>
                        <span style={{ fontWeight: 600 }}>Children:</span>{' '}
                        {data?.childs}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: '#43a047', fontWeight: 700 }}
                      >
                        Booking Amount: ₹{totalPrice?.toLocaleString() || 0}
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
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">Accept Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want accept this booking.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={loading}
            onClick={handleConfirmBooking}
            color="success"
            variant="contained"
          >
            Yes
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => setOpenConfirm(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
      {/* cancel booking dialog */}
      <Dialog
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want cancel this booking.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={loading}
            onClick={handleCancelBooking}
            color="success"
            variant="contained"
          >
            Yes
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => setOpenCancel(false)}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
