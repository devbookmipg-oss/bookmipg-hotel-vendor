'use client';

import { useAuth } from '@/context';
import { GetDataList, GetSingleData, UpdateData } from '@/utils/ApiFunctions';
import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Autocomplete,
  Grid,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { SuccessToast, ErrorToast } from '@/utils/GenerateToast';
import { Loader } from '@/component/common';
import { GetCustomDate } from '@/utils/DateFetcher';

const EditInvoice = ({ params }) => {
  const { auth } = useAuth();
  const { id } = use(params);
  const router = useRouter();

  const invoice = GetSingleData({
    endPoint: 'restaurant-invoices',
    auth,
    id,
  });

  const menuItems = GetDataList({
    auth,
    endPoint: 'restaurant-menus',
  });

  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });

  const [formData, setFormData] = useState({
    documentId: '',
    invoice_no: '',
    date: '',
    time: '',
    customer_name: '',
    customer_phone: '',
    customer_gst: '',
    customer_address: '',
    menu_items: [],
    mop: '',
    hotel_id: auth?.user?.hotel_id || '',
  });
  const [selectedItem, setSelectedItem] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [invoiceLoaded, setInvoiceLoaded] = useState(false);

  useEffect(() => {
    if (!invoice || invoiceLoaded) return;

    setFormData({
      invoice_no: invoice.invoice_no || '',
      date: invoice.date || '',
      time: invoice.time || '',
      customer_name: invoice.customer_name || '',
      customer_phone: invoice.customer_phone || '',
      customer_gst: invoice.customer_gst || '',
      customer_address: invoice.customer_address || '',
      menu_items: invoice.menu_items || [],
      mop: invoice.mop || '',
      hotel_id: auth?.user?.hotel_id || '',
    });

    setInvoiceLoaded(true);
  }, [invoice, auth?.user?.hotel_id, invoiceLoaded]);

  const totals = useMemo(() => {
    const totalAmount = (formData.menu_items || []).reduce((acc, cur) => {
      const qty = parseFloat(cur.qty) || 0;
      const rate = parseFloat(cur.rate) || 0;
      return acc + qty * rate;
    }, 0);

    const totalTax = (formData.menu_items || []).reduce((acc, cur) => {
      const qty = parseFloat(cur.qty) || 0;
      const rate = parseFloat(cur.rate) || 0;
      const gst = parseFloat(cur.gst) || 0;
      return acc + (qty * rate * gst) / 100;
    }, 0);

    return {
      totalAmount,
      totalTax,
      payable: totalAmount + totalTax,
      sgst: totalTax / 2,
      cgst: totalTax / 2,
    };
  }, [formData.menu_items]);

  const validateForm = () => {
    const errors = {};
    if (!formData.menu_items || formData.menu_items.length === 0) {
      errors.menu_items = 'Please add at least one menu item';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleItemSelect = () => {
    if (!selectedItem) return;
    const selected = menuItems.find((m) => m.documentId === selectedItem);
    if (!selected) return;

    const rate = selected.rate || 0;
    const gstPercent = selected.gst || 0;
    const gstValue = (rate * gstPercent) / 100;

    const newItem = {
      item: selected.name,
      hsn: selected.hsn_code || '',
      rate,
      qty: 1,
      gst: gstPercent,
      amount: rate + gstValue,
    };

    setFormData((prev) => ({
      ...prev,
      menu_items: [...(prev.menu_items || []), newItem],
    }));
    setSelectedItem('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      ErrorToast('Enter required fields');
      return;
    }

    setSaving(true);

    try {
      const cleanedMenuItems = (formData.menu_items || []).map(
        ({ id, documentId, ...rest }) => rest,
      );

      const payload = {
        ...formData,
        total_amount: totals.totalAmount,
        tax: totals.totalTax,
        payable_amount: totals.payable,
        menu_items: cleanedMenuItems,
      };
      console.log('Payload to update:', payload);

      await UpdateData({
        auth,
        endPoint: 'restaurant-invoices',
        id,
        payload: { data: payload },
      });

      SuccessToast('Invoice updated successfully');
      // Navigate back to the previous page in browser history
      router.back();
    } catch (err) {
      console.error(err);
      ErrorToast('Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  if (!invoice || !menuItems || !paymentMethods) {
    return <Loader />;
  }

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
          <Link underline="hover" color="inherit" href="/restaurant/invoices/">
            Restaurant Invoices
          </Link>
          <Typography color="text.primary">Edit Invoices</Typography>
        </Breadcrumbs>
      </Box>

      <Box p={3}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography>
              Invoice No: <strong>{formData.invoice_no}</strong>
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography>
              Date/Time:{' '}
              <strong>
                {GetCustomDate(formData.date)} {formData.time}
              </strong>
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Customer Name"
              margin="dense"
              size="small"
              fullWidth
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Customer Phone"
              margin="dense"
              size="small"
              fullWidth
              value={formData.customer_phone}
              onChange={(e) =>
                setFormData({ ...formData, customer_phone: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="GST No"
              margin="dense"
              size="small"
              fullWidth
              value={formData.customer_gst}
              onChange={(e) =>
                setFormData({ ...formData, customer_gst: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address"
              margin="dense"
              size="small"
              fullWidth
              value={formData.customer_address}
              onChange={(e) =>
                setFormData({ ...formData, customer_address: e.target.value })
              }
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Items
        </Typography>

        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid size={10}>
            <FormControl fullWidth>
              <Autocomplete
                options={menuItems || []}
                getOptionLabel={(option) => option?.name || ''}
                value={
                  menuItems?.find((item) => item.documentId === selectedItem) ||
                  null
                }
                onChange={(event, newValue) => {
                  setSelectedItem(newValue ? newValue.documentId : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Menu Item"
                    margin="dense"
                    size="small"
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.documentId === value.documentId
                }
                clearOnEscape
              />
            </FormControl>
          </Grid>
          <Grid size={2}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleItemSelect}
              disabled={!selectedItem}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        {formData.menu_items?.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    'Name',
                    'HSN',
                    'Rate',
                    'Qty',
                    'GST %',
                    'Total',
                    'Actions',
                  ].map((header) => (
                    <TableCell key={header}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.menu_items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.hsn}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.rate}
                        onChange={(e) => {
                          const updated = [...formData.menu_items];
                          const rate = parseFloat(e.target.value) || 0;
                          updated[idx].rate = rate;
                          const qty = updated[idx].qty || 1;
                          const gst = updated[idx].gst || 0;
                          updated[idx].amount = +(
                            qty *
                            rate *
                            (1 + gst / 100)
                          ).toFixed(2);
                          setFormData({ ...formData, menu_items: updated });
                        }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...formData.menu_items];
                          const qty = parseFloat(e.target.value) || 1;
                          updated[idx].qty = qty;
                          const rate = updated[idx].rate || 0;
                          const gst = updated[idx].gst || 0;
                          updated[idx].amount = +(
                            qty *
                            rate *
                            (1 + gst / 100)
                          ).toFixed(2);
                          setFormData({ ...formData, menu_items: updated });
                        }}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.gst}
                        onChange={(e) => {
                          const updated = [...formData.menu_items];
                          const gst = parseFloat(e.target.value) || 0;
                          updated[idx].gst = gst;
                          const qty = updated[idx].qty || 1;
                          const rate = updated[idx].rate || 0;
                          updated[idx].amount = +(
                            qty *
                            rate *
                            (1 + gst / 100)
                          ).toFixed(2);
                          setFormData({ ...formData, menu_items: updated });
                        }}
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...formData.menu_items];
                          const amount = parseFloat(e.target.value) || 0;
                          updated[idx].amount = amount;
                          const qty = updated[idx].qty || 1;
                          const gst = updated[idx].gst || 0;
                          updated[idx].rate = +(
                            amount /
                            qty /
                            (1 + gst / 100)
                          ).toFixed(2);
                          setFormData({ ...formData, menu_items: updated });
                        }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          const updated = formData.menu_items.filter(
                            (_, idx2) => idx2 !== idx,
                          );
                          setFormData({ ...formData, menu_items: updated });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mb={2}>
          <Typography>Total: ₹{totals.totalAmount.toFixed(2)}</Typography>
          <Typography>SGST: ₹{totals.sgst.toFixed(2)}</Typography>
          <Typography>CGST: ₹{totals.cgst.toFixed(2)}</Typography>
          <Typography>Payable: ₹{totals.payable.toFixed(2)}</Typography>
        </Box>

        <FormControl fullWidth margin="dense" size="small">
          <InputLabel>Mode Of Payment</InputLabel>
          <Select
            value={formData.mop || ''}
            label="Mode Of Payment"
            onChange={(e) => setFormData({ ...formData, mop: e.target.value })}
          >
            <MenuItem value="">-- Select --</MenuItem>
            {paymentMethods.map((pm) => (
              <MenuItem key={pm.documentId} value={pm.name}>
                {pm.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {formErrors.mop && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {formErrors.mop}
          </Typography>
        )}

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => router.push('/restaurant/invoices')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Invoice'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default EditInvoice;
