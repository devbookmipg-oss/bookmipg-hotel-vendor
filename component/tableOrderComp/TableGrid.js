import { Box, Button, Grid, Card, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptIcon from '@mui/icons-material/Receipt';

const TableGrid = ({
  tables,
  orders,
  handleCreate,
  handleEdit,
  handleTransferOrder,
  handleOrderInvoice,
}) => {
  const StatusBadge = ({ isAvailable }) => (
    <Box
      sx={{
        px: 1.2,
        py: 0.4,
        borderRadius: 1,
        backgroundColor: isAvailable ? '#e3f2fd' : '#f3e5f5',
        border: `1px solid ${isAvailable ? '#90caf9' : '#ce93d8'}`,
        display: 'inline-block',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: isAvailable ? '#1976d2' : '#7b1fa2',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.3px',
        }}
      >
        {isAvailable ? '✓ Available' : '🔴 Active'}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#666', mb: 1.5 }}
        >
          🪑 Table Management
        </Typography>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Click on a table to create or manage orders
        </Typography>
      </Box>

      <Box
        sx={{
          height: { xs: 'auto', md: 'calc(100vh - 280px)' },
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': { backgroundColor: '#eeeeee' },
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
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={table.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #e8e8e8',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                    background: isAvailable
                      ? 'linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)'
                      : 'linear-gradient(135deg, #f0f5ff 0%, #e8f0ff 100%)',
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      background: isAvailable
                        ? 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)'
                        : 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
                      color: '#fff',
                      p: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.8rem',
                        letterSpacing: 1,
                      }}
                    >
                      {table.table_no}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.9, display: 'block', mt: 0.3 }}
                    >
                      Table
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box
                    sx={{
                      p: 1.5,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      <StatusBadge isAvailable={isAvailable} />
                    </Box>

                    {isAvailable ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleCreate(table.documentId)}
                        sx={{
                          mt: 'auto',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 1.5,
                          py: 1,
                          fontSize: '0.9rem',
                        }}
                      >
                        New Order
                      </Button>
                    ) : (
                      <Stack spacing={1} sx={{ mt: 'auto' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(activeOrder)}
                          sx={{
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            py: 0.8,
                            fontSize: '0.85rem',
                          }}
                        >
                          Edit
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            startIcon={
                              <SwapHorizIcon sx={{ fontSize: '1rem' }} />
                            }
                            onClick={() => handleTransferOrder(activeOrder)}
                            sx={{
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 1.5,
                              py: 0.8,
                              fontSize: '0.75rem',
                            }}
                          >
                            Move
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={
                              <ReceiptIcon sx={{ fontSize: '1rem' }} />
                            }
                            onClick={() => handleOrderInvoice(activeOrder)}
                            sx={{
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 1.5,
                              py: 0.8,
                              fontSize: '0.75rem',
                            }}
                          >
                            Invoice
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default TableGrid;
