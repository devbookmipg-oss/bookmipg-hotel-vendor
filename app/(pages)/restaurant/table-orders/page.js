'use client';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  alpha,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

import {
  GetDataList,
  CreateNewData,
  UpdateData,
  DeleteData,
  GetSingleData,
} from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useState, useRef, useEffect } from 'react';
import { GetCurrentTime } from '@/utils/Timefetcher';
import { GetCustomDate, GetTodaysDate } from '@/utils/DateFetcher';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { useReactToPrint } from 'react-to-print';
import {
  CreateNewOrder,
  CreateOrderInvoice,
  DeleteDialog,
  OrderTable,
  TableGrid,
  TransferOrder,
} from '@/component/tableOrderComp';
import { KotPrint } from '@/component/printables/KotPrint';
import { CheckUserPermission } from '@/utils/UserPermissions';
import { kotThermalReceipt } from '@/utils/thermalReceipt';

const Page = () => {
  const { auth } = useAuth();
  const permissions = CheckUserPermission(auth?.user?.permissions);
  const [loading, setLoading] = useState(false);
  const todaysDate = GetTodaysDate().dateString;
  const tables = GetDataList({ auth, endPoint: 'tables' });
  const orders = GetDataList({ auth, endPoint: 'table-orders' });

  const bookings = GetDataList({
    auth,
    endPoint: 'room-bookings',
  });
  const paymentMethods = GetDataList({
    auth,
    endPoint: 'payment-methods',
  });
  const invoices = GetDataList({
    auth,
    endPoint: 'restaurant-invoices',
  });
  const myProfile = GetSingleData({
    auth,
    endPoint: 'hotels',
    id: auth?.user?.hotel_id,
  });

  const activeBookings = bookings?.filter((bk) => {
    const checkIn = new Date(bk.checkin_date);
    const checkOut = new Date(bk.checkout_date);
    const today = new Date(todaysDate);

    return (
      bk.checked_in === true &&
      bk.checked_out !== true &&
      today >= checkIn &&
      today <= checkOut
    );
  });

  // Step 2: Flatten all rooms from those active bookings
  const activeRooms = activeBookings?.flatMap(
    (bk) =>
      bk.rooms?.map((room) => ({
        booking_id: bk.documentId,
        room_no: room.room_no,
      })) || [],
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // room transfer/invoice state
  const [transferOpen, setTransferOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  // KOT print state
  const [kotOpen, setKotOpen] = useState(false);
  const [kotData, setKotData] = useState(null);
  const [kotDialogOpen, setKotDialogOpen] = useState(false);
  const kotComponentRef = useRef(null);

  const handleKOT = (order) => {
    setKotData(order);
    setKotOpen(true);
  };

  const [printerList, setPrinterList] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
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

  const handleKOTPrint = () => {
    const receipt = kotThermalReceipt(kotData);

    if (typeof window !== 'undefined' && window.AndroidPrinter?.printInvoice) {
      const result = window.AndroidPrinter.printInvoice(receipt);
    } else {
      reactPrint();
    }
  };

  const reactPrint = useReactToPrint({
    contentRef: kotComponentRef,
    documentTitle: `KOT-${kotData?.order_id}`,
  });

  const handleTransferOrder = (order) => {
    setSelectedRow(order);
    setTransferOpen(true);
  };
  const handleOrderInvoice = (order) => {
    setSelectedRow(order);
    setInvoiceOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    await DeleteData({
      auth,
      endPoint: 'table-orders',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
    setLoading(false);
  };

  if (!tables || !orders || !paymentMethods || !invoices) return <Loader />;

  // Calculate stats
  const totalTables = tables?.length || 0;
  const activeOrders =
    orders?.filter((order) => order.token_status === 'Open')?.length || 0;
  const totalOrders = orders?.length || 0;

  return (
    <>
      {/* Modern Header with Stats */}
      <Box
        sx={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ecf0f1',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: '#7f8c8d',
              },
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#7f8c8d',
                fontSize: '0.875rem',
                '&:hover': {
                  color: '#c20f12',
                },
              }}
            >
              Dashboard
            </Link>
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#2c3e50',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <RestaurantIcon sx={{ fontSize: 16 }} />
              Table Orders
            </Typography>
          </Breadcrumbs>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #ecf0f1',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: alpha('#3498db', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TableRestaurantIcon
                    sx={{ color: '#3498db', fontSize: 20 }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#2c3e50', fontWeight: 700 }}
                  >
                    {totalTables}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#7f8c8d', fontSize: '0.75rem' }}
                  >
                    Total Tables
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #ecf0f1',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: alpha('#c20f12', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RestaurantIcon sx={{ color: '#c20f12', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#2c3e50', fontWeight: 700 }}
                  >
                    {activeOrders}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#7f8c8d', fontSize: '0.75rem' }}
                  >
                    Active Orders
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #ecf0f1',
                backgroundColor: '#ffffff',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: alpha('#009905', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReceiptLongIcon sx={{ color: '#009905', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#2c3e50', fontWeight: 700 }}
                  >
                    {totalOrders}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#7f8c8d', fontSize: '0.75rem' }}
                  >
                    Total Orders
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #ecf0f1',
            height: '100%',
          }}
        >
          <TableGrid
            tables={tables}
            orders={orders}
            handleTransferOrder={handleTransferOrder}
            handleOrderInvoice={handleOrderInvoice}
            handleKOT={handleKOT}
            setKotDialogOpen={setKotDialogOpen}
            permissions={permissions}
          />
        </Paper>
        <Paper
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #ecf0f1',
            height: '100%',
          }}
        >
          <OrderTable
            orders={orders}
            setSelectedRow={setSelectedRow}
            setDeleteOpen={setDeleteOpen}
            permissions={permissions}
            myProfile={myProfile}
            invoices={invoices}
          />
        </Paper>
      </Box>
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        handleConfirmDelete={handleConfirmDelete}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        loading={loading}
      />

      {/* Create/Edit Dialog */}
      {/* <CreateNewOrder
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        editing={editing}
        formData={formData}
        setFormData={setFormData}
        tables={tables}
        menuItems={menuItems}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleSave={handleSave}
        loading={loading}
      /> */}

      {/* Transfer Dialog */}
      <TransferOrder
        auth={auth}
        transferOpen={transferOpen}
        setTransferOpen={setTransferOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        activeRooms={activeRooms}
        selectedBooking={selectedBooking}
        setSelectedBooking={setSelectedBooking}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        bookings={bookings}
      />

      {/* create Invoice */}
      <CreateOrderInvoice
        auth={auth}
        invoiceOpen={invoiceOpen}
        setInvoiceOpen={setInvoiceOpen}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        invoices={invoices}
        paymentMethods={paymentMethods}
      />

      {/* KOT Print (Hidden) */}
      <Box sx={{ display: 'none' }}>
        {kotData && (
          <KotPrint
            ref={kotComponentRef}
            order={kotData}
            profile={myProfile}
            size="58mm"
          />
        )}
      </Box>

      {/* KOT Print Dialog */}

      {kotData && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: kotOpen ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
          onClick={() => setKotOpen(false)}
        >
          <Paper
            sx={{
              backgroundColor: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center',
              maxWidth: 400,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
              KOT - {kotData?.order_id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#7f8c8d' }}>
              Table No: {kotData?.table?.table_no}
            </Typography>
            {printerList && printerList.length > 0 && (
              <>
                <FormControl fullWidth size="small" sx={{ mb: 5 }}>
                  <InputLabel>Select Printer</InputLabel>
                  <Select
                    size="small"
                    fullWidth
                    label="Select Printer"
                    value={selectedPrinter?.mac || ''}
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
            <Stack direction="row" spacing={2}>
              <Box
                component="button"
                onClick={() => setKotOpen(false)}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#2c3e50',
                  '&:hover': { backgroundColor: '#eeeeee' },
                }}
              >
                Close
              </Box>
              <Box
                component="button"
                onClick={handleKOTPrint}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 2,
                  backgroundColor: '#c20f12',
                  color: 'white',
                  border: 'none',
                  borderRadius: 1,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#a00c0f' },
                }}
              >
                Print KOT
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default Page;
