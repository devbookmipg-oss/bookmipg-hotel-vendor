'use client';
import { useAuth } from '@/context';
import { Box, styled } from '@mui/material';

import { Header, Sidebar } from '@/component/common';
import {
  AccountBalance,
  AdminPanelSettings,
  AirplayOutlined,
  Apartment,
  Dashboard,
  EventAvailable,
  FoodBank,
  RateReview,
  ShoppingCart,
} from '@mui/icons-material';

// styles
const Container = styled(Box)`
  margin-left: 240px;
  min-height: 100vh;
  background: #f1f3f6;
  @media screen and (max-width: 996px) {
    margin-left: 0px;
    margin-top: 70px;
  }
`;

const menuLinks = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    url: '/dashboard',
    icon: <Dashboard sx={{ fontSize: 18 }} />,
  },
  {
    key: 'online-bookings',
    label: 'Online Bookings',
    url: '/front-office/online-booking',
    icon: <EventAvailable sx={{ fontSize: 18 }} />,
  },
  {
    key: 'reviews',
    label: 'Reviews',
    url: '/front-office/reviews',
    icon: <RateReview sx={{ fontSize: 18 }} />,
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: <AdminPanelSettings sx={{ fontSize: 18 }} />,
    access: 'admin',
    children: [
      {
        label: 'Users',
        url: '/master/users',
      },
      {
        label: 'Hotel Profile',
        url: '/master/hotel-profile',
      },
      {
        label: 'Restaurant Profile',
        url: '/master/restaurant-profile',
      },
      {
        label: 'Guests',
        url: '/property/customers',
      },
    ],
  },
  {
    key: 'property',
    label: 'Property',
    icon: <Apartment sx={{ fontSize: 18 }} />,
    access: 'property',
    children: [
      {
        label: 'Room Categories',
        url: '/property/categories',
      },
      {
        label: 'Room List',
        url: '/property/rooms',
      },

      {
        label: 'Payment Methods',
        url: '/property/payment-methods',
      },
    ],
  },
  {
    key: 'frontoffice',
    label: 'Frontoffice',
    icon: <AirplayOutlined sx={{ fontSize: 18 }} />,
    access: 'frontoffice',
    children: [
      {
        label: 'Room Booking',
        url: '/front-office/room-booking',
      },

      {
        label: 'Room Invoice',
        url: '/front-office/room-invoice',
      },
      {
        label: 'Invoice Report',
        url: '/front-office/room-invoice-report',
      },
    ],
  },
  {
    key: 'restaurant',
    label: 'Restaurant',
    icon: <FoodBank sx={{ fontSize: 18 }} />,
    access: 'restaurant',
    children: [
      {
        label: 'Table Orders',
        url: '/restaurant/table-orders',
      },
      {
        label: 'Table Booking',
        url: '/restaurant/table-bookings',
      },
      {
        label: 'Invoices',
        url: '/restaurant/invoices',
      },
      {
        label: 'Menu',
        url: '/restaurant/menu-items',
      },
      {
        label: 'Tables',
        url: '/restaurant/tables',
      },
      {
        label: 'Invoice Report',
        url: '/restaurant/invoice-report',
      },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: <ShoppingCart sx={{ fontSize: 18 }} />,
    access: 'inventory',
    children: [
      {
        label: 'Category',
        url: '/inventory/category',
      },
      {
        label: 'Inventory List',
        url: '/inventory/inventory-item',
      },
      {
        label: 'Purchase Item',
        url: '/inventory/purchase-entries',
      },
      {
        label: 'Sales Item',
        url: '/inventory/sales-entries',
      },
      {
        label: 'Stock Report',
        url: '/inventory/stock-report',
      },
    ],
  },
  {
    key: 'accounts',
    label: 'Accounts',
    icon: <AccountBalance sx={{ fontSize: 18 }} />,
    access: 'accounts',
    children: [
      {
        label: 'Manage Expenses',
        url: '/expenses',
      },
      {
        label: 'Stock Report',
        url: '/inventory/stock-report',
      },
      {
        label: 'Restaurant Invoice Report',
        url: '/restaurant/invoice-report',
      },
      {
        label: 'Room Invoice Report',
        url: '/front-office/room-invoice-report',
      },
      {
        label: 'Income Expense Report',
        url: '/income-expense-report',
      },
    ],
  },
];

const filterMenuByAccess = (menuLinks, access = []) => {
  return menuLinks.filter((menu) => {
    // Always visible
    if (!menu.access) return true;

    // Restricted
    return access.includes(menu.access);
  });
};

const Layout = ({ children }) => {
  const { logout, auth } = useAuth();
  const access = auth?.user?.access || [];

  const visibleMenus = filterMenuByAccess(menuLinks, access);

  return (
    <>
      <Header logout={logout} menuLinks={visibleMenus} />
      <Sidebar logout={logout} menuLinks={visibleMenus} />
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
