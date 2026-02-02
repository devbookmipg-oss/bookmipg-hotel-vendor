import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Chip,
  alpha,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';

const TableGrid = ({
  tables,
  orders,
  handleCreate,
  handleEdit,
  handleTransferOrder,
  handleOrderInvoice,
  handleKOT,
}) => {
  return (
    <>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TableRestaurantIcon sx={{ color: '#c20f12' }} />
        Tables Status
      </Typography>

      <Box
        sx={{
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha('#c20f12', 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha('#c20f12', 0.5),
            },
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha('#ecf0f1', 0.5),
            borderRadius: '4px',
          },
        }}
      >
        <Grid container spacing={2}>
          {tables?.map((table) => {
            const activeOrder = orders?.find(
              (o) =>
                o.table?.table_no == table.table_no &&
                o.token_status === 'Open',
            );
            const isAvailable = !activeOrder;

            return (
              <Grid
                size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                sx={{ mt: 2 }}
                key={table.id}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    background: isAvailable
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                      : 'linear-gradient(135deg, #fff3e0 0%, #ffebee 100%)',
                    color: isAvailable ? '#2c3e50' : '#c20f12',
                    borderRadius: 3,
                    border: isAvailable
                      ? '2px solid #ecf0f1'
                      : '2px solid #ffcdd2',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(194, 15, 18, 0.1)',
                      borderColor: isAvailable ? '#3498db' : '#c20f12',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: isAvailable ? '#3498db' : '#c20f12',
                      borderRadius: '3px 3px 0 0',
                    },
                  }}
                  onClick={
                    isAvailable
                      ? () => handleCreate(table.documentId)
                      : undefined
                  }
                >
                  {/* Status Badge */}
                  <Chip
                    label={isAvailable ? 'AVL' : 'OCC'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      height: '20px',
                      backgroundColor: isAvailable
                        ? alpha('#009905', 0.15)
                        : alpha('#c20f12', 0.15),
                      color: isAvailable ? '#009905' : '#c20f12',
                      border: `1px solid ${isAvailable ? alpha('#009905', 0.3) : alpha('#c20f12', 0.3)}`,
                    }}
                  />

                  {/* Table Icon & Number */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isAvailable
                          ? alpha('#3498db', 0.1)
                          : alpha('#c20f12', 0.1),
                        border: `2px solid ${isAvailable ? '#3498db' : '#c20f12'}`,
                        mb: 1,
                        mx: 'auto',
                      }}
                    >
                      <RestaurantIcon
                        sx={{
                          fontSize: 20,
                          color: isAvailable ? '#3498db' : '#c20f12',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,

                        background: isAvailable
                          ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                          : 'linear-gradient(135deg, #c20f12 0%, #a00c0f 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {table.table_no}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isAvailable ? '#7f8c8d' : '#e74c3c',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {isAvailable
                        ? 'Ready for booking'
                        : `Order #${activeOrder?.order_id}`}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ width: '100%' }}>
                    {isAvailable ? (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={() => handleCreate(table.documentId)}
                        sx={{
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          backgroundColor: '#009905',
                          '&:hover': {
                            backgroundColor: '#008005',
                            transform: 'scale(1.02)',
                          },
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(0, 153, 5, 0.3)',
                        }}
                      >
                        Create Order
                      </Button>
                    ) : (
                      <Stack spacing={0.5} width="100%">
                        {/* Action Buttons Grid */}
                        <Grid container spacing={1}>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleEdit(activeOrder)}
                              sx={{
                                py: 0.75,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: '#3498db',
                                '&:hover': {
                                  backgroundColor: '#2980b9',
                                },
                              }}
                            >
                              Edit
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={
                                <LocalPrintshopIcon sx={{ fontSize: 14 }} />
                              }
                              onClick={() => handleKOT(activeOrder)}
                              sx={{
                                py: 0.75,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: '#9e007e',
                                '&:hover': {
                                  backgroundColor: '#7d0064',
                                },
                              }}
                            >
                              KOT
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={
                                <SwapHorizIcon sx={{ fontSize: 14 }} />
                              }
                              onClick={() => handleTransferOrder(activeOrder)}
                              sx={{
                                py: 0.75,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: '#f39c12',
                                '&:hover': {
                                  backgroundColor: '#d68910',
                                },
                              }}
                            >
                              Transfer
                            </Button>
                          </Grid>
                          <Grid size={6}>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<ReceiptIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleOrderInvoice(activeOrder)}
                              sx={{
                                py: 0.75,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: '#c20f12',
                                '&:hover': {
                                  backgroundColor: '#a00c0f',
                                },
                              }}
                            >
                              Invoice
                            </Button>
                          </Grid>
                        </Grid>
                      </Stack>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

export default TableGrid;
