import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { Print, Visibility } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import { resInvoiceThermalReceipt } from '@/utils/thermalReceipt';
import { useReactToPrint } from 'react-to-print';
import { RestaurantPosInvoice } from '../printables/RestaurantPosInvoice';

const OrderTable = ({
  orders,
  setSelectedRow,
  setDeleteOpen,
  permissions,
  myProfile,
  invoices,
}) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [printerList, setPrinterList] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      if (
        typeof window !== 'undefined' &&
        window.AndroidPrinter?.getPairedPrinters
      ) {
        const printersRaw = window.AndroidPrinter.getPairedPrinters();
        const printers = printersRaw
          .split('\n')
          .filter(Boolean)
          .map((p) => {
            const [name, mac] = p.split('|');
            return { name, mac };
          });
        setPrinterList(printers);
      }
    }, 1000);
  }, []);

  const handleInvoicePrint = () => {
    const receipt = resInvoiceThermalReceipt(viewData, myProfile);

    if (typeof window !== 'undefined' && window.AndroidPrinter?.printInvoice) {
      const result = window.AndroidPrinter.printInvoice(receipt);
      console.log('Printer result:', result);
    } else {
      reactPrint();
    }
  };

  const componentRef = useRef(null);
  const reactPrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'res-inv',
  });

  const handleView = (order) => {
    const invoiceData = invoices.find(
      (inv) => inv.documentId === order.restaurant_invoice?.documentId,
    );
    setViewData(invoiceData);
    setViewOpen(true);
  };
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📋 Table Orders
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              {['#ID', 'Table', 'Status', 'Method', 'Amount', 'Actions'].map(
                (item, index) => (
                  <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                    {item}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const totalAmount = order.food_items?.reduce(
                (sum, item) => sum + item.amount,
                0,
              );

              return (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f1f8ff' },
                    transition: '0.2s',
                  }}
                >
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.table?.table_no}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      gutterBottom
                      color={
                        order.token_status === 'Closed' ? 'error' : 'success'
                      }
                    >
                      {order.token_status === 'Closed' ? 'Closed' : 'Open'}
                    </Typography>
                    {/* <Chip
                      label={order.token_status}
                      color="error"
                      size="small"
                    /> */}
                  </TableCell>
                  <TableCell>
                    {order.token_status === 'Closed' && (
                      <>{order.closing_method || '-'}</>
                    )}
                  </TableCell>
                  <TableCell>₹{totalAmount.toFixed(2) || 0}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      {order.closing_method === 'Restaurant Invoice' ? (
                        <IconButton
                          disabled={order?.token_status !== 'Closed'}
                          color="secondary"
                          onClick={() => handleView(order)}
                          size="small"
                        >
                          <Visibility fontSize="inherit" />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="secondary"
                          size="small"
                          disabled={order.token_status !== 'Closed'}
                          href={`/front-office/room-booking/${order?.room_booking?.documentId}`}
                        >
                          <Visibility fontSize="inherit" />
                        </IconButton>
                      )}
                    </Tooltip>
                    <IconButton
                      color="secondary"
                      size="small"
                      href={`/restaurant/tables-orders/edit?orderId=${order.documentId}`}
                      disabled={
                        order?.token_status === 'Closed' ||
                        !permissions.canUpdate
                      }
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        setSelectedRow(order);
                        setDeleteOpen(true);
                      }}
                      disabled={!permissions.canDelete}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Invoice: {viewData?.invoice_no}</DialogTitle>
        <DialogContent dividers>
          {viewData && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Date: {viewData.date} | Time: {viewData.time}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {viewData.customer_name} ({viewData.customer_phone})
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                GST: {viewData.customer_gst}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Address: {viewData.customer_address}
              </Typography>

              {/* Items Table */}
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>HSN</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>GST %</TableCell>

                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewData.menu_items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>{item.hsn}</TableCell>
                        <TableCell>{item.rate}</TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{item.gst}</TableCell>

                        <TableCell>{item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary */}
              <Box mt={2}>
                <Typography>Total: ₹{viewData.total_amount}</Typography>
                <Typography>GST: ₹{viewData.tax}</Typography>
                <Typography>Payable: ₹{viewData.payable_amount}</Typography>
                <Typography>Payment Method: {viewData.mop}</Typography>
              </Box>
              <div style={{ display: 'none' }}>
                <RestaurantPosInvoice
                  ref={componentRef}
                  invoice={viewData}
                  profile={myProfile}
                  size="58mm"
                />
              </div>
            </>
          )}
          {printerList && printerList.length > 0 && (
            <>
              <FormControl fullWidth margin="dense" size="small">
                <InputLabel>Select Printer</InputLabel>
                <Select
                  size="small"
                  fullWidth
                  value={selectedPrinter?.mac || ''}
                  label="Select Printer"
                  onChange={(e) => {
                    const selectedMac = e.target.value;
                    window.AndroidPrinter.savePrinter(selectedMac);
                    const selectedPrinter = printerList.find(
                      (p) => p.mac === selectedMac,
                    );
                    setSelectedPrinter(selectedPrinter);
                  }}
                >
                  <MenuItem value="">Select Printer</MenuItem>
                  {printerList.map((printer) => (
                    <MenuItem key={printer.mac} value={printer.mac}>
                      {printer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handleInvoicePrint}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: 'none' }}>
        <RestaurantPosInvoice
          ref={componentRef}
          invoice={viewData}
          profile={myProfile}
          size="58mm"
        />
      </Box>
    </>
  );
};

export default OrderTable;
