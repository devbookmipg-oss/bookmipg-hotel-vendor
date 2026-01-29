import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Table,
  Stack,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const CreateNewOrder = ({
  formOpen,
  setFormOpen,
  editing,
  formData,
  setFormData,
  tables,
  menuItems,
  selectedItem,
  setSelectedItem,
  handleSave,
}) => {
  const handleItemSelect = () => {
    if (!selectedItem) return;
    const itemObj = menuItems.find((m) => m.documentId === selectedItem);
    if (!itemObj) return;

    const rate = parseFloat(itemObj.rate) || 0;
    const gstPercent = parseFloat(itemObj.gst) || 0;
    const amount = rate + (rate * gstPercent) / 100;

    const newItem = {
      item: itemObj.item,
      hsn: itemObj.hsn || '',
      rate,
      qty: 1,
      gst: gstPercent,
      amount: parseFloat(amount.toFixed(2)),
    };

    setFormData({
      ...formData,
      food_items: [...formData.food_items, newItem],
    });

    setSelectedItem('');
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.food_items];
    const item = { ...updated[index] };
    const numericValue = parseFloat(value) || 0;

    item[field] = numericValue;

    const rate = parseFloat(item.rate) || null;
    const qty = parseFloat(item.qty) || 1;
    const gst = parseFloat(item.gst) || null;
    const amount = parseFloat(item.amount) || null;

    if (field === 'rate' || field === 'gst' || field === 'qty') {
      // Forward calculation
      const newAmount = qty * rate * (1 + gst / 100);
      item.amount = parseFloat(newAmount.toFixed(2));
    } else if (field === 'amount') {
      // Reverse calculation
      const base = amount / qty;
      const newRate = base / (1 + gst / 100);
      item.rate = parseFloat(newRate.toFixed(2));
    }

    updated[index] = item;
    setFormData({ ...formData, food_items: updated });
  };

  // Calculate summary
  const totalAmount = formData.food_items.reduce(
    (acc, cur) => acc + cur.rate * cur.qty,
    0,
  );
  const tax = formData.food_items.reduce(
    (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
    0,
  );
  const payable = totalAmount + tax;

  return (
    <Dialog
      open={formOpen}
      onClose={() => setFormOpen(false)}
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
        {editing ? '✏️ Edit Order' : '🍽️ New Order'}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {/* Table Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
            📍 Select Table
          </Typography>
          <TextField
            select
            margin="dense"
            label="Table"
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.table || ''}
            onChange={(e) =>
              setFormData({ ...formData, table: e.target.value })
            }
            SelectProps={{ native: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          >
            <option value="">-- Select Table --</option>
            {tables?.map((table) => (
              <option key={table.documentId} value={table.documentId}>
                Table {table?.table_no}
              </option>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Menu Items Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
            🍴 Add Menu Items
          </Typography>

          <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} alignItems="flex-end">
            <TextField
              select
              margin="dense"
              label="Menu Item"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedItem || ''}
              onChange={(e) => setSelectedItem(e.target.value)}
              SelectProps={{ native: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            >
              <option value="">-- Select Item --</option>
              {menuItems?.map((cat) => (
                <option key={cat.documentId} value={cat.documentId}>
                  {cat?.item} (₹{cat?.rate})
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleItemSelect}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                py: 1,
              }}
            >
              Add Item
            </Button>
          </Stack>
        </Box>

        {/* Items Table */}
        {formData.food_items?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <TableContainer component={Paper} sx={{ borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      Item
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      Rate
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      Qty
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      GST %
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      Total
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.food_items.map((item, idx) => (
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
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(idx, 'rate', e.target.value)
                          }
                          sx={{
                            width: 70,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(idx, 'qty', e.target.value)
                          }
                          sx={{
                            width: 60,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.gst}
                          onChange={(e) =>
                            handleItemChange(idx, 'gst', e.target.value)
                          }
                          sx={{
                            width: 60,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={item.amount}
                          onChange={(e) =>
                            handleItemChange(idx, 'amount', e.target.value)
                          }
                          sx={{
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            const updated = formData.food_items.filter(
                              (_, i) => i !== idx,
                            );
                            setFormData({
                              ...formData,
                              food_items: updated,
                            });
                          }}
                          sx={{
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Summary Section */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}>
            💰 Order Summary
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
                <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
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
                <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                  SGST
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#333',
                    mt: 0.3,
                  }}
                >
                  ₹{(tax / 2).toFixed(2)}
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
                <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                  CGST
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#333',
                    mt: 0.3,
                  }}
                >
                  ₹{(tax / 2).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                  p: 1.5,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  color: '#fff',
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
                  Total
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    mt: 0.3,
                  }}
                >
                  ₹{payable.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button
          onClick={() => setFormOpen(false)}
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
          {editing ? '✏️ Update Order' : '➕ Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNewOrder;
