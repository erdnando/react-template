import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { User } from '../../store/slices/userSlice';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Container,
  Card,
  CardContent,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Obtener usuarios del estado global
  const users = useSelector((state: RootState) => state.users.users);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon sx={{ fontSize: '1.1rem' }} />;
      case 'moderator':
        return <WorkIcon sx={{ fontSize: '1.1rem' }} />;
      default:
        return <PersonIcon sx={{ fontSize: '1.1rem' }} />;
    }
  };

  const getRoleColor = (role: string): "primary" | "secondary" | "success" | "error" | "info" | "warning" => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status: string): "success" | "error" => {
    return status === 'active' ? 'success' : 'error';
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    newThisMonth: users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length,
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor all users in your application
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: { xs: 1.5, md: 2 }, 
          mb: 3 
        }}
      >
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Total Users
            </Typography>
            <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
              {userStats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Active Users
            </Typography>
            <Typography variant="h5" color="success.main" sx={{ fontSize: '1.5rem' }}>
              {userStats.active}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Administrators
            </Typography>
            <Typography variant="h5" color="error.main" sx={{ fontSize: '1.5rem' }}>
              {userStats.admins}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              New This Month
            </Typography>
            <Typography variant="h5" color="primary.main" sx={{ fontSize: '1.5rem' }}>
              {userStats.newThisMonth}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Actions */}
      <Paper sx={{ p: { xs: 1, md: 1.5 }, mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 0 },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' } 
        }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: '100%', sm: 280 }
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={() => setOpenDialog(true)}
            size="small"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Add User
          </Button>
        </Box>
      </Paper>

      {/* Users List - Desktop Table */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1.5, bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {user.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem' }}>
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleEdit(user)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Users List - Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredUsers.map((user) => (
          <Card key={user.id} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40, fontSize: '1rem' }}>
                  {user.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1 }}>
                    {user.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Joined: {new Date(user.joinDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    onClick={() => handleEdit(user)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              defaultValue={selectedUser?.name || ''}
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              defaultValue={selectedUser?.email || ''}
              size="small"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel size="small">Role</InputLabel>
              <Select
                defaultValue={selectedUser?.role || 'user'}
                label="Role"
                size="small"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel size="small">Status</InputLabel>
              <Select
                defaultValue={selectedUser?.status || 'active'}
                label="Status"
                size="small"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} size="small">Cancel</Button>
          <Button variant="contained" size="small">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button - Mobile Only */}
      <Fab
        color="primary"
        aria-label="add"
        size="medium"
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 80, sm: 16 }, 
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon sx={{ fontSize: '1.2rem' }} />
      </Fab>
    </Container>
  );
};

export default Users;