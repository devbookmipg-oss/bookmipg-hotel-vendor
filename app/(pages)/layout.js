'use client';
import { useAuth } from '@/context';
import { Box, styled } from '@mui/material';

import { Header, Sidebar } from '@/component/common';

// styles
const Container = styled(Box)`
  margin-left: 200px;
  min-height: 100vh;
  background: #f1f3f6;
  @media screen and (max-width: 996px) {
    margin-left: 0px;
    margin-top: 70px;
  }
`;

const menuLinks = [
  // {
  //   label: 'Admin',
  //   icon: <User sx={{ mr: 0.8, fontSize: '20px' }} />,
  //   subMenu: [
  //     { href: '/master/users', label: '▫️Users' },
  //     { href: '/master/profile', label: '▫️Profile' },
  //   ],
  // },
  {
    href: '/dashboard',

    label: 'Dashboard',
  },
  {
    label: 'Property',

    subMenu: [
      { href: '/master/hotel-profile', label: '▫️Hotel Profile' },
      { href: '/master/restaurant-profile', label: '▫️Restaurant Profile' },
      { href: '/property/categories', label: '▫️Room Categories' },
      // { href: '/property/rooms', label: '▫️Room List' },
      // { href: '/property/customers', label: '▫️Guests' },
    ],
  },
  {
    href: '/front-office/online-booking',

    label: 'Online Bookings',
  },
  {
    href: '/front-office/reviews',

    label: 'Reviews',
  },
  // {
  //   label: 'Frontoffice',
  //
  //   subMenu: [
  //     { href: '/front-office/room-booking', label: '▫️Booking' },
  //     { href: '/front-office/room-booking-report', label: '▫️Booking Report' },
  //   ],
  // },

  // {
  //   href: '/house-keeping',
  //   icon: <LayoutDashboard sx={{ mr: 0.8, fontSize: '20px' }} />,
  //   label: 'Housekeeping',
  // },

  {
    label: 'Restaurant',

    subMenu: [
      { href: '/restaurant/dashboard', label: '▫️Dashboard' },
      { href: '/restaurant/tables', label: '▫️Tables' },
      { href: '/restaurant/menu-items', label: '▫️Restaurant Menu' },
      { href: '/restaurant/table-bookings', label: '▫️Table Booking' },
      { href: '/restaurant/invoices', label: '▫️Invoices' },
      { href: '/restaurant/invoice-report', label: '▫️Invoice Report' },
    ],
  },
  {
    label: 'Inventory',

    subMenu: [
      { href: '/inventory/category', label: '▫️Category' },
      { href: '/inventory/inventory-item', label: '▫️Inventory List' },
      { href: '/inventory/purchase-entries', label: '▫️Purchase Item' },
      { href: '/inventory/sales-entries', label: '▫️Sales Item' },
      { href: '/inventory/stock-report', label: '▫️Stock Report' },
    ],
  },
  {
    href: '/expenses',

    label: 'Expenses',
  },
];

const Layout = ({ children }) => {
  const { logout } = useAuth();
  return (
    <>
      <Header logout={logout} menuLinks={menuLinks} />
      <Sidebar logout={logout} menuLinks={menuLinks} />
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
