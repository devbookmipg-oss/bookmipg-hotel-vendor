'use client';
import { useAuth } from '@/context';
import {
  CreateNewData,
  GetDataList,
  GetSingleData,
  UpdateData,
} from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { SuccessToast } from '@/utils/GenerateToast';
import { GetCurrentTime } from '@/utils/Timefetcher';
import { NavigateNext } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Breadcrumbs,
} from '@mui/material';
import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';

const CreateInvoive = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [loading, setLoading] = useState(false);
  const todaysDate = GetTodaysDate().dateString;
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    mop: '',
  });
  const tableOrder = GetSingleData({
    auth,
    endPoint: 'table-orders',
    id: orderId,
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });
  const invoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });
  const generateNextInvoiceNo = () => {
    if (!invoices || invoices.length === 0) {
      return 'INV-1';
    }

    // Extract all numbers from invoice_no like "INV-12" -> 12
    const numbers = invoices
      .map((inv) => parseInt(inv.invoice_no?.replace('INV-', ''), 10))
      .filter((n) => !isNaN(n));

    const maxNumber = Math.max(...numbers);

    return `INV-${maxNumber + 1}`;
  };

  const createInvoice = async () => {
    // recalc before save
    const totalAmount = tableOrder.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = tableOrder.food_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    const payable = totalAmount + tax;

    // ✅ Clean menu_items (remove id/documentId/etc.)
    const cleanedMenuItems = tableOrder.food_items.map(
      ({ id, documentId, room, ...rest }) => rest,
    );
    const newInvoiceNO = generateNextInvoiceNo();
    const time = GetCurrentTime();
    const finalData = {
      ...formData,
      invoice_no: newInvoiceNO,
      date: todaysDate,
      time: time,
      total_amount: totalAmount,
      tax,
      payable_amount: payable,
      menu_items: cleanedMenuItems,
      hotel_id: auth?.user?.hotel_id || '',
    };

    const res = await CreateNewData({
      auth,
      endPoint: 'restaurant-invoices',
      payload: { data: finalData },
    });
    return res;
  };
  const handleSave = async () => {
    const res = await createInvoice();
    setLoading(true);
    await UpdateData({
      auth,
      endPoint: 'table-orders',
      id: tableOrder.documentId,
      payload: {
        data: {
          closing_method: 'Restaurant Invoice',
          token_status: 'Closed',
          restaurant_invoice: res.data.data.documentId,
        },
      },
    });

    SuccessToast('Invoice created successfully');

    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_gst: '',
      customer_address: '',
      mop: '',
    });

    setLoading(false);
    router.back();
  };
  return (
    <>
      <Box sx={{ px: 3, py: 2, backgroundColor: '#efefef' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/restaurant/table-orders"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Table Orders
          </Link>
          <Typography color="text.primary">Create Invoice</Typography>
        </Breadcrumbs>
      </Box>
      <Box p={3}>
        <Grid container spacing={1} mb={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              label="Customer Name"
              size="small"
              fullWidth
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer_name: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              label="Phone"
              size="small"
              fullWidth
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer_phone: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              label="GST No"
              size="small"
              fullWidth
              value={formData.customer_gst}
              onChange={(e) =>
                setFormData({ ...formData, customer_gst: e.target.value })
              }
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              label="Address"
              size="small"
              fullWidth
              value={formData.customer_address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer_address: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>

        {/* Items Section */}
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>

        {tableOrder?.food_items?.length > 0 && (
          <TableContainer component={Paper} sx={{ borderRadius: 1, mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    'Name',
                    'HSN',
                    'Rate',
                    'Qty',
                    'SGST %',
                    'CGST %',
                    'Total',
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableOrder?.food_items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.hsn}</TableCell>
                    <TableCell>{item.rate}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.gst / 2}</TableCell>
                    <TableCell>{item.gst / 2}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Summary Section */}
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        {(() => {
          const totalAmount = tableOrder?.food_items?.reduce(
            (acc, cur) => acc + cur.rate * cur.qty,
            0,
          );
          const tax = tableOrder?.food_items?.reduce(
            (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
            0,
          );
          const payable = totalAmount + tax;

          return (
            <Grid container spacing={2} mb={2}>
              <Grid item size={{ xs: 12, sm: 3 }}>
                <Typography>
                  Total: <b>{totalAmount?.toFixed(2)}</b>
                </Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 3 }}>
                <Typography>
                  SGST: <b>{tax?.toFixed(2) / 2}</b>
                </Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 3 }}>
                <Typography>
                  CGST: <b>{tax?.toFixed(2) / 2}</b>
                </Typography>
              </Grid>
              <Grid item size={{ xs: 12, sm: 3 }}>
                <Typography>
                  Payable: <b>{payable?.toFixed(2)}</b>
                </Typography>
              </Grid>
            </Grid>
          );
        })()}

        {/* Payment Section */}
        <Typography variant="h6" gutterBottom>
          Payment
        </Typography>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12 }}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Mode Of Payment</InputLabel>
              <Select
                label="Mode Of Payment"
                value={formData.mop}
                onChange={(e) =>
                  setFormData({ ...formData, mop: e.target.value })
                }
              >
                <MenuItem value="">-- Select --</MenuItem>
                {paymentMethods?.map((cat) => (
                  <MenuItem key={cat.documentId} value={cat.name}>
                    {cat?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Link
            href="/restaurant/table-orders"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="outlined">Cancel</Button>
          </Link>
          <Button
            onClick={handleSave}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {!loading ? 'Create' : 'Creating...'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

const Page = () => {
  return (
    <>
      <Suspense>
        <CreateInvoive />
      </Suspense>
    </>
  );
};
export default Page;
