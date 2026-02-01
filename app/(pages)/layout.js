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
    public: true,
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
        label: 'Users / Accounts',
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
        label: 'Guests List',
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
        label: 'Categories',
        url: '/property/categories',
      },
      {
        label: 'Rooms',
        url: '/property/rooms',
      },

      {
        label: 'MOPs',
        url: '/property/payment-methods',
      },
    ],
  },
  {
    key: 'frontoffice',
    label: 'Front Desk',
    icon: <AirplayOutlined sx={{ fontSize: 18 }} />,
    access: 'frontoffice',
    children: [
      {
        label: 'Booking Overview',
        url: '/front-office/dashboard',
      },
      {
        label: 'Bookings',
        url: '/front-office/room-booking',
      },

      {
        label: 'Invoice Master',
        url: '/front-office/room-invoice',
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
        label: 'Purchase Entry',
        url: '/inventory/purchase-entries',
      },
      {
        label: 'Sales Entry',
        url: '/inventory/sales-entries',
      },
    ],
  },
  {
    key: 'accounts',
    label: 'Account/Reports',
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
    // Only dashboard (or explicitly public menus)
    if (menu.public) return true;

    // Everything else needs access
    if (!menu.access) return false;

    return access.includes(menu.key);
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
