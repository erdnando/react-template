import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import { Tooltip } from '@mui/material';

export const PermissionIcon = ({ type }: { type: 'Edit' | 'ReadOnly' | 'None' }) => {
  switch (type) {
    case 'Edit':
      return (
        <Tooltip title="Edición"><EditIcon fontSize="small" color="primary" /></Tooltip>
      );
    case 'ReadOnly':
      return (
        <Tooltip title="Solo lectura"><VisibilityIcon fontSize="small" color="action" /></Tooltip>
      );
    case 'None':
    default:
      return (
        <Tooltip title="Sin acceso"><BlockIcon fontSize="small" color="disabled" /></Tooltip>
      );
  }
};
