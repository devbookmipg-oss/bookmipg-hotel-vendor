'use client';

import { useAuth } from '@/context';
import { GetUnfilteredDataList } from '@/utils/ApiFunctions';
import { useState, useMemo } from 'react';

// mui
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Loader } from '@/component/common';
import { useRouter } from 'next/navigation';
import { GetCustomDate } from '@/utils/DateFetcher';

const Page = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const data = GetUnfilteredDataList({
    auth,
    endPoint: 'online-bookings',
  });

  const [search, setSearch] = useState('');

  // Filter data by hotel and search
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((a) => {
      // ✅ Step 1: Filter by hotel
      const isSameHotel = a.hotel?.documentId === auth?.user?.hotel_id;
      if (!isSameHotel) return false;

      // ✅ Step 2: Handle search input
      if (!search) return true;

      // Compare numeric ID (convert both to string for partial match)
      return String(`BMPGOB${a.id}`)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase());
    });
  }, [data, search, auth?.user?.hotel_id]);

  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Typography color="text.primary">Online Booking</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Header Section */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <TextField
              size="small"
              label="Search by ID"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    '#ID',
                    'Booked Date',
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
                {filteredData?.map((row) => (
                  <TableRow
                    key={row.documentId}
                    hover
                    onClick={() =>
                      router.push(
                        `/front-office/online-booking/${row.documentId}`,
                      )
                    }
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell>BMPGOB{row.id}</TableCell>
                    <TableCell>{GetCustomDate(row.createdAt)}</TableCell>
                    <TableCell>{row?.online_user?.name}</TableCell>
                    <TableCell>{row?.online_user?.phone}</TableCell>

                    <TableCell>{GetCustomDate(row.check_out)}</TableCell>
                    <TableCell>{GetCustomDate(row.check_out)}</TableCell>
                    <TableCell>{row?.nights}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.booking_status}
                        color={
                          row.booking_status === 'Pending Approval'
                            ? 'warning'
                            : row.booking_status === 'Approved'
                              ? 'success'
                              : 'error'
                        }
                      />
                    </TableCell>

                    {/* Stop row click for actions */}
                    <TableCell
                      sx={{ width: '50px' }}
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() =>
                            router.push(
                              `/front-office/online-booking/${row.documentId}`,
                            )
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
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Booking found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </>
  );
};

export default Page;
