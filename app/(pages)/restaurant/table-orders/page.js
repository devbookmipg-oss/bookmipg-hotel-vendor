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
} from '@/utils/ApiFunctions';
import { useAuth } from '@/context';
import { Loader } from '@/component/common';
import { useState, useRef } from 'react';
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
import { Print } from '@mui/icons-material';

const generateNextOrderNo = (orders) => {
  if (!orders || orders.length === 0) {
    return 'ODR-1';
  }

  const numbers = orders
    .map((inv) => parseInt(inv.order_id?.replace('ODR-', ''), 10))
    .filter((n) => !isNaN(n));

  const maxNumber = Math.max(...numbers);

  return `ODR-${maxNumber + 1}`;
};

const Page = () => {
  const { auth } = useAuth();
  const todaysDate = GetTodaysDate().dateString;
  const tables = GetDataList({ auth, endPoint: 'tables' });
  const orders = GetDataList({ auth, endPoint: 'table-orders' });
  const menuItems = GetDataList({
    auth,
    endPoint: 'restaurant-menus',
  });
  console.log('menuItems', menuItems);
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

  // Create/Edit dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    food_items: [],
    notes: '',
    hotel_id: auth?.user?.hotel_id || '',
  });
  const [editing, setEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState();

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

  // Get restaurant profile
  const profile = GetDataList({
    auth,
    endPoint: 'restaurant-profiles',
  });
  const myProfile = profile?.[0];

  const handleKOT = (order) => {
    setKotData(order);
    setKotOpen(true);
  };

  const handleKOTPrint = useReactToPrint({
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

  // handle edit
  const handleEdit = (order) => {
    setEditing(true);
    setFormData({ ...order, table: order.table?.documentId });
    setFormOpen(true);
  };

  // handle create
  const handleCreate = (tableId) => {
    setEditing(false);
    setFormData({
      food_items: [],
      notes: '',
      hotel_id: auth?.user?.hotel_id || '',
      table: tableId,
      token_status: 'Open',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    // ✅ Clean food_items (remove id/documentId/etc.)
    const cleanedMenuItems = formData.food_items.map(
      ({ id, documentId, ...rest }) => rest,
    );

    const finalData = {
      ...formData,
      food_items: cleanedMenuItems,
    };

    if (editing) {
      const {
        id,
        documentId,
        publishedAt,
        updatedAt,
        createdAt,
        ...updateBody
      } = finalData;

      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: formData.documentId, // ✅ only for URL
        payload: { data: updateBody },
      });
      SuccessToast('Order updated successfully');
    } else {
      const newOrderNO = generateNextOrderNo(orders);
      const time = GetCurrentTime();
      await CreateNewData({
        auth,
        endPoint: 'table-orders',
        payload: {
          data: {
            ...finalData,
            order_id: newOrderNO,
            date: todaysDate,
            time: time,
          },
        },
      });
      SuccessToast('Order created successfully');
    }

    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    await DeleteData({
      auth,
      endPoint: 'table-orders',
      id: selectedRow.documentId,
    });
    SuccessToast('Invoice deleted successfully');
    setDeleteOpen(false);
    setSelectedRow(null);
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
            handleCreate={handleCreate}
            handleTransferOrder={handleTransferOrder}
            handleOrderInvoice={handleOrderInvoice}
            handleEdit={handleEdit}
            handleKOT={handleKOT}
            setKotDialogOpen={setKotDialogOpen}
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
            handleEdit={handleEdit}
            setSelectedRow={setSelectedRow}
            setDeleteOpen={setDeleteOpen}
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
      />

      {/* Create/Edit Dialog */}
      <CreateNewOrder
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
      />

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

      <Dialog
        open={kotDialogOpen}
        onClose={() => setKotDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            '@media (max-width: 600px)': {
              width: '100%',
              height: '110vh',
              maxWidth: '100%',
              margin: 0,
              borderRadius: 0,
            },
          },
        }}
      >
        <DialogContent sx={{ padding: '0 5px', margin: 0 }}>
          {kotData && (
            <>
              <p>
                <strong>Table No:</strong> {kotData?.table?.table_no}
              </p>
              <p>
                <strong>Date:</strong> {GetCustomDate(kotData?.date)} |{' '}
                <strong>Time:</strong> {kotData?.time}
              </p>
              <p>
                <strong>Order ID:</strong> {kotData?.order_id}
              </p>
              <p style={{ margin: '1px 0' }}>------------------------------</p>

              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th align="left">Item</th>
                    <th align="right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {kotData?.food_items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td align="right">
                        <strong>{item.qty}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: '1px 0' }}>------------------------------</p>
              {kotData?.notes && (
                <>
                  <p style={{ fontSize: '10px' }}>Notes:</p>
                  <p style={{ fontSize: '10px' }}>{kotData?.notes || '-'}</p>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKotDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handleKOTPrint}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Page;
