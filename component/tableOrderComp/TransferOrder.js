import { UpdateData } from '@/utils/ApiFunctions';
import { SuccessToast, ErrorToast } from '@/utils/GenerateToast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const TransferOrder = ({
  auth,
  transferOpen,
  setTransferOpen,
  selectedRow,
  setSelectedRow,
  activeRooms,
  selectedBooking,
  setSelectedBooking,
  selectedRoom,
  setSelectedRoom,
  bookings,
}) => {
  const handleConfirmTransfer = async () => {
    if (!selectedRow || !selectedBooking || !selectedRoom) return;
    const booking = bookings?.find((b) => {
      return b.documentId === selectedBooking;
    });

    try {
      await UpdateData({
        auth,
        endPoint: 'table-orders',
        id: selectedRow.documentId,
        payload: {
          data: {
            closing_method: 'Room Transfer',
            token_status: 'Closed',
            room_no: selectedRoom,
            room_booking: selectedBooking,
          },
        },
      });

      const total_rate = selectedRow.food_items.reduce(
        (acc, item) => acc + item.rate * item.qty,
        0,
      );

      // recalc before save

      const total_amount = selectedRow.food_items.reduce(
        (acc, item) => acc + item.amount,
        0,
      );

      const total_gst = total_amount - total_rate;

      // ✅ Clean menu_items (remove id/documentId/etc.)
      const cleanedMenuItems = selectedRow.food_items.map(
        ({ id, documentId, room, ...rest }) => rest,
      );
      const prevFood = booking?.food_tokens || [];
      await UpdateData({
        auth,
        endPoint: 'room-bookings',
        id: selectedBooking,
        payload: {
          data: {
            food_tokens: [
              ...prevFood,
              {
                id: new Date().getTime().toString(36),
                room_no: selectedRoom,
                type: 'Room Transfer',
                orderId: selectedRow.documentId,
                total_gst: parseFloat(total_gst).toFixed(2) || 0,
                total_amount: parseFloat(total_amount).toFixed(2) || 0,
                invoice: false,
                items: cleanedMenuItems,
              },
            ],
          },
        },
      });
      SuccessToast('Order transferred successfully');
      setTransferOpen(false);
      setSelectedRow(null);
      setSelectedBooking(null);
      setSelectedRoom('');
    } catch (err) {
      console.error('Error transferring order:', err);
      ErrorToast('Failed to transfer order. Please try again.');
      return;
    }
  };

  return (
    <Dialog
      open={transferOpen}
      onClose={() => {
        setTransferOpen(false);
        setSelectedRow(null);
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 2,
        }}
      >
        <SwapHorizIcon sx={{ fontSize: '1.3rem' }} />
        Transfer Order to Room
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {/* Order Info */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1, color: '#333' }}
          >
            📋 Current Order
          </Typography>
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#999', display: 'block', mb: 0.3 }}
            >
              Table & Order ID
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#333' }}>
              Table {selectedRow?.table?.table_no || 'N/A'} • Order #
              {selectedRow?.order_id || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Room Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, mb: 1.5, color: '#333' }}
          >
            🛏️ Select Guest Room
          </Typography>

          {activeRooms?.length > 0 ? (
            <TextField
              select
              margin="dense"
              label="Room Number"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
                selectedBooking && selectedRoom
                  ? `${selectedBooking}|${selectedRoom}`
                  : ''
              }
              onChange={(e) => {
                const [booking_id, roomNo] = e.target.value.split('|');
                setSelectedBooking(booking_id);
                setSelectedRoom(roomNo);
              }}
              SelectProps={{ native: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            >
              <option value="">-- Select Room --</option>
              {activeRooms?.map((room, index) => (
                <option
                  key={`${room.booking_id}-${room.room_no}-${index}`}
                  value={`${room.booking_id}|${room.room_no}`}
                >
                  Room {room.room_no}
                </option>
              ))}
            </TextField>
          ) : (
            <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
              No active rooms available for transfer
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        {selectedRow?.food_items && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1, color: '#333' }}
            >
              🍽️ Order Summary
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f9f9f9',
                p: 1,
                borderRadius: 1.5,
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#666', display: 'block', mb: 0.3 }}
              >
                Items: {selectedRow.food_items.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#c20f12', fontWeight: 700 }}
              >
                Total: ₹
                {selectedRow.food_items
                  .reduce((acc, item) => acc + item.amount, 0)
                  .toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button
          onClick={() => {
            setTransferOpen(false);
            setSelectedRow(null);
            setSelectedBooking(null);
            setSelectedRoom('');
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
          onClick={handleConfirmTransfer}
          variant="contained"
          color="warning"
          disabled={!selectedBooking || !selectedRoom}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3,
          }}
        >
          🔄 Transfer Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferOrder;
