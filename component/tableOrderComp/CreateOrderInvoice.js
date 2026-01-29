import { CreateNewData, UpdateData } from '@/utils/ApiFunctions';
import { GetTodaysDate } from '@/utils/DateFetcher';
import { SuccessToast } from '@/utils/GenerateToast';
import { GetCurrentTime } from '@/utils/Timefetcher';
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
  Box,
  Divider,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';

const CreateOrderInvoice = ({
  auth,
  invoiceOpen,
  setInvoiceOpen,
  selectedRow,
  setSelectedRow,
  invoices,
  paymentMethods,
}) => {
  const todaysDate = GetTodaysDate().dateString;
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    mop: '',
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
    const totalAmount = selectedRow.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );
    const tax = selectedRow.food_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );
    const payable = totalAmount + tax;

    // ✅ Clean menu_items (remove id/documentId/etc.)
    const cleanedMenuItems = selectedRow.food_items.map(
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

    await UpdateData({
      auth,
      endPoint: 'table-orders',
      id: selectedRow.documentId,
      payload: {
        data: {
          closing_method: 'Restaurant Invoice',
          token_status: 'Closed',
          restaurant_invoice: res.data.data.documentId,
        },
      },
    });

    SuccessToast('Invoice created successfully');

    setInvoiceOpen(false);
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_gst: '',
      customer_address: '',
      mop: '',
    });
    setSelectedRow(null);
  };

  // Calculate summary
  const totalAmount =
    selectedRow?.food_items?.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    ) || 0;
  const tax =
    selectedRow?.food_items?.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    ) || 0;
  const payable = totalAmount + tax;

  return (
    <Dialog
      open={invoiceOpen}
      onClose={() => setInvoiceOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #c20f12 0%, #e63946 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          pb: 2,
        }}
      >
        🧾 Create Invoice
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {/* Customer Information */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}
          >
            👤 Customer Information
          </Typography>
          <Grid container spacing={1.5}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Phone Number"
                size="small"
                fullWidth
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_phone: e.target.value,
                  })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="GST Number"
                size="small"
                fullWidth
                value={formData.customer_gst}
                onChange={(e) =>
                  setFormData({ ...formData, customer_gst: e.target.value })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Address"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={formData.customer_address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_address: e.target.value,
                  })
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Items Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}
          >
            🍽️ Order Items
          </Typography>

          {selectedRow?.food_items?.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 1.5, border: '1px solid #e0e0e0' }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '0.8rem',
                      }}
                    >
                      Item
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '0.8rem',
                      }}
                    >
                      Rate
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '0.8rem',
                      }}
                    >
                      Qty
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '0.8rem',
                      }}
                    >
                      GST %
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '0.8rem',
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRow?.food_items.map((item, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.85rem' }}>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {item.item}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                        ₹{item.rate.toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                        {item.qty}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                        {item.gst}%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        ₹{item.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Summary Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}
          >
            💰 Invoice Summary
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 1.5,
                  borderRadius: 1.5,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block' }}
                >
                  Subtotal
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#333',
                    mt: 0.3,
                  }}
                >
                  ₹{totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  p: 1.5,
                  borderRadius: 1.5,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block' }}
                >
                  Tax
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#333',
                    mt: 0.3,
                  }}
                >
                  ₹{tax.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  background:
                    'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                  p: 1.5,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ display: 'block', opacity: 0.9 }}
                >
                  Total Amount Payable
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    mt: 0.3,
                  }}
                >
                  ₹{payable.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment Section */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}
          >
            💳 Payment Method
          </Typography>
          <TextField
            select
            margin="dense"
            label="Mode Of Payment"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.mop}
            onChange={(e) => setFormData({ ...formData, mop: e.target.value })}
            SelectProps={{ native: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          >
            <option value="">-- Select Payment Method --</option>
            {paymentMethods?.map((cat) => (
              <option key={cat.documentId} value={cat.name}>
                {cat?.name}
              </option>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button
          onClick={() => {
            setInvoiceOpen(false);
            setFormData({
              customer_name: '',
              customer_phone: '',
              customer_gst: '',
              customer_address: '',
              mop: '',
            });
            setSelectedRow(null);
          }}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success"
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3,
          }}
        >
          ✓ Create Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderInvoice;
