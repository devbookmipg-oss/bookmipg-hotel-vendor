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
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  forwardRef,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';

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
import NoteIcon from '@mui/icons-material/Note';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Transition for dialog
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Memoized Product Card Component
const ProductCard = memo(
  ({ item, qty, onIncrease, onDecrease, onRemove, bgColor }) => {
    return (
      <Paper
        elevation={qty > 0 ? 4 : 1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          transform: qty > 0 ? 'scale(1.01)' : 'scale(1)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.2)',
          },
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {qty > 0 && (
          <Badge
            badgeContent={qty}
            color="secondary"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                minWidth: 20,
                height: 20,
                borderRadius: '10px',
              },
            }}
          />
        )}

        <Box
          sx={{
            height: 80,
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 45,
              height: 45,
              bgcolor: 'white',
              color: bgColor,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {item.name.charAt(0)}
          </Avatar>
        </Box>

        <CardContent
          sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.5 }}>
            {item.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Typography
              sx={{ fontWeight: 700, color: '#667eea', fontSize: '0.95rem' }}
            >
              ₹{item.rate}
            </Typography>
            {item.gst > 0 && (
              <Chip
                label={`${item.gst}%`}
                size="small"
                sx={{
                  bgcolor: alpha('#4caf50', 0.1),
                  color: '#4caf50',
                  height: 16,
                  fontSize: '0.6rem',
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 'auto',
              bgcolor: alpha('#667eea', 0.05),
              borderRadius: 1.5,
              p: 0.3,
            }}
          >
            <IconButton
              size="small"
              onClick={onDecrease}
              sx={{
                bgcolor: qty > 0 ? '#667eea' : 'transparent',
                color: qty > 0 ? 'white' : '#667eea',
                '&:hover': { bgcolor: '#764ba2', color: 'white' },
                p: 0.5,
              }}
            >
              <RemoveIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <Typography
              fontWeight={700}
              sx={{ minWidth: 20, textAlign: 'center', fontSize: '0.9rem' }}
            >
              {qty}
            </Typography>

            <IconButton
              size="small"
              onClick={onIncrease}
              sx={{
                bgcolor: '#667eea',
                color: 'white',
                '&:hover': { bgcolor: '#764ba2' },
                p: 0.5,
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>

            {qty > 0 && (
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{
                  color: '#ff6b6b',
                  '&:hover': { bgcolor: alpha('#ff6b6b', 0.1) },
                  p: 0.5,
                  ml: 0.2,
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Paper>
    );
  },
);

ProductCard.displayName = 'ProductCard';

// Lazy load wrapper for dialog content
const LazyContent = ({ children, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={1.5}>
        {[...Array(12)].map((_, i) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
            <Skeleton
              variant="rectangular"
              height={180}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
  return children;
};

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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [contentLoading, setContentLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);
  const touchStartY = useRef(0);

  // Prevent pull-to-refresh on Android WebView
  useEffect(() => {
    const content = contentRef.current;
    if (!content || !formOpen) return;

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const scrollTop = content.scrollTop;
      const touchY = e.touches[0].clientY;
      const scrollingDown = touchY > touchStartY.current;

      // Prevent pull-to-refresh when at the top and trying to scroll up
      if (scrollTop <= 0 && scrollingDown) {
        e.preventDefault();
      }
    };

    content.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    content.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      content.removeEventListener('touchstart', handleTouchStart);
      content.removeEventListener('touchmove', handleTouchMove);
    };
  }, [formOpen]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      setShowScrollTop(content.scrollTop > 300);
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, []);

  // Get unique categories (memoized)
  const categories = useMemo(() => {
    if (!menuItems?.length) return ['all'];
    const cats = [
      'all',
      ...new Set(menuItems.map((item) => item.category || 'Uncategorized')),
    ];
    return cats;
  }, [menuItems]);

  // Filter items (memoized)
  const filteredItems = useMemo(() => {
    if (!menuItems?.length) return [];

    let filtered = menuItems;

    if (search) {
      filtered = filtered.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (item) => (item.category || 'Uncategorized') === activeCategory,
      );
    }

    return filtered;
  }, [search, menuItems, activeCategory]);

  // Virtual scrolling - show only first 50 items initially
  const [visibleItems, setVisibleItems] = useState([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setVisibleItems(filteredItems.slice(0, ITEMS_PER_PAGE));
    setPage(1);
  }, [filteredItems]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = nextPage * ITEMS_PER_PAGE;

    if (start < filteredItems.length) {
      setVisibleItems((prev) => [...prev, ...filteredItems.slice(start, end)]);
      setPage(nextPage);
    }
  }, [filteredItems, page]);

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    },
    [loadMore],
  );

  // Memoized quantity functions
  const getQty = useCallback(
    (item) => {
      const found = formData.food_items.find((f) => f.item === item.name);
      return found ? found.qty : 0;
    },
    [formData.food_items],
  );

  const increaseQty = useCallback(
    (item) => {
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
    },
    [formData, setFormData],
  );

  const decreaseQty = useCallback(
    (item) => {
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
    },
    [formData, setFormData],
  );

  const removeItem = useCallback(
    (item) => {
      const updated = formData.food_items.filter((f) => f.item !== item.name);
      setFormData({ ...formData, food_items: updated });
    },
    [formData, setFormData],
  );

  // Memoized summary
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

  // Color generator
  const stringToColor = useCallback((string) => {
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
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Dialog
      open={formOpen}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xl"
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          background: '#f8f9ff',
          height: fullScreen ? '100%' : '90vh',
        },
      }}
    >
      {/* Sticky Header */}
      <Paper
        elevation={2}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <DialogTitle
          sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            {editing ? '✎ Edit Order' : '✨ New Order'}
          </Typography>
          <IconButton
            onClick={() => setFormOpen(false)}
            sx={{ color: 'white', p: 0.5 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      </Paper>

      <DialogContent
        ref={contentRef}
        onScroll={handleScroll}
        sx={{
          p: 2,
          overscrollBehavior: 'none', // Prevent pull-to-refresh
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {/* Top Section - Compact */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Table</InputLabel>
              <Select
                label="Table"
                value={formData.table || ''}
                onChange={(e) =>
                  setFormData({ ...formData, table: e.target.value })
                }
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                {tables?.map((table) => (
                  <MenuItem key={table.documentId} value={table.documentId}>
                    {table.table_no}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              label="Notes"
              fullWidth
              size="small"
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              sx={{ bgcolor: 'white', borderRadius: 2 }}
            />
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 2 },
            }}
          />
        </Box>

        {/* Category Chips - Scrollable */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setActiveCategory(category)}
              size="small"
              icon={
                category === 'all' ? <RestaurantIcon /> : <LocalOfferIcon />
              }
              sx={{
                bgcolor: activeCategory === category ? '#667eea' : 'white',
                color: activeCategory === category ? 'white' : '#666',
                '& .MuiChip-icon': {
                  color: activeCategory === category ? 'white' : '#666',
                },
                flexShrink: 0,
              }}
            />
          ))}
        </Box>

        {/* Product Grid with Lazy Loading */}
        <LazyContent loading={contentLoading}>
          <Grid container spacing={1.5}>
            {visibleItems?.map((item) => {
              const qty = getQty(item);
              const bgColor = stringToColor(item.name);

              return (
                <Grid
                  size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                  key={item.documentId}
                >
                  <ProductCard
                    item={item}
                    qty={qty}
                    onIncrease={() => increaseQty(item)}
                    onDecrease={() => decreaseQty(item)}
                    onRemove={() => removeItem(item)}
                    bgColor={bgColor}
                  />
                </Grid>
              );
            })}
          </Grid>
        </LazyContent>

        {/* Loading More Indicator */}
        {visibleItems.length < filteredItems.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Loading more...
            </Typography>
          </Box>
        )}

        {/* Summary - Sticky at bottom */}
        {formData.food_items.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: 'sticky',
              bottom: 0,
              mt: 2,
              p: 2,
              background: 'white',
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2">
                Items: {formData.food_items.length}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: '#667eea' }}
              >
                ₹{summary.payable.toFixed(2)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              <span>Subtotal: ₹{summary.total.toFixed(2)}</span>
              <span>•</span>
              <span>Tax: ₹{summary.tax.toFixed(2)}</span>
            </Box>
          </Paper>
        )}
      </DialogContent>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <IconButton
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            bgcolor: '#667eea',
            color: 'white',
            '&:hover': { bgcolor: '#764ba2' },
            zIndex: 30,
          }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Zoom>

      {/* Actions */}
      <DialogActions
        sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}
      >
        <Button size="small" onClick={() => setFormOpen(false)}>
          Cancel
        </Button>
        <Button
          size="small"
          onClick={handleSave}
          disabled={loading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          {loading ? '...' : editing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNewOrder;
