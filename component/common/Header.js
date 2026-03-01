'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Box,
  styled,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

/* -------------------- Styled Components -------------------- */

const Container = styled(Box)`
  width: 100%;
  background: #eb282c;
  position: fixed;
  z-index: 1200;
  top: 0;
  left: 0;
  display: none;

  & > div {
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 996px) {
    display: block;
  }
`;

const CustomButton = styled(Button)`
  padding: 0;
  min-width: 0;

  & svg {
    color: #fff;
    font-size: 30px;
  }
`;

const SubMenuItem = styled(ListItemText)`
  span {
    padding-left: 16px;
    transition: all 0.2s ease;
  }

  &:hover span {
    color: #eb282c;
    transform: translateX(3px);
  }
`;

/* -------------------- Component -------------------- */

const Header = ({ logout, menuLinks }) => {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  const toggleSubMenu = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* ---------------- Mobile Header ---------------- */}
      <Container>
        <Box>
          <CustomButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </CustomButton>
          <Image src="/logo-white.png" width={110} height={50} alt="logo" />
        </Box>
      </Container>

      {/* ---------------- Drawer ---------------- */}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 260,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ---------- Scrollable Menu Area ---------- */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            <List>
              {menuLinks.map((menu) => {
                const hasChildren = !!menu.children?.length;
                const isOpen = expandedMenus[menu.key];

                if (hasChildren) {
                  return (
                    <Box key={menu.key}>
                      <ListItemButton onClick={() => toggleSubMenu(menu.key)}>
                        <ListItemText primary={menu.label} />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding>
                          {menu.children.map((child) => (
                            <Link
                              key={child.url}
                              href={child.url}
                              style={{
                                textDecoration: 'none',
                                color: 'inherit',
                              }}
                              onClick={() => setOpen(false)}
                            >
                              <ListItemButton sx={{ pl: 4 }}>
                                <SubMenuItem primary={child.label} />
                              </ListItemButton>
                            </Link>
                          ))}
                        </List>
                      </Collapse>
                    </Box>
                  );
                }

                return (
                  <Link
                    key={menu.key}
                    href={menu.url}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                    onClick={() => setOpen(false)}
                  >
                    <ListItemButton>
                      <ListItemText primary={menu.label} />
                    </ListItemButton>
                  </Link>
                );
              })}
            </List>
          </Box>

          {/* ---------- Fixed Logout Section ---------- */}
          <Divider />

          <Box>
            <List>
              <ListItemButton
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#ffeaea',
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{ color: '#eb282c' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  sx={{ color: '#eb282c', fontWeight: 500 }}
                />
              </ListItemButton>
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
