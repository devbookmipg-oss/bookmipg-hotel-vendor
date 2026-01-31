'use client';

import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import ACTION_COLORS from '@/utils/buttonColors';

const ActionButton = ({
  action = 'create',
  variant = 'contained',
  icon = null,
  label = '',
  size = 'medium',
  tooltip = '',
  onClick,
  ...props
}) => {
  const color = ACTION_COLORS[action] || 'primary';

  if (icon && !label) {
    return (
      <Tooltip title={tooltip || action}>
        <IconButton color={color} onClick={onClick} size={size} {...props}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={variant}
      color={color}
      startIcon={icon}
      onClick={onClick}
      size={size}
      sx={{ textTransform: 'none' }}
      {...props}
    >
      {label}
    </Button>
  );
};

export default ActionButton;
