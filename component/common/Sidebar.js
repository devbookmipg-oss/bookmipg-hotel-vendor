// Redesigned Sidebar with collapsible menus
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Button, Divider, Collapse } from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';

const Container = styled(Box)`
  width: 200px;
  height: 100vh;
  background-color: #eb282c;

  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  @media screen and (max-width: 996px) {
    width: 0px;
    overflow: hidden;
    display: none;
  }
`;

const LogoWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
`;

const LinkItem = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  padding: 10px 16px;
  text-transform: none;
  font-weight: 500;
  color: #fff;
  font-size: 15px;
  border-radius: 0;
  background-color: transparent;

  &:hover {
    background-color: #fff;
    color: #a00c17;
    & svg {
      color: #a00c17;
    }
  }
`;

const SubLinkItem = styled(LinkItem)`
  padding-left: 32px;
  font-size: 14px;
  color: #f5f5f5;
`;

const Sidebar = ({ logout, menuLinks }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <Container>
        <LogoWrapper>
          <Image
            src="/logo-white.png"
            width={150}
            height={70}
            alt="logo white"
          />
        </LogoWrapper>
        <Divider />
        {menuLinks.map((item, index) => {
          if (item.subMenu) {
            return (
              <Box key={index}>
                <LinkItem onClick={() => toggleMenu(item.label)}>
                  {item.label}
                  <Box sx={{ ml: 'auto' }}>
                    {openMenus[item.label] ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </LinkItem>
                <Collapse
                  in={openMenus[item.label]}
                  timeout="auto"
                  unmountOnExit
                >
                  {item.subMenu.map((subItem, subIndex) => (
                    <Link
                      href={subItem.href}
                      key={`${index}-${subIndex}`}
                      passHref
                    >
                      <SubLinkItem>{subItem.label}</SubLinkItem>
                    </Link>
                  ))}
                </Collapse>
              </Box>
            );
          }
          return (
            <Link href={item.href} key={index} passHref>
              <LinkItem>{item.label}</LinkItem>
            </Link>
          );
        })}
        <Divider sx={{ my: 1 }} />
        <LinkItem onClick={logout}>
          <LogoutIcon sx={{ mr: 0.8, color: '#fff' }} /> Logout
        </LinkItem>
      </Container>
    </>
  );
};
export default Sidebar;
