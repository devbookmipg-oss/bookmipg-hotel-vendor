'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Button, Divider, Collapse } from '@mui/material';
import {
  Circle,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';

const Container = styled(Box)`
  width: 240px;
  height: 100vh;
  background-color: #c20f12;
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 996px) {
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

  &:hover {
    background-color: #fff;
    color: #a00c17;

    & svg {
      color: #a00c17;
    }
  }
`;

const SubLinkItem = styled(LinkItem)`
  padding-left: 30px;
  font-size: 14px;
  color: #f5f5f5;
`;

const Sidebar = ({ logout, menuLinks }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Container>
      <LogoWrapper>
        <Image src="/logo-white.png" width={150} height={70} alt="logo" />
      </LogoWrapper>

      <Divider />

      {menuLinks.map((item) => {
        const hasChildren = !!item.children?.length;
        const isOpen = openMenus[item.key];

        return (
          <Box key={item.key}>
            {/* Parent */}
            {hasChildren ? (
              <LinkItem onClick={() => toggleMenu(item.key)}>
                <Box sx={{ mr: 1, display: 'flex' }}>{item.icon}</Box>
                {item.label}
                <Box sx={{ ml: 'auto' }}>
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </LinkItem>
            ) : (
              <Link href={item.url} style={{ textDecoration: 'none' }}>
                <LinkItem>
                  <Box sx={{ mr: 1, display: 'flex' }}>{item.icon}</Box>
                  {item.label}
                </LinkItem>
              </Link>
            )}

            {/* Children */}
            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                {item.children.map((child) => (
                  <Link
                    href={child.url}
                    key={child.url}
                    style={{ textDecoration: 'none' }}
                  >
                    <SubLinkItem>
                      <Box sx={{ mr: 0.5, display: 'flex' }}>
                        <Circle sx={{ fontSize: 8 }} />
                      </Box>
                      {child.label}
                    </SubLinkItem>
                  </Link>
                ))}
              </Collapse>
            )}
          </Box>
        );
      })}

      <Divider sx={{ my: 1 }} />

      <LinkItem onClick={logout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Logout
      </LinkItem>
    </Container>
  );
};

export default Sidebar;
