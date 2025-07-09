import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Chip,
  Avatar,
  SxProps,
  Theme,
} from '@mui/material';

interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: unknown, row: T) => React.ReactNode;
}

interface StandardTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  sx?: SxProps<Theme>;
  onRowClick?: (row: T) => void;
}

/**
 * Tabla estándar con el estilo del sistema
 */
export function StandardTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  pagination,
  sx = {},
  onRowClick,
}: StandardTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.format) {
      return column.format(getNestedValue(row, column.id as string), row);
    }
    return getNestedValue(row, column.id as string);
  };

  const getNestedValue = (obj: unknown, path: string): unknown => {
    return path.split('.').reduce((o: unknown, p: string) => {
      if (o && typeof o === 'object' && p in o) {
        return (o as Record<string, unknown>)[p];
      }
      return undefined;
    }, obj);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        ...sx 
      }}
    >
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id as string}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    py: 2,
                    '&:first-of-type': {
                      pl: 3,
                    },
                    '&:last-of-type': {
                      pr: 3,
                    },
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    Cargando...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: onRowClick ? 'action.hover' : 'transparent',
                    },
                    '&:nth-of-type(even)': {
                      bgcolor: 'grey.50',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id as string}
                      align={column.align}
                      sx={{
                        py: 1.5,
                        '&:first-of-type': {
                          pl: 3,
                        },
                        '&:last-of-type': {
                          pr: 3,
                        },
                      }}
                    >
                      {getCellValue(row, column) as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.count}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={pagination.onPageChange}
          onRowsPerPageChange={pagination.onRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderTopColor: 'divider',
            bgcolor: 'grey.50',
          }}
        />
      )}
    </Paper>
  );
}

// Helper components para formatear contenido de celdas
interface StatusChipProps {
  status: string;
  colorMap?: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'>;
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  colorMap = {
    active: 'success',
    inactive: 'error',
    pending: 'warning',
    suspended: 'error',
  }
}) => {
  const color = colorMap[status.toLowerCase()] || 'default';
  
  return (
    <Chip
      label={status}
      color={color}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 600,
        minWidth: 80,
        '& .MuiChip-label': {
          fontSize: '0.75rem',
        },
      }}
    />
  );
};

interface UserAvatarProps {
  name: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  size = 32 
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: 'primary.main',
        fontSize: size * 0.4,
        fontWeight: 600,
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
};
