import React, { useState } from 'react';
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
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { usePermissionsApi } from '../../hooks';

interface RoleManagementProps {
  isModal?: boolean;
  onClose?: () => void;
  showStats?: boolean;
  title?: string;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ 
  isModal = false, 
  onClose, 
  showStats = true,
  title = "Role Management"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{ id?: number, name: string } | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number, name: string, usersCount: number } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const {
    users,
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole
  } = usePermissionsApi();

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedRole({ name: '' });
    setIsEdit(false);
    setOpenDialog(true);
  };

  const handleEdit = (role: { id: number, name: string }) => {
    setSelectedRole(role);
    setIsEdit(true);
    setOpenDialog(true);
  };

  const handleDelete = (roleId: number) => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (!roleToDelete) return;

    // No permitir eliminar el rol de administrador ni el rol "Sin asignar"
    if (roleToDelete.name.toLowerCase() === 'administrador' || roleToDelete.name.toLowerCase() === 'admin') {
      setSnackbar('No se puede eliminar el rol de Administrador.');
      return;
    }
    if (roleToDelete.name.toLowerCase() === 'sin asignar' || roleToDelete.name.toLowerCase() === 'unassigned') {
      setSnackbar('No se puede eliminar el rol "Sin asignar".');
      return;
    }
    
    // Contar usuarios asignados a este rol
    const usersWithRole = users.filter(u => u.roleId === roleId);
    
    setRoleToDelete({
      id: roleToDelete.id,
      name: roleToDelete.name,
      usersCount: usersWithRole.length
    });
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    if (!selectedRole?.name.trim()) return;

    const roleName = selectedRole.name.trim();
    
    // Validar que el nombre del rol no exista ya
    const existingRole = roles.find(r => 
      r.name.toLowerCase() === roleName.toLowerCase() && 
      r.id !== selectedRole.id
    );
    
    if (existingRole) {
      setSnackbar('Ya existe un rol con ese nombre');
      return;
    }
    
    try {
      if (isEdit && selectedRole.id) {
        await updateRole(selectedRole.id, { name: roleName });
        setSnackbar('Rol actualizado exitosamente');
      } else {
        await createRole({ name: roleName });
        setSnackbar('Rol creado exitosamente');
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar(isEdit ? 'Error al actualizar rol' : 'Error al crear rol');
    }
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete.id);
        setSnackbar('Rol eliminado correctamente');
      } catch (error) {
        setSnackbar('Error al eliminar rol');
      } finally {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  const roleStats = {
    total: roles.length,
    withUsers: roles.filter(role => users.some(user => user.roleId === role.id)).length,
    systemRoles: roles.filter(role => 
      role.name.toLowerCase() === 'administrador' || 
      role.name.toLowerCase() === 'admin' ||
      role.name.toLowerCase() === 'sin asignar' ||
      role.name.toLowerCase() === 'unassigned'
    ).length,
    customRoles: roles.filter(role => 
      role.name.toLowerCase() !== 'administrador' && 
      role.name.toLowerCase() !== 'admin' &&
      role.name.toLowerCase() !== 'sin asignar' &&
      role.name.toLowerCase() !== 'unassigned'
    ).length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <Typography variant="h6">Loading roles...</Typography>
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
          Manage and monitor all roles in your application
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
                Total Roles
              </Typography>
              <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
                {roleStats.total}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
                With Users
              </Typography>
              <Typography variant="h5" color="success.main" sx={{ fontSize: '1.5rem' }}>
                {roleStats.withUsers}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
                System Roles
              </Typography>
              <Typography variant="h5" color="warning.main" sx={{ fontSize: '1.5rem' }}>
                {roleStats.systemRoles}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ py: 1.5 }}>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
                Custom Roles
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontSize: '1.5rem' }}>
                {roleStats.customRoles}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Search and Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <TextField
          placeholder="Search roles..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            minWidth: { xs: '100%', sm: 250 }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          ADD ROLE
        </Button>
      </Box>

      {/* Roles Table - Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell>Assigned Users</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.map((role) => {
                const usersCount = users.filter(u => u.roleId === role.id).length;
                const isAdminRole = role.name.toLowerCase() === 'administrador' || role.name.toLowerCase() === 'admin';
                const isUnassignedRole = role.name.toLowerCase() === 'sin asignar' || role.name.toLowerCase() === 'unassigned';
                const isSystemRole = isAdminRole || isUnassignedRole;
                const canDelete = !isSystemRole;
                const canEdit = !isSystemRole;

                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {role.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${usersCount} user${usersCount !== 1 ? 's' : ''}`} 
                        size="small"
                        color={usersCount > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isSystemRole ? 'System' : 'Custom'} 
                        size="small"
                        color={isSystemRole ? 'warning' : 'primary'}
                        variant={isSystemRole ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(role)}
                        color="primary"
                        disabled={!canEdit}
                        title={
                          isAdminRole
                            ? 'Cannot edit Administrator role'
                            : isUnassignedRole
                            ? 'Cannot edit "Unassigned" role'
                            : 'Edit role'
                        }
                      >
                        <EditIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(role.id)}
                        color="error"
                        disabled={!canDelete}
                        title={
                          isAdminRole
                            ? 'Cannot delete Administrator role'
                            : isUnassignedRole
                            ? 'Cannot delete "Unassigned" role'
                            : `Delete role (${usersCount} user${usersCount !== 1 ? 's' : ''} will be reassigned)`
                        }
                      >
                        <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Roles List - Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredRoles.map((role) => {
          const usersCount = users.filter(u => u.roleId === role.id).length;
          const isAdminRole = role.name.toLowerCase() === 'administrador' || role.name.toLowerCase() === 'admin';
          const isUnassignedRole = role.name.toLowerCase() === 'sin asignar' || role.name.toLowerCase() === 'unassigned';
          const isSystemRole = isAdminRole || isUnassignedRole;
          const canDelete = !isSystemRole;
          const canEdit = !isSystemRole;

          return (
            <Card key={role.id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                      {role.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={`${usersCount} user${usersCount !== 1 ? 's' : ''}`} 
                        size="small"
                        color={usersCount > 0 ? 'primary' : 'default'}
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip 
                        label={isSystemRole ? 'System' : 'Custom'} 
                        size="small"
                        color={isSystemRole ? 'warning' : 'primary'}
                        variant={isSystemRole ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      onClick={() => handleEdit(role)}
                      color="primary"
                      size="small"
                      disabled={!canEdit}
                    >
                      <EditIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(role.id)}
                      color="error"
                      size="small"
                      disabled={!canDelete}
                    >
                      <DeleteIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* FAB for mobile */}
      {!isModal && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAdd}
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

      {/* Role Dialog */}
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
          {selectedRole?.id ? 'Edit Role' : 'Add New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Role Name"
              name="name"
              value={selectedRole?.name || ''}
              onChange={(e) => setSelectedRole(prev => prev ? { ...prev, name: e.target.value } : null)}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!selectedRole?.name.trim()}
          >
            {selectedRole?.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the role <strong>{roleToDelete?.name}</strong>?
          </Typography>
          {roleToDelete && roleToDelete.usersCount > 0 && (
            <Typography color="warning.main" sx={{ mt: 1 }}>
              This role has <strong>{roleToDelete.usersCount} user{roleToDelete.usersCount !== 1 ? 's' : ''}</strong> assigned. 
              {roleToDelete.usersCount !== 1 ? ' These users' : ' This user'} will become &quot;Unassigned&quot;.
            </Typography>
          )}
          <Typography color="error" sx={{ mt: 1 }}>
            This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
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
            <CloseIcon />
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

export default RoleManagement;
