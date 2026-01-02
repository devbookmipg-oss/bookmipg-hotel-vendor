'use client';

import { useAuth } from '@/context';
import { GetDataList } from '@/utils/ApiFunctions';
import { useState, useRef } from 'react';

// mui
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintIcon from '@mui/icons-material/Print';

import { Loader } from '@/component/common';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { useReactToPrint } from 'react-to-print';
import { RestaurantInvoiceReportPrint } from '@/component/printables/RestaurantInvoiceReportPrint';

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const data = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todaysDate);
  const [filteredData, setfilteredData] = useState([]);

  const handleSearch = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter purchases within date range
    const filteredInvoices =
      data?.filter((pur) => {
        const d = new Date(pur.date);
        return d >= start && d <= end;
      }) || [];

    setfilteredData(filteredInvoices);
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'stock-report',
  });

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
          <Typography color="text.primary">
            Restaurant Invoice Report
          </Typography>
        </Breadcrumbs>
      </Box>
      {!data ? (
        <Loader />
      ) : (
        <>
          <Box p={3}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  size="small"
                  label="Start Date"
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <TextField
                  size="small"
                  label="End Date"
                  variant="outlined"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ mr: 1 }}
                  InputLabelProps={{ shrink: true }} // 👈 fixes label overlap
                  inputProps={{ max: todaysDate }} // 👈 move `max` inside inputProps
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Box>
              <Button
                variant="contained"
                color="success"
                startIcon={<PrintIcon />}
                disabled={filteredData.length === 0}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Box>

            {/* Data Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    {[
                      'Invoice No',
                      'Date/Time',
                      'Customer Name',
                      'Payment Method',
                    ].map((item, index) => (
                      <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                        {item}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Subtotal
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      GST
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      Payable
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData?.map((row) => (
                    <TableRow key={row.documentId}>
                      <TableCell>{row.invoice_no}</TableCell>
                      <TableCell>
                        {row.date}:{row.time}
                      </TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{row.mop}</TableCell>
                      <TableCell align="right">
                        {row.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{row.tax.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {row.payable_amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No invoice found
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <Typography fontWeight={600}>Total:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {filteredData
                          .reduce(
                            (sum, row) => sum + parseFloat(row.total_amount),
                            0
                          )
                          .toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {filteredData
                          .reduce((sum, row) => sum + parseFloat(row.tax), 0)
                          .toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {filteredData
                          .reduce(
                            (sum, row) => sum + parseFloat(row.payable_amount),
                            0
                          )
                          .toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: 'none' }}>
            <RestaurantInvoiceReportPrint
              filteredData={filteredData}
              ref={componentRef}
              startDate={startDate}
              endDate={endDate}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default Page;
