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
  Breadcrumbs,
  Link,
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
import { NavigateNext } from '@mui/icons-material';

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

const PageNewOrderPage = () => {
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
    <>
      {' '}
      <Box sx={{ px: 3, py: 2, backgroundColor: '#f4f6f8' }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
          <Link underline="hover" color="inherit" href="/">
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/restaurant/table-orders"
          >
            Table Orders
          </Link>
          <Typography color="text.primary">New Order</Typography>
        </Breadcrumbs>
      </Box>
    </>
  );
};

export default PageNewOrderPage;
