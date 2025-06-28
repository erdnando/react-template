import React, { useState, useMemo, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Checkbox, 
  Button, 
  Divider, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  InputAdornment, 
  Tooltip, 
  Snackbar, 
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePermissionsApi } from '../../hooks';
import { UserManagement, RoleManagement } from '../../components/common';

const Permissions: React.FC = () => {
  // Use the API hook instead of local state
  const {
    users,
    roles,
    modules,
    userModulePermissions,
    loading,
    error,
    deleteUser,
    deleteRole,
    saveUserPermissions,
    setUserModulePermissions
  } = usePermissionsApi();
  // Estados para modales de gestión
  const [openUsersManagement, setOpenUsersManagement] = useState(false);
  const [openRolesManagement, setOpenRolesManagement] = useState(false);

  // Permisos posibles sobre cada módulo
  const rolePermissionTypes = ["Admin", "Delete", "Write", "Read"];
  const rolePermissionIcons: Record<'Admin' | 'Delete' | 'Write' | 'Read', JSX.Element> = {
    Admin: <Tooltip title="Acceso total"><CheckCircleIcon color="error" fontSize="small" /></Tooltip>,
    Delete: <Tooltip title="Puede eliminar"><DeleteIcon color="warning" fontSize="small" /></Tooltip>,
    Write: <Tooltip title="Puede editar"><EditIcon color="primary" fontSize="small" /></Tooltip>,
    Read: <Tooltip title="Solo lectura"><VisibilityIcon color="success" fontSize="small" /></Tooltip>,
  };

  // Estados para gestión de permisos
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastPermissions = useRef<Record<string, Record<string, { enabled: boolean, type: string }>>>({});
  const isMobile = useMediaQuery('(max-width:600px)');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  // Solo un usuario puede estar seleccionado
  const [activeUser, setActiveUser] = useState<string | null>(null);
  // Estado para controlar qué grupos de roles están expandidos
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  // Agrupar usuarios por rol
  const usersByRole = useMemo(() => {
    const grouped: Record<string, { id: number, name: string }[]> = {};
    // Inicializar todos los roles, incluso si no tienen usuarios
    roles.forEach(role => {
      grouped[role.name] = users.filter(u => u.roleId === role.id);
    });
    return grouped;
  }, [roles, users]);

  // Inicializar grupos colapsados por defecto
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    roles.forEach(role => {
      initialExpanded[role.name] = false; // Todos colapsados por defecto
    });
    setExpandedRoles(initialExpanded);
  }, [roles]);

  const allRoles = useMemo(() => roles.map(r => r.name), [roles]);
  
  const filteredModules = useMemo(
    () => modules.filter(m => m.name.toLowerCase().includes(search.toLowerCase())),
    [modules, search]
  );

  // Filtrado de usuarios por rol y búsqueda
  const filteredUsersByRole = useMemo(() => {
    const result: Record<string, { id: number, name: string }[]> = {};
    allRoles.forEach(roleName => {
      const usersInRole = usersByRole[roleName] || [];
      const filtered = usersInRole.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));
      // Incluir el rol incluso si no tiene usuarios o si no hay usuarios que coincidan con la búsqueda
      // Solo excluir si hay una búsqueda activa y no hay coincidencias
      if (userSearch.trim() === '' || filtered.length > 0 || usersInRole.length === 0) {
        result[roleName] = filtered;
      }
    });
    return result;
  }, [usersByRole, allRoles, userSearch]);

  // Handlers para usuarios - ahora manejado por UserManagement component

  // Handlers para gestión de modales principales
  const handleCloseUsersManagement = () => setOpenUsersManagement(false);
  const handleCloseRolesManagement = () => setOpenRolesManagement(false);

  // Handlers para permisos de módulos
  const handleModuleToggle = (user: string, moduleCode: string) => {
    setUserModulePermissions(prev => {
      setPendingChanges(true);
      const currentlyEnabled = prev[user]?.[moduleCode]?.enabled;
      return ({
        ...prev,
        [user]: {
          ...prev[user],
          [moduleCode]: {
            enabled: !currentlyEnabled,
            type: !currentlyEnabled ? 'Read' : (prev[user]?.[moduleCode]?.type || 'Read'),
            permissionId: prev[user]?.[moduleCode]?.permissionId
          }
        }
      });
    });
  };

  const handleModuleTypeChange = (user: string, moduleCode: string, type: string) => {
    setUserModulePermissions(prev => {
      setPendingChanges(true);
      return ({
        ...prev,
        [user]: {
          ...prev[user],
          [moduleCode]: {
            enabled: prev[user]?.[moduleCode]?.enabled ?? false,
            type: type as 'Admin' | 'Delete' | 'Write' | 'Read' | 'None',
            permissionId: prev[user]?.[moduleCode]?.permissionId
          }
        }
      });
    });
  };

  const handleSave = async () => {
    try {
      if (activeUser) {
        await saveUserPermissions(activeUser, userModulePermissions[activeUser] || {});
        lastPermissions.current = JSON.parse(JSON.stringify(userModulePermissions));
        setPendingChanges(false);
        setSnackbar('Cambios guardados exitosamente');
      }
    } catch (error) {
      setSnackbar('Error al guardar cambios');
    }
  };

  // Selección única de usuario
  const handleUserToggle = (user: string) => {
    setActiveUser(user);
  };

  // Función para alternar la expansión de grupos de roles
  const toggleRoleExpansion = (roleName: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleName]: !prev[roleName]
    }));
  };

  // Función auxiliar para renderizar la lista de usuarios
  // Handler para eliminar usuario con confirmación personalizada
  // Estado para el diálogo de confirmación de borrado
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number, name: string, email: string } | null>(null);

  // Estado para el diálogo de confirmación de eliminación de rol
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string, name: string, usersCount: number } | null>(null);

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setUserToDelete({ id: user.id, name: user.name, email: user.email });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setActiveUser(prev => (prev === userToDelete.name ? null : prev));
        setSnackbar('Usuario eliminado exitosamente');
      } catch (error) {
        setSnackbar('Error al eliminar usuario');
      } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const cancelDeleteUser = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(parseInt(roleToDelete.id));
        setSnackbar('Rol eliminado correctamente');
      } catch (error) {
        setSnackbar('Error al eliminar rol');
      } finally {
        setDeleteRoleDialogOpen(false);
        setRoleToDelete(null);
      }
    }
  };

  const cancelDeleteRole = () => {
    setDeleteRoleDialogOpen(false);
    setRoleToDelete(null);
  };

  const renderUserList = () => {
    return Object.entries(filteredUsersByRole).map(([roleName, usersInRole]) => {
      const isExpanded = expandedRoles[roleName] ?? false; // Por defecto colapsado
      const userCount = usersInRole.length;
      
      return (
        <Box
          key={roleName}
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.06)',
            border: '1px solid #e3eafc',
            borderRadius: 2,
            mb: 2,
            overflow: 'hidden', // Para animaciones suaves
            boxShadow: 1,
          }}
        >
          {/* Header del grupo con botón de expansión/contracción */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              },
              transition: 'background-color 0.2s',
            }}
            onClick={() => toggleRoleExpansion(roleName)}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1565c0',
                letterSpacing: 0.5,
                fontSize: 14,
                textTransform: 'uppercase',
                flex: 1,
              }}
            >
              {roleName} ({userCount})
            </Typography>
            <IconButton size="small" sx={{ p: 0.5 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          {/* Lista de usuarios con animación de colapso */}
          {isExpanded && (
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {usersInRole.length === 0 ? (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    textAlign: 'center', 
                    py: 2, 
                    fontStyle: 'italic',
                    opacity: 0.7 
                  }}
                >
                  No hay usuarios asignados a este rol
                </Typography>
              ) : (
                usersInRole.map(user => {
                  // Buscar el usuario completo en el array de users
                  const fullUser = users.find(u => u.id === user.id);
                  if (!fullUser) return null;
                  const isInactive = fullUser.status === 'inactive';
                  return (
                    <ListItem key={user.id} dense disableGutters sx={{
                      backgroundColor: activeUser === user.name ? 'rgba(25, 118, 210, 0.13)' : 'inherit',
                      borderRadius: 1,
                      transition: 'background 0.2s',
                      opacity: isInactive ? 0.85 : 1,
                    }}>
                      <ListItemText
                        primary={
                          <span
                            style={{
                              cursor: isInactive ? 'not-allowed' : 'pointer',
                              fontWeight: activeUser === user.name ? 700 : 400,
                              color: isInactive ? '#e57373' : (activeUser === user.name ? '#1976d2' : undefined),
                              textDecoration: isInactive ? 'line-through' : (activeUser === user.name ? 'underline' : undefined),
                              letterSpacing: isInactive ? 1.5 : undefined,
                              background: isInactive ? 'rgba(255, 205, 210, 0.25)' : undefined,
                              borderRadius: isInactive ? 4 : undefined,
                              padding: isInactive ? '0 4px' : undefined,
                            }}
                            onClick={() => !isInactive && handleUserToggle(user.name)}
                          >
                            {user.name}
                          </span>
                        }
                      />
                      {/* Botón de editar usuario ahora se maneja en el modal UserManagement */}
                      <IconButton size="small" color="error" onClick={() => handleDeleteUser(fullUser.id)} title="Eliminar usuario">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </IconButton>
                    </ListItem>
                  );
                })
              )}
            </Box>
          )}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: isMobile ? 22 : 32, flex: 1 }}>
          Permissions Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined"
            color="primary" 
            startIcon={<GroupIcon />}
            onClick={() => setOpenUsersManagement(true)}
            sx={{ minWidth: 120 }}
          >
            Usuarios
          </Button>
          <Button 
            variant="outlined"
            color="secondary" 
            startIcon={<SecurityIcon />}
            onClick={() => setOpenRolesManagement(true)}
            sx={{ minWidth: 120 }}
          >
            Roles
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, minHeight: { xs: 400, md: '70vh' }, alignItems: 'stretch' }}>
        {/* Gestión de Usuarios por Rol */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, minWidth: { xs: 0, md: 220 }, maxWidth: { xs: '100%', md: 500 }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              User Permissions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              placeholder="Buscar usuario..."
              size="small"
              fullWidth
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <List dense sx={{ flex: 1, overflow: 'auto' }}>
              {renderUserList()}
            </List>
            
            {/* Resumen visual de permisos activos eliminado por requerimiento */}
          </Paper>
        </Box>

        {/* Module Permissions & Access Type per selected user */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 55%' }, minWidth: { xs: 0, md: 240 }, maxWidth: { xs: '100%', md: 'none' }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Permisos por Módulo
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {!activeUser ? (
              <Typography color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                Selecciona un usuario para configurar sus permisos de módulos.
              </Typography>
            ) : (
              (() => {
                // Buscar el usuario activo completo
                const activeUserObj = users.find(u => u.name === activeUser);
                const isInactive = activeUserObj?.status === 'inactive';
                const userRole = roles.find(r => r.id === activeUserObj?.roleId);
                const isUnassigned = userRole?.name.toLowerCase() === 'sin asignar' || userRole?.name.toLowerCase() === 'unassigned';
                const canEditPermissions = !isInactive && !isUnassigned;
                return (
                  <>
                    {isUnassigned && (
                      <Typography 
                        color="warning.main" 
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          bgcolor: 'warning.50', 
                          borderRadius: 1, 
                          fontSize: '0.9em',
                          border: '1px solid',
                          borderColor: 'warning.200'
                        }}
                      >
                        Este usuario está en el rol &quot;Sin asignar&quot; y solo puede ver sus permisos, no editarlos.
                      </Typography>
                    )}
                    <TextField
                      placeholder={`Buscar módulo para ${activeUser}...`}
                      size="small"
                      fullWidth
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      disabled={!canEditPermissions}
                    />
                    <List
                      dense
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        maxHeight: '100%',
                        overflow: 'auto',
                        border: '1px solid #eee',
                        borderRadius: 1,
                        opacity: !canEditPermissions ? 0.5 : 1,
                        pointerEvents: !canEditPermissions ? 'none' : 'auto',
                      }}
                    >
                      {filteredModules.length === 0 ? (
                        <ListItem>
                          <ListItemText primary="No modules found" sx={{ pl: 1, color: 'text.secondary' }} />
                        </ListItem>
                      ) : (
                        <>
                          <ListItem sx={{ bgcolor: 'grey.100', py: 0.5 }}>
                            <Checkbox
                              edge="start"
                              checked={filteredModules.every(module => userModulePermissions[activeUser]?.[module.code]?.enabled)}
                              indeterminate={filteredModules.some(module => userModulePermissions[activeUser]?.[module.code]?.enabled) && !filteredModules.every(module => userModulePermissions[activeUser]?.[module.code]?.enabled)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setUserModulePermissions(prev => {
                                  setPendingChanges(true);
                                  const updated = { ...prev[activeUser] };
                                  filteredModules.forEach(module => {
                                    updated[module.code] = { enabled: checked, type: checked ? 'Read' : (updated[module.code]?.type || 'Read'), permissionId: updated[module.code]?.permissionId };
                                  });
                                  return { ...prev, [activeUser]: updated };
                                });
                              }}
                              color="primary"
                              disabled={!canEditPermissions}
                            />
                            <ListItemText
                              primary={
                                <span>
                                  Seleccionar todos los módulos para{' '}
                                  <b>{activeUser}</b>
                                  {(() => {
                                    const userRole = users.find(u => u.name === activeUser);
                                    const roleName = roles.find(r => r.id === userRole?.roleId)?.name;
                                    return roleName ? (
                                      <span style={{ 
                                        color: '#666', 
                                        fontWeight: 'normal', 
                                        fontSize: '0.9em',
                                        marginLeft: '8px'
                                      }}>
                                        ({roleName})
                                      </span>
                                    ) : null;
                                  })()}
                                </span>
                              }
                              sx={{ minWidth: 120, fontWeight: 600 }}
                            />
                          </ListItem>
                          {filteredModules.map((module) => {
                            const perm = userModulePermissions[activeUser]?.[module.code] || { enabled: false, type: 'Read' };
                            return (
                              <ListItem
                                key={module.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  py: 1,
                                  bgcolor: perm.enabled ? 'primary.50' : undefined,
                                  borderLeft: perm.enabled ? '4px solid #1976d2' : undefined,
                                  transition: 'background 0.2s',
                                }}
                              >
                                <Checkbox
                                  edge="start"
                                  checked={perm.enabled}
                                  onChange={() => handleModuleToggle(activeUser, module.code)}
                                  color={perm.enabled ? 'primary' : 'default'}
                                  disabled={!canEditPermissions}
                                />
                                <ListItemText
                                  primary={module.name}
                                  sx={{ minWidth: 120, cursor: !canEditPermissions ? 'not-allowed' : 'pointer', userSelect: 'none', textDecoration: !canEditPermissions ? 'line-through' : undefined }}
                                  onClick={() => canEditPermissions && handleModuleToggle(activeUser, module.code)}
                                />
                                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                                  {rolePermissionTypes.map(type => {
                                    const isSelected = perm.type === type && perm.enabled;
                                    let chipColor: string | undefined = undefined;
                                    if (isSelected) {
                                      chipColor = type === 'Admin' ? '#f44336' : type === 'Delete' ? '#ff9800' : type === 'Write' ? '#1976d2' : '#2e7d32';
                                    }
                                    const vividColor = type === 'Admin' ? '#fff5f5' : type === 'Delete' ? '#fff3e0' : type === 'Write' ? '#f5fafd' : '#f5fcf7';
                                    const vividText = type === 'Admin' ? '#b71c1c' : type === 'Delete' ? '#ef6c00' : type === 'Write' ? '#1976d2' : '#2e7d32';
                                    return (
                                      <Tooltip key={type} title={type === 'Admin' ? 'Acceso total' : type === 'Delete' ? 'Puede eliminar' : type === 'Write' ? 'Puede editar' : 'Solo lectura'}>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 1.2,
                                            py: 0.5,
                                            borderRadius: 2,
                                            bgcolor: isSelected ? chipColor : (perm.enabled ? vividColor : undefined),
                                            color: isSelected ? '#fff' : (perm.enabled ? vividText : '#bdbdbd'),
                                            opacity: isSelected ? 1 : (perm.enabled ? 0.6 : 0.6),
                                            cursor: !canEditPermissions ? 'not-allowed' : (perm.enabled ? 'pointer' : 'not-allowed'),
                                            transition: 'background 0.2s, color 0.2s',
                                            minWidth: 80,
                                          }}
                                          onClick={canEditPermissions && perm.enabled ? () => handleModuleTypeChange(activeUser, module.code, type) : undefined}
                                        >
                                          <Checkbox
                                            checked={isSelected}
                                            disabled={!perm.enabled || !canEditPermissions}
                                            onChange={() => handleModuleTypeChange(activeUser, module.code, type)}
                                            icon={rolePermissionIcons[type as 'Admin' | 'Delete' | 'Write' | 'Read']}
                                            checkedIcon={rolePermissionIcons[type as 'Admin' | 'Delete' | 'Write' | 'Read']}
                                            sx={{
                                              p: 0.5,
                                              color: isSelected ? '#fff' : (perm.enabled ? vividText : '#bdbdbd'),
                                              '& .MuiSvgIcon-root': {
                                                color: isSelected ? '#fff' : (perm.enabled ? vividText : '#bdbdbd'),
                                              },
                                            }}
                                          />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              ml: 0.5,
                                              fontWeight: isSelected ? 700 : 400,
                                              color: isSelected ? '#fff' : (perm.enabled ? vividText : '#bdbdbd'),
                                              userSelect: 'none',
                                            }}
                                          >
                                            {type}
                                          </Typography>
                                        </Box>
                                      </Tooltip>
                                    );
                                  })}
                                </Box>
                              </ListItem>
                            );
                          })}
                        </>
                      )}
                    </List>
                  </>
                );
              })()
            )}
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={handleSave} disabled={!pendingChanges}>
          Guardar Cambios
        </Button>
      </Box>

      {/* Los modales de gestión de usuarios ahora son manejados por el componente UserManagement */}

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteUser}>
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar al usuario <b>{userToDelete?.name}</b> ({userToDelete?.email})?</Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Esta acción es permanente y no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteUser} color="primary">Cancelar</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar rol */}
      <Dialog open={deleteRoleDialogOpen} onClose={cancelDeleteRole}>
        <DialogTitle>Eliminar rol</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el rol <b>{roleToDelete?.name}</b>?</Typography>
          {roleToDelete && roleToDelete.usersCount > 0 && (
            <Typography color="warning.main" sx={{ mt: 1 }}>
              Este rol tiene <b>{roleToDelete.usersCount} usuario{roleToDelete.usersCount !== 1 ? 's' : ''}</b> asignado{roleToDelete.usersCount !== 1 ? 's' : ''}. 
              {roleToDelete.usersCount !== 1 ? ' Estos usuarios' : ' Este usuario'} pasará{roleToDelete.usersCount !== 1 ? 'n' : ''} a estar &quot;Sin asignar&quot;.
            </Typography>
          )}
          <Typography color="error" sx={{ mt: 1 }}>
            Esta acción es permanente y no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteRole} color="primary">Cancelar</Button>
          <Button onClick={confirmDeleteRole} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Gestión de Usuarios */}
      {openUsersManagement && (
        <UserManagement 
          isModal={true}
          onClose={handleCloseUsersManagement}
          showStats={false}
          title="Gestión de Usuarios"
        />
      )}

      {/* Modal de Gestión de Roles */}
      {openRolesManagement && (
        <RoleManagement 
          isModal={true}
          onClose={handleCloseRolesManagement}
          showStats={false}
          title="Gestión de Roles"
        />
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Permissions;
