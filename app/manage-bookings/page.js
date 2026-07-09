'use client';

import { useAuth } from '@/context';
import { GetUnfilteredDataList } from '@/utils/ApiFunctions';
import { useState, useMemo, useEffect } from 'react';

// mui
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  IconButton,
  Link,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Loader } from '@/component/common';
import { useRouter } from 'next/navigation';
import { GetCustomDate } from '@/utils/DateFetcher';
import { CheckUserPermission } from '@/utils/UserPermissions';

const Page = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const data = GetUnfilteredDataList({
    endPoint: 'online-bookings',
  });

  const [search, setSearch] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 30;

  useEffect(() => {
    setPage(1);
  }, [search, bookingDate]);

  const getBookingDateValue = (item) => {
    const rawDate =
      item?.createdAt ||
      item?.created_at ||
      item?.attributes?.createdAt ||
      item?.attributes?.created_at;

    if (!rawDate) return '';

    if (typeof rawDate === 'string') {
      const dateOnlyMatch = rawDate.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateOnlyMatch) return dateOnlyMatch[1];

      const parsedDate = new Date(rawDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
      }
    }

    if (rawDate instanceof Date) {
      return `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`;
    }

    return '';
  };

  const filteredData = useMemo(() => {
    if (!data) return [];

    const normalizedSearch = search.trim().toLowerCase();

    return data.filter((a) => {
      const hotelName = a?.hotel?.hotel_name?.toLowerCase() || '';
      const phone = a?.online_user?.phone?.toLowerCase() || '';
      const bookingDateValue = getBookingDateValue(a);
      const idValue = `bmpgob${a.id}`;

      const matchesSearch =
        !normalizedSearch ||
        idValue.includes(normalizedSearch) ||
        hotelName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch);
      const matchesDate = !bookingDate || bookingDateValue === bookingDate;

      return matchesSearch && matchesDate;
    });
  }, [data, search, bookingDate]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleReset = () => {
    setSearch('');
    setBookingDate('');
    setPage(1);
  };

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Typography color="text.primary">Manage Booking</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            mb={2}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
              <TextField
                label="Search hotel / phone"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 260 } }}
              />
              <TextField
                label="Booking date"
                type="date"
                variant="outlined"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: '100%', sm: 220 } }}
              />
            </Stack>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Stack>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    '#ID',
                    'Booked Date',
                    'Hotel',
                    'Guest',
                    'Phone',
                    'Check In',
                    'Check Out',
                    'No of nights',
                    'Status',
                    'Actions',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData?.map((row) => (
                  <TableRow key={row.documentId} hover>
                    <TableCell>BMPGOB{row.id}</TableCell>
                    <TableCell>{GetCustomDate(row.createdAt)}</TableCell>
                    <TableCell>{row?.hotel?.hotel_name}</TableCell>
                    <TableCell>{row?.online_user?.name}</TableCell>
                    <TableCell>{row?.online_user?.phone}</TableCell>

                    <TableCell>{GetCustomDate(row.check_out)}</TableCell>
                    <TableCell>{GetCustomDate(row.check_out)}</TableCell>
                    <TableCell>{row?.nights}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.booking_status}
                        sx={{
                          bgcolor:
                            row.booking_status === 'Pending Approval'
                              ? 'warning.main'
                              : row.booking_status === 'Approved'
                                ? 'success.main'
                                : 'error.main',
                          color: '#fff',
                        }}
                      />
                    </TableCell>

                    {/* Stop row click for actions */}
                    <TableCell
                      sx={{ width: '50px' }}
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        onClick={() =>
                          router.push(`/manage-bookings/${row.documentId}`)
                        }
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          width: 32,
                          height: 32,
                          backgroundColor: (theme) =>
                            theme.palette.secondary.main,
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: (theme) =>
                              theme.palette.secondary.dark,
                          },
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Booking found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack alignItems="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page - 1}
              onChange={(_, value) => setPage(value + 1)}
              color="primary"
            />
          </Stack>
        </Box>
      )}
    </>
  );
};

export default Page;
