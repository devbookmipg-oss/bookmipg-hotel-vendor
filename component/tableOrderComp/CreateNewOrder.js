'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Divider,
  Zoom,
  Fade,
  Badge,
  alpha,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Slide,
} from '@mui/material';

import { forwardRef } from 'react';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import NoteIcon from '@mui/icons-material/Note';

import { useState, useMemo } from 'react';

// Transition for dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateNewOrder = ({
  formOpen,
  setFormOpen,
  editing,
  formData,
  setFormData,
  tables,
  menuItems,
  handleSave,
  loading,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [
      'all',
      ...new Set(menuItems?.map((item) => item.category || 'Uncategorized')),
    ];
    return cats;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    let filtered = menuItems || [];

    // Filter by search
    if (search) {
      filtered = filtered.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (item) => (item.category || 'Uncategorized') === activeCategory,
      );
    }

    return filtered;
  }, [search, menuItems, activeCategory]);

  const getQty = (item) => {
    const found = formData.food_items.find((f) => f.item === item.name);
    return found ? found.qty : 0;
  };

  const increaseQty = (item) => {
    const exists = formData.food_items.find((f) => f.item === item.name);

    if (exists) {
      const updated = formData.food_items.map((f) =>
        f.item === item.name
          ? {
              ...f,
              qty: f.qty + 1,
              amount: (f.qty + 1) * f.rate * (1 + f.gst / 100),
            }
          : f,
      );

      setFormData({ ...formData, food_items: updated });
    } else {
      const rate = parseFloat(item.rate) || 0;
      const gst = parseFloat(item.gst) || 0;

      const newItem = {
        item: item.name,
        hsn: item.hsn || '',
        rate,
        qty: 1,
        gst,
        amount: rate * (1 + gst / 100),
      };

      setFormData({
        ...formData,
        food_items: [...formData.food_items, newItem],
      });
    }
  };

  const decreaseQty = (item) => {
    const exists = formData.food_items.find((f) => f.item === item.name);
    if (!exists) return;

    if (exists.qty === 1) {
      const updated = formData.food_items.filter((f) => f.item !== item.name);
      setFormData({ ...formData, food_items: updated });
    } else {
      const updated = formData.food_items.map((f) =>
        f.item === item.name
          ? {
              ...f,
              qty: f.qty - 1,
              amount: (f.qty - 1) * f.rate * (1 + f.gst / 100),
            }
          : f,
      );

      setFormData({ ...formData, food_items: updated });
    }
  };

  const removeItem = (item) => {
    const updated = formData.food_items.filter((f) => f.item !== item.name);
    setFormData({ ...formData, food_items: updated });
  };

  const summary = useMemo(() => {
    const total = formData.food_items.reduce(
      (acc, cur) => acc + cur.rate * cur.qty,
      0,
    );

    const tax = formData.food_items.reduce(
      (acc, cur) => acc + (cur.rate * cur.qty * cur.gst) / 100,
      0,
    );

    return {
      total,
      tax,
      payable: total + tax,
    };
  }, [formData.food_items]);

  // Get color based on item name (for avatar)
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <Dialog
      open={formOpen}
      fullScreen
      TransitionComponent={Transition}
      sx={{
        borderRadius: 0,
        '& .MuiDialog-paper': {
          background: 'linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%)',
        },
      }}
    >
      {/* Custom Header with Gradient */}
      <Paper
        elevation={0}
        sx={{
          color: 'white',
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <DialogTitle>
          {editing ? '✎ Edit Order' : '✨ Create New Order'}
        </DialogTitle>
      </Paper>

      <DialogContent sx={{ p: 3 }}>
        {/* TOP SECTION - Modern Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                color: 'white',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TableRestaurantIcon sx={{ fontSize: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Table Number
                </Typography>
                <FormControl
                  fullWidth
                  variant="standard"
                  sx={{ minWidth: 120 }}
                >
                  <Select
                    value={formData.table || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, table: e.target.value })
                    }
                    sx={{
                      color: 'white',
                      '& .MuiSelect-icon': { color: 'white' },
                      '&:before': { borderBottomColor: alpha('#fff', 0.5) },
                      '&:after': { borderBottomColor: 'white' },
                    }}
                  >
                    {tables?.map((table) => (
                      <MenuItem key={table.documentId} value={table.documentId}>
                        {table.table_no}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <NoteIcon sx={{ fontSize: 40 }} />
              <TextField
                label="Special Notes"
                fullWidth
                variant="standard"
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                sx={{
                  '& .MuiInputLabel-root': { color: alpha('#fff', 0.9) },
                  '& .MuiInputBase-root': { color: 'white' },
                  '& .MuiInput-underline:before': {
                    borderBottomColor: alpha('#fff', 0.5),
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: 'white' },
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* SEARCH AND CATEGORIES */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: 'white',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
              },
            }}
          />

          {/* Category Chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setActiveCategory(category)}
                icon={
                  category === 'all' ? (
                    <RestaurantIcon
                      sx={{
                        color: activeCategory === category ? 'white' : '#666',
                      }}
                    />
                  ) : (
                    <LocalOfferIcon
                      sx={{
                        color: activeCategory === category ? 'white' : '#666',
                      }}
                    />
                  )
                }
                sx={{
                  bgcolor: activeCategory === category ? '#667eea' : 'white',
                  color: activeCategory === category ? 'white' : '#666',
                  '&:hover': {
                    bgcolor:
                      activeCategory === category
                        ? '#764ba2'
                        : alpha('#667eea', 0.1),
                  },
                  transition: 'all 0.2s',
                  fontWeight: 500,
                  px: 1,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* PRODUCT GRID - Modern Cards */}
        <Grid container spacing={2}>
          {filteredItems?.map((item, index) => {
            const qty = getQty(item);
            const bgColor = stringToColor(item.name);

            return (
              <Grid
                size={{ xs: 12, xs: 6, sm: 4, md: 3, lg: 2 }}
                key={item.documentId}
              >
                <Fade in timeout={300 + index * 50}>
                  <Paper
                    elevation={qty > 0 ? 6 : 2}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: qty > 0 ? 'scale(1.02)' : 'scale(1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                      },
                      position: 'relative',
                    }}
                  >
                    {qty > 0 && (
                      <Badge
                        badgeContent={qty}
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          top: 18,
                          right: 18,
                          zIndex: 1,
                          '& .MuiBadge-badge': {
                            fontSize: '0.8rem',
                            minWidth: 24,
                            height: 24,
                            borderRadius: '12px',
                          },
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        height: 100,
                        background: `#cecece`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'white',
                          color: bgColor,
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Typography fontWeight={600} noWrap>
                        {item.name}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: '#667eea',
                            fontSize: '1.1rem',
                          }}
                        >
                          ₹{item.rate}
                        </Typography>
                        {item.gst > 0 && (
                          <Chip
                            label={`${item.gst}% GST`}
                            size="small"
                            sx={{
                              bgcolor: alpha('#4caf50', 0.1),
                              color: '#4caf50',
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 2,
                          bgcolor: alpha('#667eea', 0.05),
                          borderRadius: 2,
                          p: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => decreaseQty(item)}
                          sx={{
                            bgcolor: qty > 0 ? '#667eea' : 'transparent',
                            color: qty > 0 ? 'white' : '#667eea',
                            '&:hover': { bgcolor: '#764ba2', color: 'white' },
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Typography
                          fontWeight={700}
                          sx={{ minWidth: 24, textAlign: 'center' }}
                        >
                          {qty}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => increaseQty(item)}
                          sx={{
                            bgcolor: '#667eea',
                            color: 'white',
                            '&:hover': { bgcolor: '#764ba2' },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>

                        {qty > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item)}
                            sx={{
                              color: '#ff6b6b',
                              '&:hover': { bgcolor: alpha('#ff6b6b', 0.1) },
                              ml: 0.5,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* SUMMARY - Modern Glassmorphism Card */}
      </DialogContent>

      <DialogActions
        sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #eee' }}
      >
        <Button size="small" onClick={() => setFormOpen(false)}>
          Close
        </Button>
        <Button
          size="small"
          onClick={handleSave}
          disabled={loading}
          variant="contained"
          color="success"
        >
          {loading
            ? 'Processing...'
            : editing
              ? '✎ Update Order'
              : '✨ Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNewOrder;
