import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const DeleteDialog = ({
  deleteOpen,
  setDeleteOpen,
  selectedRow,
  setSelectedRow,
  handleConfirmDelete,
}) => {
  return (
    <Dialog
      open={deleteOpen}
      onClose={() => {
        setDeleteOpen(false);
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
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 2,
        }}
      >
        <WarningIcon sx={{ fontSize: '1.3rem' }} />
        Delete Order
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 2,
            backgroundColor: '#fff3cd',
            borderLeft: '4px solid #f39c12',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          This action cannot be undone
        </Alert>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Are you sure you want to delete this order?
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
              sx={{ color: '#999', display: 'block', mb: 0.5 }}
            >
              Order ID:
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#c20f12' }}
            >
              #{selectedRow?.order_id || 'N/A'} - Table{' '}
              {selectedRow?.table?.table_no || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
        <Button
          onClick={() => {
            setDeleteOpen(false);
            setSelectedRow(null);
          }}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
          }}
        >
          Keep Order
        </Button>
        <Button
          onClick={handleConfirmDelete}
          color="error"
          variant="contained"
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3,
          }}
        >
          🗑️ Delete Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
