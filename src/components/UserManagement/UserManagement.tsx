import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { User } from '../../store/slices/userSlice';
import {
  fetchUsers,
  createUserAsync,
  updateUserAsync,
  deleteUserAsync
} from '../../store/slices/userSlice';
import { UserStatus } from '../../services/userApiService';
import { usePermissionsApi } from '../../hooks';
import { VALIDATION_LIMITS } from '../../utils/validationConstants';
import { isValidEmail } from '../../utils/helpers';
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
  SelectChangeEvent,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface UserManagementProps {
  isModal?: boolean;
  onClose?: () => void;
  showStats?: boolean;
  title?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  isModal = false, 
  onClose, 
  showStats = true,
  title = "User Management"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '', // Only for create
    roleId: 0,
    status: 'active',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: '',
  });
  const dispatch: AppDispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  
  // Get roles from the permissions API
  const { roles } = usePermissionsApi();

  // Helper function to check if a user is admin
  const isAdminUser = (user: User): boolean => {
    return user.role.toLowerCase() === 'administrador' || user.role.toLowerCase() === 'admin';
  };

  // Validation functions
  const validateForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleId: '',
    };

    // First Name validation
    if (!form.firstName.trim()) {
      errors.firstName = 'First Name is required';
    } else if (form.firstName.trim().length < VALIDATION_LIMITS.FIRST_NAME_MIN) {
      errors.firstName = `First Name must be at least ${VALIDATION_LIMITS.FIRST_NAME_MIN} characters long`;
    } else if (form.firstName.trim().length > VALIDATION_LIMITS.FIRST_NAME_MAX) {
      errors.firstName = `First Name cannot exceed ${VALIDATION_LIMITS.FIRST_NAME_MAX} characters`;
    }

    // Last Name validation
    if (!form.lastName.trim()) {
      errors.lastName = 'Last Name is required';
    } else if (form.lastName.trim().length < VALIDATION_LIMITS.LAST_NAME_MIN) {
      errors.lastName = `Last Name must be at least ${VALIDATION_LIMITS.LAST_NAME_MIN} characters long`;
    } else if (form.lastName.trim().length > VALIDATION_LIMITS.LAST_NAME_MAX) {
      errors.lastName = `Last Name cannot exceed ${VALIDATION_LIMITS.LAST_NAME_MAX} characters`;
    }

    // Email validation - improved with max length
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (form.email.trim().length > VALIDATION_LIMITS.EMAIL_MAX) {
      errors.email = `Email cannot exceed ${VALIDATION_LIMITS.EMAIL_MAX} characters`;
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    // Password validation (only for create)
    if (!isEdit && !form.password.trim()) {
      errors.password = 'Password is required';
    } else if (!isEdit && form.password.length < VALIDATION_LIMITS.PASSWORD_MIN) {
      errors.password = `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters long`;
    } else if (!isEdit && form.password.length > VALIDATION_LIMITS.PASSWORD_MAX) {
      errors.password = `Password cannot exceed ${VALIDATION_LIMITS.PASSWORD_MAX} characters`;
    }

    // Role validation
    if (!form.roleId || form.roleId === 0) {
      errors.roleId = 'Role is required';
    }

    setFormErrors(errors);
    
    // Return true if no errors
    return !Object.values(errors).some(error => error !== '');
  };

  const hasFormErrors = () => {
    return Object.values(formErrors).some(error => error !== '');
  };

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = async (user: User) => {
    setSelectedUser(user);
    const isAdmin = isAdminUser(user);
    
    console.log('🔍 Loading user for edit:', {
      user: user,
      status: user.status,
      isActive: user.isActive,
      isAdmin: isAdmin
    });
    
    try {
      // Get the full user details from the API to ensure we have firstName and lastName
      const userApiService = await import('../../services/userApiService');
      const userDetails = await userApiService.userService.getUserById(user.id);
      const userDto = userDetails.data;
      
      setForm({
        firstName: userDto.firstName || '',
        lastName: userDto.lastName || '',
        email: userDto.email || user.email,
        password: '',
        roleId: userDto.roleId || user.roleId,
        // Force admin users to have active status
        status: isAdmin ? 'active' : user.status,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Fallback to parsing the name if API call fails
      const nameParts = user.name.split(' ');
      setForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        password: '',
        roleId: user.roleId,
        // Force admin users to have active status
        status: isAdmin ? 'active' : user.status,
      });
    }
    
    setIsEdit(true);
    setOpenDialog(true);
  };

  const handleDelete = async (user: User) => {
    // No permitir eliminar usuarios administradores
    if (isAdminUser(user)) {
      setSnackbar('No se puede eliminar un usuario con rol de Administrador.');
      return;
    }
    await dispatch(deleteUserAsync(user.id));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setForm({ firstName: '', lastName: '', email: '', password: '', roleId: 0, status: 'active' });
    setFormErrors({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
    setIsEdit(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
    
    // Real-time validation for specific fields
    const newErrors = { ...formErrors };
    
    if (name === 'email' && value) {
      const emailValue = value as string;
      if (emailValue.trim().length > VALIDATION_LIMITS.EMAIL_MAX) {
        newErrors.email = `Email cannot exceed ${VALIDATION_LIMITS.EMAIL_MAX} characters`;
      } else if (!isValidEmail(emailValue)) {
        newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
      } else {
        newErrors.email = '';
      }
    } else if (name === 'firstName') {
      const nameValue = (value as string).trim();
      if (!value) {
        newErrors.firstName = 'First Name is required';
      } else if (nameValue.length < VALIDATION_LIMITS.FIRST_NAME_MIN) {
        newErrors.firstName = `First Name must be at least ${VALIDATION_LIMITS.FIRST_NAME_MIN} characters long`;
      } else if (nameValue.length > VALIDATION_LIMITS.FIRST_NAME_MAX) {
        newErrors.firstName = `First Name cannot exceed ${VALIDATION_LIMITS.FIRST_NAME_MAX} characters`;
      } else {
        newErrors.firstName = '';
      }
    } else if (name === 'lastName') {
      const nameValue = (value as string).trim();
      if (!value) {
        newErrors.lastName = 'Last Name is required';
      } else if (nameValue.length < VALIDATION_LIMITS.LAST_NAME_MIN) {
        newErrors.lastName = `Last Name must be at least ${VALIDATION_LIMITS.LAST_NAME_MIN} characters long`;
      } else if (nameValue.length > VALIDATION_LIMITS.LAST_NAME_MAX) {
        newErrors.lastName = `Last Name cannot exceed ${VALIDATION_LIMITS.LAST_NAME_MAX} characters`;
      } else {
        newErrors.lastName = '';
      }
    } else if (name === 'password' && !isEdit) {
      const passwordValue = value as string;
      if (!passwordValue) {
        newErrors.password = 'Password is required';
      } else if (passwordValue.length < VALIDATION_LIMITS.PASSWORD_MIN) {
        newErrors.password = `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters long`;
      } else if (passwordValue.length > VALIDATION_LIMITS.PASSWORD_MAX) {
        newErrors.password = `Password cannot exceed ${VALIDATION_LIMITS.PASSWORD_MAX} characters`;
      } else {
        newErrors.password = '';
      }
    } else {
      // Clear error for this field when user starts typing and input is valid
      newErrors[name as keyof typeof formErrors] = '';
    }
    
    setFormErrors(newErrors);
  };

  const handleFormSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleRoleChange = (e: SelectChangeEvent<number>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, roleId: value as number }));
    
    // Clear role error when user selects a role
    if (formErrors.roleId) {
      setFormErrors(prev => ({ ...prev, roleId: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setSnackbar('Please fix the validation errors before submitting');
      return;
    }

    if (isEdit && selectedUser) {
      // Prevent deactivating admin users
      if (isAdminUser(selectedUser) && form.status === 'inactive') {
        setSnackbar('No se puede desactivar un usuario con rol de Administrador.');
        return;
      }
      
      console.log('🔄 Updating user:', {
        id: selectedUser.id,
        formStatus: form.status,
        convertedStatus: form.status === 'active' ? UserStatus.Active : UserStatus.Inactive
      });
      
      await dispatch(updateUserAsync({ 
        id: selectedUser.id, 
        data: { 
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          roleId: form.roleId > 0 ? form.roleId : null, // Use the form roleId
          status: form.status === 'active' ? UserStatus.Active : UserStatus.Inactive,
          avatar: null
        } 
      }));
      
      // Refresh users list after update
      await dispatch(fetchUsers());
    } else {
      await dispatch(createUserAsync({ 
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email, 
        password: form.password,
        roleId: form.roleId > 0 ? form.roleId : 2, // Use the form roleId or default to 2
        status: form.status === 'active' ? UserStatus.Active : UserStatus.Inactive,
        avatar: null
      }));
      
      // Refresh users list after create
      await dispatch(fetchUsers());
    }
    handleCloseDialog();
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    newThisMonth: users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length,
  };

  const getRoleColor = (role: string): "primary" | "secondary" | "error" | "warning" => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'error';
      case 'analyst':
      case 'analista':
        return 'primary';
      case 'moderator':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status: string): "success" | "error" => {
    return status === 'active' ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Typography variant="h6">Loading users...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and monitor all users in your application
        </Typography>
      </Box>

      {/* Stats Cards */}
      {showStats && (
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
      )}

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

      {/* Users Table - Desktop */}
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
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === 'active' ? 'Activo' : 'Inactivo'}
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
                    <Tooltip 
                      title={
                        isAdminUser(user) 
                          ? 'Cannot delete Administrator user' 
                          : 'Delete user'
                      }
                    >
                      <span>
                        <IconButton 
                          onClick={() => handleDelete(user)}
                          color="error"
                          size="small"
                          disabled={isAdminUser(user)}
                        >
                          <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
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
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    <Chip
                      label={user.status === 'active' ? 'Activo' : 'Inactivo'}
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
                    <EditIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                  <Tooltip 
                    title={
                      isAdminUser(user) 
                        ? 'Cannot delete Administrator user' 
                        : 'Delete user'
                    }
                  >
                    <span>
                      <IconButton 
                        onClick={() => handleDelete(user)}
                        color="error"
                        size="small"
                        disabled={isAdminUser(user)}
                      >
                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* FAB for mobile */}
      {!isModal && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setOpenDialog(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* User Modal */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
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
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleFormChange}
              size="small"
              sx={{ mb: 2 }}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName || `Maximum ${VALIDATION_LIMITS.FIRST_NAME_MAX} characters`}
              required
              autoFocus
              inputProps={{ maxLength: VALIDATION_LIMITS.FIRST_NAME_MAX }}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleFormChange}
              size="small"
              sx={{ mb: 2 }}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName || `Maximum ${VALIDATION_LIMITS.LAST_NAME_MAX} characters`}
              required
              inputProps={{ maxLength: VALIDATION_LIMITS.LAST_NAME_MAX }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              size="small"
              sx={{ mb: 2 }}
              error={!!formErrors.email}
              helperText={
                formErrors.email || 
                (form.email && isValidEmail(form.email) ? '✓ Valid email format' : `Enter a valid email address (max ${VALIDATION_LIMITS.EMAIL_MAX} chars)`)
              }
              required
              placeholder="user@example.com"
              inputProps={{
                autoComplete: 'email',
                pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
                maxLength: VALIDATION_LIMITS.EMAIL_MAX
              }}
              FormHelperTextProps={{
                sx: {
                  color: formErrors.email 
                    ? 'error.main' 
                    : (form.email && isValidEmail(form.email)) 
                      ? 'success.main' 
                      : 'text.secondary'
                }
              }}
            />
            {!isEdit && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                size="small"
                sx={{ mb: 2 }}
                error={!!formErrors.password}
                helperText={formErrors.password || `${VALIDATION_LIMITS.PASSWORD_MIN}-${VALIDATION_LIMITS.PASSWORD_MAX} characters required`}
                required
                inputProps={{ maxLength: VALIDATION_LIMITS.PASSWORD_MAX }}
              />
            )}
            <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!formErrors.roleId}>
              <InputLabel>Role *</InputLabel>
              <Select
                name="roleId"
                value={form.roleId}
                onChange={handleRoleChange}
                label="Role *"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.roleId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {formErrors.roleId}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleFormSelectChange}
                label="Status"
                disabled={selectedUser ? isAdminUser(selectedUser) : false}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            {selectedUser && isAdminUser(selectedUser) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Administrator users cannot be deactivated
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={hasFormErrors() || (
              !form.firstName.trim() || 
              form.firstName.trim().length < VALIDATION_LIMITS.FIRST_NAME_MIN ||
              form.firstName.trim().length > VALIDATION_LIMITS.FIRST_NAME_MAX ||
              !form.lastName.trim() || 
              form.lastName.trim().length < VALIDATION_LIMITS.LAST_NAME_MIN ||
              form.lastName.trim().length > VALIDATION_LIMITS.LAST_NAME_MAX ||
              !form.email.trim() || 
              form.email.trim().length > VALIDATION_LIMITS.EMAIL_MAX ||
              !isValidEmail(form.email) ||
              (!isEdit && !form.password.trim()) ||
              (!isEdit && form.password.length < VALIDATION_LIMITS.PASSWORD_MIN) ||
              (!isEdit && form.password.length > VALIDATION_LIMITS.PASSWORD_MAX) ||
              !form.roleId
            )}
          >
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(null)} severity="warning" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );

  // Si es modal, envolver en Dialog
  if (isModal && onClose) {
    return (
      <Dialog 
        open={true} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          {title}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Si no es modal, renderizar directamente
  return <Box sx={{ px: { xs: 2, sm: 3 } }}>{content}</Box>;
};

export default UserManagement;
