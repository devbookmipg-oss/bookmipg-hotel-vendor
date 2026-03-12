'use client';

import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Badge,
  alpha,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Slide,
} from '@mui/material';

import {
  forwardRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  memo,
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
import CategoryIcon from '@mui/icons-material/Category';
import NoteIcon from '@mui/icons-material/Note';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Custom Dialog with touch event handling
const CustomDialog = ({ open, onClose, children }) => {
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const scrollTop = el.scrollTop;
      const currentY = e.touches[0].clientY;
      const pullingDown = currentY > touchStartY.current;

      // Prevent pull-to-refresh
      if (scrollTop <= 0 && pullingDown) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: '#f5f7fb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Dialog */}
      <Box
        ref={scrollRef}
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          background: '#f5f7fb',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overscrollBehavior: 'contain',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Memoized Product Card Component
const ProductCard = memo(({ item, qty, onIncrease, onDecrease, onRemove }) => {
  // Generate consistent color based on item name
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const bgColor = stringToColor(item.name);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease',
        border: qty > 0 ? `2px solid ${bgColor}` : '1px solid #e0e0e0',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      {qty > 0 && (
        <Badge
          badgeContent={qty}
          color="primary"
          sx={{
            position: 'absolute',
            top: 18,
            right: 18,
            zIndex: 1,
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              minWidth: 20,
              height: 20,
            },
          }}
        />
      )}

      <Box
        sx={{
          height: 90,
          background: `#cecece`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Avatar
          sx={{
            width: 50,
            height: 50,
            bgcolor: 'white',
            color: bgColor,
            fontSize: '1.3rem',
            fontWeight: 'bold',
            boxShadow: `0 2px 8px ${alpha('#a3a3a3', 0.3)}`,
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

        <Typography
          sx={{
            fontWeight: 700,
            color: bgColor,
            fontSize: '1rem',
            mb: 1,
          }}
        >
          ₹{Number(item.rate).toFixed(2)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
            bgcolor: alpha(bgColor, 0.05),
            borderRadius: 1.5,
            p: 0.3,
          }}
        >
          <IconButton
            size="small"
            onClick={onDecrease}
            disabled={qty === 0}
            sx={{
              bgcolor: qty > 0 ? bgColor : 'transparent',
              color: qty > 0 ? 'white' : bgColor,

              '&.Mui-disabled': {
                color: alpha(bgColor, 0.3),
              },
              p: 0.5,
            }}
          >
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <Typography
            fontWeight={700}
            sx={{ minWidth: 24, textAlign: 'center', fontSize: '0.9rem' }}
          >
            {qty}
          </Typography>

          <IconButton
            size="small"
            onClick={onIncrease}
            sx={{
              bgcolor: bgColor,
              color: 'white',
              '&:hover': { bgcolor: alpha(bgColor, 0.8) },
              p: 0.5,
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={onRemove}
            disabled={qty === 0}
            sx={{
              color: qty > 0 ? '#ff4444' : alpha('#ff4444', 0.3),
              '&:hover': {
                bgcolor: qty > 0 ? alpha('#ff4444', 0.1) : 'transparent',
              },
              '&.Mui-disabled': {
                color: alpha('#ff4444', 0.3),
              },
              p: 0.5,
              ml: 0.2,
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [localFoodItems, setLocalFoodItems] = useState(
    formData.food_items || [],
  );
  const ITEMS_PER_PAGE = 12;
  const updateTimeoutRef = useRef(null);

  // Sync with formData when it changes externally
  useEffect(() => {
    setLocalFoodItems(formData.food_items || []);
  }, [formData.food_items]);

  // Debounced update to parent
  const updateParentFormData = useCallback(
    (newItems) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        setFormData({ ...formData, food_items: newItems });
      }, 100);
    },
    [formData, setFormData],
  );

  // Get unique categories for select dropdown
  const categories = useMemo(() => {
    if (!menuItems?.length) return [{ value: 'all', label: 'All Categories' }];

    const uniqueCats = [
      'all',
      ...new Set(menuItems.map((item) => item.category || 'Uncategorized')),
    ];

    return uniqueCats.map((cat) => ({
      value: cat,
      label:
        cat === 'all'
          ? 'All Categories'
          : cat.charAt(0).toUpperCase() + cat.slice(1),
    }));
  }, [menuItems]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    if (!menuItems?.length) return [];

    let filtered = menuItems;

    // Apply search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (item) => (item.category || 'Uncategorized') === selectedCategory,
      );
    }

    return filtered;
  }, [search, menuItems, selectedCategory]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  // Calculate pagination
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredItems.slice(start, end);
  }, [filteredItems, page]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startItem = (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, filteredItems.length);

  // Handle page change
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      document
        .getElementById('form-start')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      document
        .getElementById('form-start')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Optimized quantity management functions
  const getQty = useCallback(
    (item) => {
      const found = localFoodItems.find((f) => f.item === item.name);
      return found ? found.qty : 0;
    },
    [localFoodItems],
  );

  const increaseQty = useCallback(
    (item) => {
      const exists = localFoodItems.find((f) => f.item === item.name);

      let newItems;
      if (exists) {
        newItems = localFoodItems.map((f) =>
          f.item === item.name
            ? {
                ...f,
                qty: f.qty + 1,
                amount: (f.qty + 1) * f.rate * (1 + f.gst / 100),
              }
            : f,
        );
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
        newItems = [...localFoodItems, newItem];
      }

      setLocalFoodItems(newItems);
      updateParentFormData(newItems);
    },
    [localFoodItems, updateParentFormData],
  );

  const decreaseQty = useCallback(
    (item) => {
      const exists = localFoodItems.find((f) => f.item === item.name);
      if (!exists) return;

      let newItems;
      if (exists.qty === 1) {
        newItems = localFoodItems.filter((f) => f.item !== item.name);
      } else {
        newItems = localFoodItems.map((f) =>
          f.item === item.name
            ? {
                ...f,
                qty: f.qty - 1,
                amount: (f.qty - 1) * f.rate * (1 + f.gst / 100),
              }
            : f,
        );
      }

      setLocalFoodItems(newItems);
      updateParentFormData(newItems);
    },
    [localFoodItems, updateParentFormData],
  );

  const removeItem = useCallback(
    (item) => {
      const newItems = localFoodItems.filter((f) => f.item !== item.name);
      setLocalFoodItems(newItems);
      updateParentFormData(newItems);
    },
    [localFoodItems, updateParentFormData],
  );

  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <CustomDialog
      open={formOpen}
      onClose={() => setFormOpen(false)}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <ReceiptIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          {editing ? 'Edit Order' : 'Create New Order'}
        </Typography>
        <IconButton onClick={() => setFormOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Table Selection and Notes */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 3 }} id="form-start">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Table</InputLabel>
              <Select
                label="Select Table"
                value={formData.table || ''}
                onChange={(e) =>
                  setFormData({ ...formData, table: e.target.value })
                }
                sx={{ bgcolor: 'white', borderRadius: 2 }}
              >
                {tables?.map((table) => (
                  <MenuItem key={table.documentId} value={table.documentId}>
                    <TableRestaurantIcon
                      sx={{ mr: 1, fontSize: 18, color: '#667eea' }}
                    />
                    {table.table_no}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label="Special Notes"
              fullWidth
              size="small"
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              sx={{ bgcolor: 'white', borderRadius: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NoteIcon sx={{ color: '#667eea', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Search and Category Filter */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search menu items..."
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
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                sx={{ bgcolor: 'white', borderRadius: 2 }}
                startAdornment={
                  <CategoryIcon
                    sx={{ color: '#667eea', mr: 1, fontSize: 18 }}
                  />
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Products Grid */}
        <Box id="products-grid" sx={{ minHeight: '400px' }}>
          <Grid container spacing={2}>
            {paginatedItems.map((item) => {
              const qty = getQty(item);

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
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
        {/* Results Count and Simple Pagination */}
        <Box
          sx={{
            my: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredItems.length > 0 ? `${startItem}-${endItem}` : '0'}{' '}
            of {filteredItems.length} items
          </Typography>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={handlePrevPage}
                disabled={page === 1}
                sx={{
                  bgcolor: page > 1 ? '#667eea' : '#e0e0e0',
                  color: 'white',
                  '&:hover': { bgcolor: page > 1 ? '#764ba2' : '#e0e0e0' },
                  '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2">
                Page {page} of {totalPages}
              </Typography>
              <IconButton
                size="small"
                onClick={handleNextPage}
                disabled={page === totalPages}
                sx={{
                  bgcolor: page < totalPages ? '#667eea' : '#e0e0e0',
                  color: 'white',
                  '&:hover': {
                    bgcolor: page < totalPages ? '#764ba2' : '#e0e0e0',
                  },
                  '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#999' },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}

          {selectedCategory !== 'all' && (
            <Chip
              label={
                categories.find((c) => c.value === selectedCategory)?.label
              }
              size="small"
              onDelete={() => setSelectedCategory('all')}
              sx={{ bgcolor: alpha('#667eea', 0.1) }}
            />
          )}
        </Box>
        {/* No Results */}
        {paginatedItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RestaurantIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography color="text.secondary">No items found</Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Button
          size="small"
          onClick={handleSave}
          disabled={loading || !formData.table || localFoodItems.length === 0}
          variant="contained"
          sx={{
            background:
              loading || !formData.table || localFoodItems.length === 0
                ? '#e0e0e0'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color:
              loading || !formData.table || localFoodItems.length === 0
                ? '#999'
                : 'white',
            '&:hover': {
              background:
                loading || !formData.table || localFoodItems.length === 0
                  ? '#e0e0e0'
                  : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          {loading
            ? 'Processing...'
            : editing
              ? 'Update Order'
              : 'Create Order'}
        </Button>
      </Box>
    </CustomDialog>
  );
};

export default CreateNewOrder;
