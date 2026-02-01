'use client';

import { useAuth } from '@/context';
import {
  DeleteData,
  GetDataList,
  CreateNewData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  alpha,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SuccessToast, WarningToast } from '@/utils/GenerateToast';

import { Loader } from '@/component/common';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;

  const data = GetDataList({
    auth,
    endPoint: 'table-bookings',
  });
  const tableList = GetDataList({
    auth,
    endPoint: 'tables',
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData());
  const [editing, setEditing] = useState(false);

  const [filterDate, setFilterDate] = useState(todaysDate);

  function initialFormData() {
    return {
      date: todaysDate,
      guest: '',
      table_no: '',
      time: '',
      hotel_id: auth?.user?.hotel_id || '',
    };
  }

  // filter bookings by date
  const filteredBookings = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.date === filterDate);
  }, [data, filterDate]);

  // Get booked tables for the selected date
  const bookedTables = useMemo(() => {
    return filteredBookings.map((booking) => booking.table_no);
  }, [filteredBookings]);

  // Get available tables
  const availableTables = useMemo(() => {
    if (!tableList) return [];
    return tableList.filter((table) => !bookedTables.includes(table.table_no));
  }, [tableList, bookedTables]);

  // --- handlers ---
  const handleEdit = (row) => {
    setEditing(true);
    setFormData(row);
    setFormOpen(true);
  };

  const handleQuickBook = (tableNo) => {
    setEditing(false);
    setFormData({
      ...initialFormData(),
      table_no: tableNo,
      date: filterDate,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    // duplicate check
    const duplicate = data?.find(
      (item) =>
        item.date === formData.date &&
        item.time === formData.time &&
        item.table_no === formData.table_no &&
        (!editing || item.documentId !== formData.documentId),
    );
    if (duplicate) {
      WarningToast(
        `⚠️ Table ${formData.table_no} is already booked for that slot.`,
      );
      return;
    }

    if (editing) {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        ...updateBody
      } = formData;

      await UpdateData({
        auth,
        endPoint: 'table-bookings',
        id: formData.documentId,
        payload: {
          data: updateBody,
        },
      });
      SuccessToast('✅ Booking updated successfully');
    } else {
      await CreateNewData({
        auth,
        endPoint: 'table-bookings',
        payload: {
          data: formData,
        },
      });
      SuccessToast('🎉 Booking created successfully');
    }
    setFormOpen(false);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'table-bookings',
      id: selectedRow.documentId,
    });
    SuccessToast('🗑️ Booking deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Table Bookings</Typography>
        </Breadcrumbs>
      </Box>

      {!data || !tableList ? (
        <Loader />
      ) : (
        <Box sx={{ p: 3 }}>
          {/* Header Section */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
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
                  <BookOnlineIcon sx={{ color: '#c20f12' }} />
                  Table Bookings
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                  Manage table reservations and availability
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <TodayIcon
                        sx={{ mr: 1, color: '#7f8c8d', fontSize: 20 }}
                      />
                    ),
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #ecf0f1',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: alpha('#e63946', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EventSeatIcon sx={{ color: '#e63946', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ color: '#2c3e50', fontWeight: 700 }}
                    >
                      {tableList.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Total Tables
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #ecf0f1',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: alpha('#009905', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#009905', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ color: '#2c3e50', fontWeight: 700 }}
                    >
                      {availableTables.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Available Today
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #ecf0f1',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: alpha('#c20f12', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOnlineIcon sx={{ color: '#c20f12', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ color: '#2c3e50', fontWeight: 700 }}
                    >
                      {filteredBookings.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Booked Today
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Available Tables Section */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #ecf0f1',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <EventSeatIcon sx={{ color: '#009905' }} />
                Available Tables
              </Typography>
              <Chip
                label={`${availableTables.length} available`}
                size="small"
                sx={{
                  backgroundColor: alpha('#009905', 0.1),
                  color: '#009905',
                  fontWeight: 500,
                }}
              />
            </Stack>

            <Grid container spacing={2}>
              {availableTables.length > 0 ? (
                availableTables.map((table) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                    key={table.documentId}
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease',
                        height: ' 100%',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          borderColor: '#009905',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#2c3e50',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              {table.table_no}
                            </Typography>
                            <Chip
                              label="Available"
                              size="small"
                              sx={{
                                backgroundColor: alpha('#009905', 0.1),
                                color: '#009905',
                                fontSize: '0.75rem',
                                height: 22,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{ color: '#7f8c8d', fontSize: '0.875rem' }}
                          >
                            Ready for booking
                          </Typography>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          onClick={() => handleQuickBook(table.table_no)}
                          sx={{
                            backgroundColor: '#009905',
                            '&:hover': {
                              backgroundColor: '#008005',
                            },
                          }}
                        >
                          Book Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      backgroundColor: alpha('#c20f12', 0.03),
                      borderRadius: 2,
                      border: `1px dashed ${alpha('#c20f12', 0.2)}`,
                    }}
                  >
                    <EventSeatIcon
                      sx={{ fontSize: 48, color: alpha('#c20f12', 0.3), mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ color: '#7f8c8d', mb: 1 }}
                    >
                      No tables available on {GetCustomDate(filterDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bdc3c7' }}>
                      All tables are currently booked
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Bookings Section */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#ffffff',
              border: '1px solid #ecf0f1',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CalendarMonthIcon sx={{ color: '#c20f12' }} />
                Bookings for {GetCustomDate(filterDate)}
              </Typography>
              <Chip
                label={`${filteredBookings.length} bookings`}
                size="small"
                sx={{
                  backgroundColor: alpha('#c20f12', 0.1),
                  color: '#c20f12',
                  fontWeight: 500,
                }}
              />
            </Stack>

            <Grid container spacing={2}>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((row) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={row.documentId}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          borderColor: '#c20f12',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#2c3e50',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <EventSeatIcon
                                sx={{ fontSize: 20, color: '#c20f12' }}
                              />
                              Table {row.table_no}
                            </Typography>
                            <Chip
                              label="Booked"
                              size="small"
                              sx={{
                                backgroundColor: alpha('#c20f12', 0.1),
                                color: '#c20f12',
                                fontSize: '0.75rem',
                                height: 22,
                              }}
                            />
                          </Stack>

                          <Stack spacing={1}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <CalendarMonthIcon
                                sx={{ fontSize: 16, color: '#7f8c8d' }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: '#2c3e50', fontSize: '0.875rem' }}
                              >
                                {GetCustomDate(row.date)}
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 16, color: '#7f8c8d' }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: '#2c3e50', fontSize: '0.875rem' }}
                              >
                                {row.time}
                              </Typography>
                            </Stack>

                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <PersonIcon
                                sx={{ fontSize: 16, color: '#7f8c8d' }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: '#2c3e50', fontSize: '0.875rem' }}
                              >
                                {row.guest || 'Guest'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Tooltip title="Edit booking">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(row)}
                            sx={{
                              backgroundColor: alpha('#3498db', 0.1),
                              color: '#3498db',
                              '&:hover': {
                                backgroundColor: alpha('#3498db', 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete booking">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(row)}
                            sx={{
                              backgroundColor: alpha('#e74c3c', 0.1),
                              color: '#e74c3c',
                              '&:hover': {
                                backgroundColor: alpha('#e74c3c', 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      backgroundColor: alpha('#ecf0f1', 0.5),
                      borderRadius: 2,
                      border: `1px dashed #e0e0e0`,
                    }}
                  >
                    <CalendarMonthIcon
                      sx={{ fontSize: 48, color: alpha('#7f8c8d', 0.3), mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ color: '#7f8c8d', mb: 1 }}
                    >
                      No bookings found for this date
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bdc3c7' }}>
                      Create a new booking using available tables above
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteOpen}
            onClose={handleCancelDelete}
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxWidth: 400,
              },
            }}
          >
            <DialogTitle
              sx={{
                color: '#e74c3c',
                borderBottom: '1px solid #ecf0f1',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              <DeleteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Delete Booking
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <DialogContentText sx={{ color: '#2c3e50', fontSize: '0.95rem' }}>
                Are you sure you want to delete booking for{' '}
                <strong>Table {selectedRow?.table_no}</strong> at{' '}
                <strong>{selectedRow?.time}</strong>?
              </DialogContentText>
            </DialogContent>
            <DialogActions
              sx={{ px: 3, py: 2, borderTop: '1px solid #ecf0f1' }}
            >
              <Button
                onClick={handleCancelDelete}
                variant="outlined"
                sx={{
                  borderColor: '#e0e0e0',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#c20f12',
                    color: '#c20f12',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                sx={{
                  backgroundColor: '#e74c3c',
                  '&:hover': {
                    backgroundColor: '#c0392b',
                  },
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Create/Edit Dialog */}
          <Dialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
              },
            }}
          >
            <DialogTitle
              sx={{
                color: editing ? '#3498db' : '#c20f12',
                borderBottom: '1px solid #ecf0f1',
                fontSize: '1.1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {editing ? (
                <>
                  <EditIcon />
                  Edit Booking
                </>
              ) : (
                <>
                  <AddIcon />
                  New Booking
                </>
              )}
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: '0.875rem' }}>
                      Table Number
                    </InputLabel>
                    <Select
                      label="Table Number"
                      value={formData.table_no || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, table_no: e.target.value })
                      }
                      sx={{ fontSize: '0.875rem' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
                        -- Select Table --
                      </MenuItem>
                      {tableList?.map((table) => (
                        <MenuItem
                          key={table.documentId}
                          value={table.table_no}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          Table {table.table_no}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    placeholder="e.g., 19:30"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Guest Name"
                    value={formData.guest}
                    onChange={(e) =>
                      setFormData({ ...formData, guest: e.target.value })
                    }
                    placeholder="Enter guest name"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{ px: 3, py: 2, borderTop: '1px solid #ecf0f1' }}
            >
              <Button
                onClick={() => setFormOpen(false)}
                variant="outlined"
                sx={{
                  borderColor: '#e0e0e0',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#c20f12',
                    color: '#c20f12',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{
                  backgroundColor: editing ? '#3498db' : '#009905',
                  '&:hover': {
                    backgroundColor: editing ? '#2980b9' : '#008005',
                  },
                }}
              >
                {editing ? 'Update Booking' : 'Create Booking'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default Page;
