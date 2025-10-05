import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  styled,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import { useState } from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

const Container = styled(Box)`
  width: 100%;
  background: #eb282c;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  display: none;
  & > div {
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  @media screen and (max-width: 996px) {
    display: block;
  }
`;

const CustomButton = styled(Button)`
  padding: 0px;
  min-width: 0px;
  & > svg {
    color: #fff;
    font-size: 30px;
  }
`;

const SubMenuItem = styled(ListItemText)`
  span {
    transition: all 0.2s ease;
    padding-left: 16px;
  }

  &:hover span {
    color: #eb282c;
    transform: translateX(2px);
  }
`;

const Header = ({ logOut, menuLinks }) => {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleToggleSubMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      <Container>
        <Box>
          <CustomButton onClick={toggleDrawer(true)}>
            <MenuIcon />
          </CustomButton>
          <Image src="/logo-white.png" width={90} height={35} alt="logo" />
        </Box>
      </Container>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuLinks.map((link, index) => {
              const hasSubMenu = !!link.subMenu;

              if (hasSubMenu) {
                return (
                  <Box key={index}>
                    <ListItemButton
                      onClick={() => handleToggleSubMenu(link.label)}
                    >
                      {/* <ListItemIcon sx={{ minWidth: 0 }}>
                        {link.icon}
                      </ListItemIcon> */}
                      <ListItemText primary={link.label} />
                      {expandedMenus[link.label] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItemButton>
                    <Collapse
                      in={expandedMenus[link.label]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {link.subMenu.map((sub, subIndex) => (
                          <Link
                            href={sub.href}
                            key={subIndex}
                            passHref
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <ListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => setOpen(false)}
                            >
                              <SubMenuItem primary={sub.label} />
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
                  href={link.href}
                  key={index}
                  passHref
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setOpen(false)}>
                      <ListItemText primary={link.label} />
                    </ListItemButton>
                  </ListItem>
                </Link>
              );
            })}

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setOpen(false);
                  logOut();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
