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
  Typography,
  Stack,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';

const OrderTable = ({ orders, handleEdit, setSelectedRow, setDeleteOpen }) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      Open: { label: 'Active', color: 'warning', bgColor: '#fff3e0' },
      Closed: { label: 'Closed', color: 'success', bgColor: '#e8f5e9' },
      Pending: { label: 'Pending', color: 'info', bgColor: '#e3f2fd' },
    };
    return (
      statusMap[status] || {
        label: status,
        color: 'default',
        bgColor: '#f5f5f5',
      }
    );
  };

  const handleDelete = (order) => {
    setSelectedRow(order);
    setDeleteOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}
        >
          📋 Order History
        </Typography>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Manage and track all table orders
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}
      >
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(135deg, #c20f12 0%, #e63946 100%)',
                '& .MuiTableCell-head': {
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '12px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  borderColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <TableCell align="center">Token ID</TableCell>
              <TableCell align="center">Table</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Payment Method</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                const totalAmount =
                  order.food_items?.reduce(
                    (sum, item) => sum + item.amount,
                    0,
                  ) || 0;
                const statusConfig = getStatusConfig(order.token_status);

                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                      '& .MuiTableCell-body': {
                        padding: '10px 8px',
                        fontSize: '0.85rem',
                      },
                      borderBottom: '1px solid #e8e8e8',
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 500 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: '#c20f12' }}
                      >
                        #{order?.order_id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {order?.table?.table_no || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          backgroundColor: statusConfig.bgColor,
                          borderColor:
                            statusConfig.color !== 'default'
                              ? statusConfig.color
                              : '#ddd',
                          border: '1px solid',
                        }}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="caption"
                        sx={{ color: '#666', fontWeight: 500 }}
                      >
                        {order.token_status === 'Closed' ? (
                          <>
                            {order.closing_method || '-'}
                            {(order?.room_booking?.booking_id ||
                              order?.restaurant_invoice?.invoice_no) && (
                              <Box
                                component="span"
                                sx={{
                                  display: 'block',
                                  fontSize: '0.7rem',
                                  color: '#c20f12',
                                }}
                              >
                                <Link
                                  href={
                                    order?.room_booking
                                      ? `/front-office/room-booking/${order.room_booking.documentId}`
                                      : `/restaurant/invoices/${order.restaurant_invoice.documentId}`
                                  }
                                  style={{
                                    color: '#c20f12',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                  }}
                                >
                                  {order?.room_booking?.booking_id ||
                                    order?.restaurant_invoice?.invoice_no}
                                </Link>
                              </Box>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: '#1976d2' }}
                    >
                      ₹{totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <IconButton
                          size="small"
                          color="info"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                          }}
                          onClick={() => handleEdit(order)}
                        >
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleEdit(order)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(243, 156, 18, 0.08)',
                            },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(order)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    📭 No orders found. Create a new order to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderTable;
