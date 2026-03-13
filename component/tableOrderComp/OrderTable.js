import {
  Box,
  Chip,
  IconButton,
  Paper,
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
import Link from 'next/link';

const OrderTable = ({ orders, setSelectedRow, setDeleteOpen, permissions }) => {
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
                    <Chip
                      sx={{
                        fontSize: 10,
                      }}
                      label={order.token_status}
                      color={
                        order.token_status === 'Closed'
                          ? 'secondary'
                          : order.token_status === 'Open'
                            ? 'success'
                            : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.token_status === 'Closed' && (
                      <>
                        {order.closing_method || '-'}&nbsp;
                        {(order?.room_booking?.booking_id ||
                          order?.restaurant_invoice?.invoice_no) && (
                          <Link
                            href={
                              order?.room_booking
                                ? `/front-office/room-booking/${order.room_booking.documentId}`
                                : `/restaurant/invoices`
                            }
                            style={{
                              fontSize: 10,
                              color: 'blue',
                              textDecoration: 'none',
                            }}
                          >
                            (
                            {order?.room_booking?.booking_id ||
                              order?.restaurant_invoice?.invoice_no}
                            )
                          </Link>
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>₹{totalAmount.toFixed(2) || 0}</TableCell>
                  <TableCell align="center">
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
    </>
  );
};

export default OrderTable;
