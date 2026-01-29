'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Stack,
  useTheme,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/MeetingRoom';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeleteIcon from '@mui/icons-material/Delete';
import { ErrorToast, SuccessToast } from '@/utils/GenerateToast';
import { UpdateData } from '@/utils/ApiFunctions';
import { useAuth } from '@/context';

export default function BillingSummaryCard({ booking }) {
  const theme = useTheme();
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
      await UpdateData({
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

  const SummaryCard = ({ icon: Icon, label, amount, bgColor, borderColor }) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
        border: `2px solid ${bgColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${bgColor}30`,
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 1,
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Icon sx={{ fontSize: '1.5rem' }} />
      </Box>
      <Stack spacing={0.3} flex={1}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          ₹{parseFloat(amount).toFixed(2)}
        </Typography>
      </Stack>
    </Box>
  );

  const TokenTable = ({
    title,
    icon: Icon,
    tokens,
    bgColor,
    onDelete,
    isDeletable = false,
  }) => {
    if (tokens.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2, ml: 0.5 }}
        >
          <Box sx={{ color: bgColor }}>
            <Icon sx={{ fontSize: '1.4rem' }} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, letterSpacing: '0.3px' }}
          >
            {title} ({tokens.length})
          </Typography>
        </Stack>

        <Paper
          sx={{
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${bgColor}30`,
            boxShadow: 'none',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: `${bgColor}10`,
                  '& .MuiTableCell-head': {
                    borderColor: `${bgColor}20`,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: bgColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  },
                }}
              >
                <TableCell>Item</TableCell>
                <TableCell align="right">Qty/Days</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">Total (₹)</TableCell>
                {isDeletable && (
                  <TableCell align="center" sx={{ width: '60px' }}>
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tokens.map((token, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${bgColor}08`,
                    },
                    '& .MuiTableCell-body': {
                      borderColor: `${bgColor}10`,
                      fontSize: '0.8125rem',
                      py: 1,
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {token.item || token.service_name || token.room || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {token.days || token.qty || '—'}
                  </TableCell>
                  <TableCell align="right">
                    ₹{parseFloat(token.rate || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ₹
                    {parseFloat(
                      token.total_amount || token.amount || 0,
                    ).toFixed(2)}
                  </TableCell>
                  {isDeletable && (
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDelete(index, token?.order_id)}
                        sx={{ padding: '4px' }}
                      >
                        <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    );
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: '#fff',
          p: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ fontSize: '1.4rem' }}>💰</Box>
          <Stack spacing={0.3} flex={1}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: '1.1rem' }}
            >
              Billing Summary
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Complete breakdown of room, services & food charges
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <CardContent>
        {/* Summary Cards Grid */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              icon={RoomIcon}
              label="Room Charges"
              amount={totalRoomAmount}
              bgColor="#3498db"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              icon={LocalMallIcon}
              label="Services"
              amount={totalServiceAmount}
              bgColor="#e74c3c"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              icon={RestaurantIcon}
              label="Food & Beverage"
              amount={totalFoodAmount}
              bgColor="#27ae60"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              icon={() => <Box sx={{ fontSize: '1.5rem' }}>💳</Box>}
              label="Grand Total"
              amount={grandTotal}
              bgColor="#c20f12"
            />
          </Grid>
        </Grid>

        {/* Divider */}
        <Box
          sx={{
            height: '1px',
            background:
              'linear-gradient(to right, transparent, #ddd, transparent)',
            my: 3,
          }}
        />

        {/* Token Tables */}
        <Box>
          <TokenTable
            title="Room Charges"
            icon={RoomIcon}
            tokens={roomTokens}
            bgColor="#3498db"
            isDeletable={false}
          />

          <TokenTable
            title="Additional Services"
            icon={LocalMallIcon}
            tokens={services}
            bgColor="#e74c3c"
            onDelete={deleteServices}
            isDeletable={true}
          />

          <TokenTable
            title="Food & Beverages"
            icon={RestaurantIcon}
            tokens={foodItems}
            bgColor="#27ae60"
            onDelete={deleteFoodItems}
            isDeletable={true}
          />

          {roomTokens.length === 0 &&
            services.length === 0 &&
            foodItems.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px dashed #ddd',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No charges added yet. Start by adding room, service, or food
                  items.
                </Typography>
              </Box>
            )}
        </Box>
      </CardContent>
    </Card>
  );
}
