'use client';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';

// mui
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { Loader } from '@/component/common';
import { GetCustomDate } from '@/utils/DateFetcher';

const Page = () => {
  const { auth } = useAuth();

  const data = GetDataList({
    auth,
    endPoint: 'reviews',
  });
  console.log(data);

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
          <Typography color="text.primary">Customer Reviews</Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <Box p={3}>
          {/* Data Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  {[
                    'Date',
                    'Customer Name',
                    'Customer Phone',
                    'Stars',
                    'Comment',
                  ].map((item, index) => (
                    <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((row) => (
                  <TableRow key={row.documentId}>
                    <TableCell>{GetCustomDate(row.createdAt)}</TableCell>
                    <TableCell>{row.customer.name}</TableCell>
                    <TableCell>{row.customer.mobile}</TableCell>
                    <TableCell>⭐{row.star}</TableCell>
                    <TableCell>{row.comment}</TableCell>
                  </TableRow>
                ))}
                {data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No inventory categories found
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
