'use client';

import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
} from '@mui/material';
import { Home, ShoppingBag, UtensilsCrossed, Trash2 } from 'lucide-react';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';

export default function BillingSummaryCard({ booking }) {
  const { auth } = useAuth();
  const roomTokens = booking?.room_tokens || [];
  const services = booking?.service_tokens || [];
  const foodItems = booking?.food_tokens || [];

  // ---- Summary calculations ----
  const totalRoomAmount = roomTokens.reduce(
    (sum, r) => sum + (parseFloat(r.total_amount) || r.amount || 0),
    0,
  );
  const totalServiceAmount = services.reduce(
    (sum, s) => sum + (parseFloat(s.total_amount) || 0),
    0,
  );
  const totalFoodAmount = foodItems.reduce(
    (sum, f) => sum + (parseFloat(f.total_amount) || 0),
    0,
  );
  const grandTotal = totalRoomAmount + totalServiceAmount + totalFoodAmount;

  const deleteServices = async (id) => {
    const filteredServices = services.filter((_, index) => index !== id);
    try {
      const res = await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { service_tokens: filteredServices } },
      });
      SuccessToast('Service deleted successfully');
    } catch (err) {
      console.log(err);
      ErrorToast('Failed to delete service');
    }
  };

  const deleteFoodItems = async ({ id, orderId }) => {
    const filteredFoodItems = foodItems.filter((_, index) => index !== id);
    try {
      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: orderId,
        payload: {
          data: {
            closing_method: 'Room Transfer',
            token_status: 'Open',
            room_no: '',
            room_booking: null,
          },
        },
      });
      await UpdateData({
        endPoint: 'room-bookings',
        auth,
        id: booking?.documentId,
        payload: { data: { food_tokens: filteredFoodItems } },
      });

      SuccessToast('Food item deleted successfully');
    } catch (err) {
      console.log(err);
      ErrorToast('Failed to delete food item');
    }
  };

  const Section = ({ icon: Icon, title, children }) => (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color: '#c20f12' }}>
          <Icon size={20} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#1a1a1a',
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Box>{children}</Box>
    </Box>
  );

  const SummaryBox = ({ label, amount, bgColor }) => (
    <Box sx={{ backgroundColor: bgColor, p: 2, borderRadius: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: '#666',
          fontWeight: 600,
          mb: 0.5,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          color: '#1a1a1a',
          fontSize: '1.125rem',
        }}
      >
        ₹ {amount.toFixed(2)}
      </Typography>
    </Box>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1.5,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        mb: 3,
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          p: 2.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: '0.938rem',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Billing Summary
        </Typography>
      </Box>

      {/* Summary Boxes */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryBox
              label="Room Charges"
              amount={totalRoomAmount}
              bgColor="#f0f7ff"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryBox
              label="Services"
              amount={totalServiceAmount}
              bgColor="#fff5f7"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryBox
              label="Food Items"
              amount={totalFoodAmount}
              bgColor="#f5fff7"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                backgroundColor: '#c20f12',
                color: '#fff',
                p: 2,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  opacity: 0.9,
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Grand Total
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                }}
              >
                ₹ {grandTotal.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Room Tokens Section */}
      <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Section icon={Home} title="Room Charges">
          {roomTokens.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: '#666', fontStyle: 'italic' }}
            >
              No room charges
            </Typography>
          ) : (
            <Paper
              sx={{
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Room No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Items
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      SGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      CGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Total (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roomTokens.map((room, index) => {
                    const rate = room.rate * room.days;
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {room.room || room.room_no}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {room.item}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat((room.amount - rate) / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(room.amount || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Section>
      </Box>

      {/* Services Section */}
      <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Section icon={ShoppingBag} title="Services">
          {services.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: '#666', fontStyle: 'italic' }}
            >
              No service charges
            </Typography>
          ) : (
            <Paper
              sx={{
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Room No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Items
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      SGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      CGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Total (₹)
                    </TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service, index) => {
                    const itemsString =
                      service.items?.map((i) => i.item).join(', ') || '—';
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {service.room_no}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {itemsString}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(service.total_gst / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(service.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            disabled={service?.invoice}
                            size="small"
                            color="error"
                            onClick={() => deleteServices(index)}
                            sx={{ padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Section>
      </Box>

      {/* Food Items Section */}
      <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Section icon={UtensilsCrossed} title="Food Items">
          {foodItems.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: '#666', fontStyle: 'italic' }}
            >
              No food items
            </Typography>
          ) : (
            <Paper
              sx={{
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Room No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                      Items
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      SGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      CGST (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, fontSize: '0.813rem' }}
                    >
                      Total (₹)
                    </TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {foodItems.map((food, index) => {
                    const itemsString =
                      food.items?.map((i) => i.item).join(', ') || '—';
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {food.room_no}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.813rem' }}>
                          {itemsString}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(food.total_gst / 2 || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.813rem' }}>
                          {parseFloat(food.total_amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            disabled={food?.invoice}
                            size="small"
                            color="error"
                            onClick={() =>
                              deleteFoodItems({
                                id: index,
                                orderId: food.orderId,
                              })
                            }
                            sx={{ padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Section>
      </Box>
    </Paper>
  );
}
