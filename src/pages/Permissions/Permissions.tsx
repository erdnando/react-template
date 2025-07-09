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
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import { Global } from '@emotion/react';
import { usePermissionsApi } from '../../hooks/usePermissionsApi';
import { UserManagement, RoleManagement } from '../../components/common';
import { ReadOnlyBanner, ModuleHeader } from '../../components/ui';
import { getOrderedModules, groupModules } from '../../utils/moduleMenuOrder';

import { useUserPermissions } from '../../hooks/useUserPermissions';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_MODULES } from '../../services/businessRulesService';

interface PermissionsProps {
  refreshPermissions?: () => Promise<void>;
}

const Permissions: React.FC<PermissionsProps> = ({ refreshPermissions }) => {
  // Use the API hook instead of local state
  const {
    users,
    roles,
    modules,
    modulesVersion,
    userModulePermissions,
    loading,
    error,
    deleteRole,
    saveUserPermissions,
    setUserModulePermissions,
    loadData // Asegurarse de que loadData esté disponible
  } = usePermissionsApi();
  const userPermissions = useUserPermissions();
  
  // Fix: Check if current user is an admin (by role) rather than just permissions on 'permissions' module
  // This ensures all admin users can edit permissions for other users
  const { user: currentUser } = useAuth();
  const currentUserObj = users.find(u => u.id === Number(currentUser?.id));
  const currentUserRole = roles.find(r => r.id === currentUserObj?.roleId);
  const isCurrentUserAdmin = currentUserRole && (
    currentUserRole.name.trim().toLowerCase() === 'administrador' || 
    currentUserRole.name.trim().toLowerCase() === 'admin'
  );
  
  // Allow editing if user is admin OR has explicit edit permission on permissions module
  const canEdit = isCurrentUserAdmin || userPermissions['permissions']?.type === 'Edit';
  // Estados para modales de gestión
  const [openUsersManagement, setOpenUsersManagement] = useState(false);
  const [openRolesManagement, setOpenRolesManagement] = useState(false);

  // Estados para gestión de permisos
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastPermissions = useRef<Record<string, Record<string, { enabled: boolean, type: string }>>>({});
  const isMobile = useMediaQuery('(max-width:600px)');
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  // Solo un usuario puede estar seleccionado
  const [activeUser, setActiveUser] = useState<number | null>(null);
  // Estado para controlar qué grupos de roles están expandidos
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  // Agrupar usuarios por rol
  const usersByRole = useMemo(() => {
    const grouped: Record<string, { id: number, name: string }[]> = {};
    // Inicializar todos los roles, incluso si no tienen usuarios
    roles.forEach((role: { name: string; id: number }) => {
      grouped[role.name] = users.filter((u: { roleId: number }) => u.roleId === role.id);
    });
    return grouped;
  }, [roles, users]);

  // Inicializar grupos colapsados por defecto
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    // Ordenar roles: todos excepto 'SIN ASIGNAR', luego 'SIN ASIGNAR' al final
    const sortedRoles = [...roles].sort((a, b) => {
      const aUnassigned = a.name.trim().toLowerCase() === 'sin asignar' || a.name.trim().toLowerCase() === 'unassigned';
      const bUnassigned = b.name.trim().toLowerCase() === 'sin asignar' || b.name.trim().toLowerCase() === 'unassigned';
      if (aUnassigned && !bUnassigned) return 1;
      if (!aUnassigned && bUnassigned) return -1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    sortedRoles.forEach(role => {
      initialExpanded[role.name] = false;
    });
    setExpandedRoles(initialExpanded);
  }, [roles]);

  // allRoles: ordena igual, 'SIN ASIGNAR' al final
  const allRoles = useMemo(() => {
    const sorted = [...roles].sort((a: { name: string }, b: { name: string }) => {
      const aUnassigned = a.name.trim().toLowerCase() === 'sin asignar' || a.name.trim().toLowerCase() === 'unassigned';
      const bUnassigned = b.name.trim().toLowerCase() === 'sin asignar' || b.name.trim().toLowerCase() === 'unassigned';
      if (aUnassigned && !bUnassigned) return 1;
      if (!aUnassigned && bUnassigned) return -1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return sorted.map((r: { name: string }) => r.name);
  }, [roles]);
  

  // Filtrado de usuarios por rol y búsqueda
  const filteredUsersByRole = useMemo(() => {
    const result: Record<string, { id: number, name: string }[]> = {};
    allRoles.forEach((roleName: string) => {
      const usersInRole = usersByRole[roleName] || [];
      const filtered = usersInRole.filter((u: { name: string }) => u.name.toLowerCase().includes(userSearch.toLowerCase()));
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
  const handleSave = async () => {
    try {
      if (activeUser !== null) {
        // --- ENFORCE ADMIN RULE BEFORE SAVE ---
        const activeUserObj = users.find(u => u.id === activeUser);
        const userRole = roles.find(r => r.id === activeUserObj?.roleId);
        const isAdmin = userRole && (userRole.name.toLowerCase() === 'administrador' || userRole.name.toLowerCase() === 'admin');
        let permsToSave = userModulePermissions[String(activeUser)] || {};
        if (isAdmin) {
          const permisosModule = modules.find(m => m.code.toLowerCase() === 'permisos');
          if (permisosModule) {
            permsToSave = {
              ...permsToSave,
              [permisosModule.code]: { enabled: true, type: 'Edit' }
            };
          }
        }
        await saveUserPermissions(String(activeUser), permsToSave);
        // Reload data from backend to reflect latest state
        await loadData();
        if (refreshPermissions) {
          await refreshPermissions(); // Refresh global permissions for sidebar/menu
        }
        lastPermissions.current = JSON.parse(JSON.stringify(userModulePermissions));
        setPendingChanges(false);
        setSnackbar('Cambios guardados exitosamente');
      }
    } catch (error) {
      setSnackbar('Error al guardar cambios');
    }
  };

  // Selección única de usuario
  const handleUserToggle = (userId: number) => {
    setActiveUser(userId);
  };

  // Función para alternar la expansión de grupos de roles (solo uno expandido a la vez)
  const toggleRoleExpansion = (roleName: string) => {
    setExpandedRoles(prev => {
      const isCurrentlyExpanded = !!prev[roleName];
      // Si ya está expandido, colapsar todos
      if (isCurrentlyExpanded) {
        const collapsed: Record<string, boolean> = {};
        Object.keys(prev).forEach(key => { collapsed[key] = false; });
        return collapsed;
      }
      // Si no está expandido, expandir solo este y colapsar los demás
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => { newState[key] = false; });
      newState[roleName] = true;
      return newState;
    });
  };

  // Función auxiliar para renderizar la lista de usuarios
  // Estado para el diálogo de confirmación de eliminación de rol
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string, name: string, usersCount: number } | null>(null);

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
    return Object.entries(filteredUsersByRole).map(([roleName, usersInRole]: [string, { id: number, name: string }[]]) => {
      const isExpanded = expandedRoles[roleName] ?? false;
      const userCount = usersInRole.length;
      const isUnassigned = roleName.trim().toLowerCase() === 'sin asignar' || roleName.trim().toLowerCase() === 'unassigned';
      // Icono de grupo según el rol
      let groupIcon = <GroupIcon sx={{ fontSize: 22, color: '#1976d2', mr: 1 }} />;
      if (roleName.toLowerCase().includes('admin')) groupIcon = <ShieldIcon sx={{ fontSize: 22, color: '#d32f2f', mr: 1 }} />;
      if (isUnassigned) groupIcon = <PersonIcon sx={{ fontSize: 22, color: '#757575', mr: 1 }} />;
      return (
        <Box
          key={roleName}
          sx={{
            background: isExpanded ? 'linear-gradient(90deg, #e3f2fd 0%, #f5faff 100%)' : 'rgba(25, 118, 210, 0.04)',
            border: '1.5px solid #e3eafc',
            borderRadius: 2,
            mb: 2,
            overflow: 'hidden',
            boxShadow: isExpanded ? 2 : 0,
            transition: 'box-shadow 0.2s, background 0.2s',
          }}
        >
          {/* Header del grupo con icono, nombre y chip de cantidad */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              cursor: 'pointer',
              background: isExpanded ? 'rgba(25, 118, 210, 0.09)' : 'transparent',
              borderBottom: isExpanded ? '1.5px solid #bbdefb' : 'none',
              '&:hover': { background: 'rgba(25, 118, 210, 0.13)' },
              transition: 'background 0.2s',
            }}
            onClick={() => toggleRoleExpansion(roleName)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {groupIcon}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600, // menos pesado
                  color: isUnassigned ? '#333a40' : '#1565c0',
                  letterSpacing: '0.1px',
                  fontSize: '15px', // más pequeño, igual que menú lateral
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {roleName}
              </Typography>
              <Chip label={userCount} size="small" sx={{ ml: 1, bgcolor: '#e3eafc', color: '#1976d2', fontWeight: 700, fontSize: 13 }} />
            </Box>
            <IconButton size="small" sx={{ p: 0.5 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          {/* Lista de usuarios con animación de colapso */}
          {isExpanded && (
            <Box sx={{ px: 2, pb: 2, pt: 1, transition: 'all 0.2s' }}>
              {usersInRole.length === 0 ? (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ textAlign: 'center', py: 2, fontStyle: 'italic', opacity: 0.7 }}
                >
                  No hay usuarios asignados a este rol
                </Typography>
              ) : (
                usersInRole.map((user: { id: number; name: string }) => {
                  const fullUser = users.find((u: { id: number }) => u.id === user.id);
                  if (!fullUser) return null;
                  const isInactive = fullUser.status === 'inactive';
                  return (
                    <ListItem key={user.id} dense disableGutters sx={{
                      backgroundColor: activeUser === user.id ? '#e3f2fd' : '#fff',
                      borderRadius: 2,
                      boxShadow: 0, // sin sombra
                      mb: 1.2,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      opacity: isInactive ? 0.7 : 1,
                      border: activeUser === user.id ? '1.5px solid #1976d2' : '1.5px solid #e3eafc', // borde azul sutil
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5, // Reducido para acercar el botón al avatar
                      py: 1,
                      px: 0.5, // Reducido para acercar el contenido a la izquierda
                      '&:hover': { boxShadow: 1, background: 'rgba(25, 118, 210, 0.07)' },
                    }}>
                      <Avatar sx={{
                        bgcolor: activeUser === user.id ? '#1976d2' : '#f5faff', // azul fuerte si está seleccionado, claro si no
                        color: activeUser === user.id ? '#fff' : '#1976d2', // blanco si seleccionado, azul si no
                        fontWeight: 700,
                        width: 32,
                        height: 32,
                        fontSize: 17,
                        mr: 1,
                        border: activeUser === user.id ? '2px solid #1976d2' : '2px solid #e3eafc',
                        transition: 'border 0.2s, background 0.2s, color 0.2s',
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Button
                        fullWidth
                        variant="text"
                        color="primary"
                        size="large"
                        sx={{
                          fontWeight: 600, // igual que menú lateral
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          borderRadius: 2,
                          background: 'none',
                          color: '#1976d2',
                          px: 1, // Reducido para acercar el botón a la izquierda
                          py: 1.1,
                          fontSize: '15px', // igual que menú lateral
                          letterSpacing: '0.1px',
                          boxShadow: 0,
                          opacity: isInactive ? 0.5 : 1,
                          pointerEvents: isInactive ? 'none' : 'auto',
                          border: 'none',
                          '&:hover': {
                            background: 'rgba(25, 118, 210, 0.08)',
                          },
                        }}
                        onClick={() => !isInactive && handleUserToggle(user.id)}
                        disabled={isInactive}
                      >
                        {user.name}
                      </Button>
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

  // Inicializar permisos de módulos para el usuario activo
  React.useEffect(() => {
    if (activeUser === null || modules.length === 0) return;
    setUserModulePermissions((prev) => {
      const current = prev[activeUser] || {};
      let changed = false;
      const updated = { ...current };
      // Asegura que todos los módulos estén presentes
      modules.forEach(module => {
        if (!updated[module.code]) {
          updated[module.code] = { enabled: false, type: 'ReadOnly' };
          changed = true;
        }
      });
      // Elimina módulos que ya no existen
      Object.keys(updated).forEach(code => {
        if (!modules.find(m => m.code === code)) {
          delete updated[code];
          changed = true;
        }
      });
      // Si hay cambios o el usuario no tenía permisos, actualiza
      if (changed || !prev[activeUser]) {
        return { ...prev, [activeUser]: updated };
      }
      return prev;
    });
  }, [activeUser, modulesVersion]);

  // Cargar datos al montar el componente
  React.useEffect(() => {
    // Llama a la función de carga de datos del hook
    if (typeof loadData === 'function') {
      loadData();
    }
  }, []);

  // Agrupa los módulos igual que el menú lateral
  const groupedModules = useMemo(() => groupModules(getOrderedModules(modules)), [modules, modulesVersion]);

  // Elimina orderedModules y usa groupedModules en el render
  // Diccionario para traducir nombres de grupo a títulos visibles
  const groupTitles: Record<string, string> = {
    main: 'Principal',
    work: 'Operación',
    admin: 'Administración',
    others: 'Otros',
  };

  // --- Add this before the return statement ---
  let modulePermissionsContent: React.ReactNode = null;
  if (activeUser) {
    const activeUserObj = users.find(u => u.id === activeUser);
    const isInactive = activeUserObj?.status === 'inactive';
    const userRole = roles.find(r => r.id === activeUserObj?.roleId);
    const isUnassigned = userRole?.name.toLowerCase() === 'sin asignar' || userRole?.name.toLowerCase() === 'unassigned';
    const canEditPermissions = canEdit && !isInactive && !isUnassigned;

    modulePermissionsContent = (
      <>
        {isUnassigned && (
          <Typography 
            color="warning.main" 
            sx={{ mb: 2, p: 1.5, bgcolor: 'warning.50', borderRadius: 1, fontSize: '0.9em', border: '1px solid', borderColor: 'warning.200' }}
          >
            Este usuario está en el rol &quot;Sin asignar&quot; y solo puede ver sus permisos, no editarlos. Asegurese de incluirlo en un rol!
          </Typography>
        )}
        <TextField
          placeholder={`Buscar módulo para ${activeUserObj?.name || ''}...`}
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
            opacity: 1,
            pointerEvents: 'auto',
            background: '#fafbfc',
          }}
        >
          {Object.entries(groupedModules).map(([groupName, modulesInGroup]) => {
            const filteredModules = modulesInGroup.filter(module =>
              module.name.toLowerCase().includes(search.toLowerCase()) ||
              module.code.toLowerCase().includes(search.toLowerCase())
            );
            if (filteredModules.length === 0) return null;
            // Group is determined by the groupName
            return (
              <React.Fragment key={groupName}>
                <ListItem disablePadding sx={{ bgcolor: '#fff', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ pl: 1, fontWeight: 700, color: '#333', fontSize: 17, letterSpacing: 0.5 }}>
                        {groupTitles[groupName] || groupName}
                      </Typography>
                    }
                  />
                </ListItem>
                {filteredModules.map((module) => {
                  const perm = userModulePermissions[String(activeUser)]?.[module.code];
                  // Only lock specific admin modules for admin users (not all modules in the admin group)
                  const activeUserObj = users.find(u => u.id === activeUser);
                  const userRole = roles.find(r => r.id === activeUserObj?.roleId);
                  const isAdmin = userRole && (userRole.name.trim().toLowerCase() === 'administrador' || userRole.name.trim().toLowerCase() === 'admin');
                  
                  // Check if this module is in the ADMIN_MODULES array, comparing case-insensitively
                  const moduleCodeUpper = module.code.toUpperCase();
                  // Enhanced debugging for Permisos module
                  if (module.name.toLowerCase().includes('permisos') || module.code.toLowerCase().includes('permisos')) {
                    // Debug logging removed for production
                  }
                  
                  // Detección mejorada de módulos administrativos (check both code and name)
                  const adminLock = isAdmin && ADMIN_MODULES.some(adminModule => {
                    const adminModuleUpper = adminModule.toUpperCase();
                    const moduleNameUpper = module.name.toUpperCase();
                    
                    // Check both module code and name for better matching
                    const isMatch = moduleCodeUpper === adminModuleUpper || 
                                   moduleNameUpper === adminModuleUpper ||
                                   // Special cases for Spanish/English variations
                                   (moduleNameUpper.includes('PERMISOS') && adminModuleUpper.includes('PERMISOS')) ||
                                   (moduleNameUpper.includes('PERMISSIONS') && adminModuleUpper.includes('PERMISSIONS')) ||
                                   (moduleNameUpper.includes('ADMIN') && moduleNameUpper.includes('UTILITIES') && adminModuleUpper.includes('ADMIN') && adminModuleUpper.includes('UTILITIES'));
                    
                    if (isMatch) {
                      // Debug logging removed for production
                    }
                    return isMatch;
                  });
                  
                  // Additional debug for Permisos - debug logging removed for production
                  // --- UI ENFORCEMENT: For admins, always show checked and Edit for all admin group modules ---
                  // Para módulos administrativos bloqueados: siempre checked y tipo Edit
                  const checked = adminLock ? true : (perm?.enabled || false);
                  const type = adminLock ? 'Edit' : (perm?.type || 'ReadOnly');
                  
                  // Para módulos NO administrativos con usuarios administradores: permitir edición
                  // Si es un módulo admin y el usuario es admin: deshabilitar (true)
                  // Si el usuario no tiene permisos de edición general: deshabilitar (true)
                  // En cualquier otro caso: habilitar (false)
                  
                  // Ahora solo usamos adminLock que ya incluye todos los módulos administrativos
                  // No necesitamos una verificación separada para módulos especiales
                  
                  // Modificación clave: solo deshabilitar si es un módulo admin bloqueado
                  const forceDisabled = adminLock ? true : !canEditPermissions;
                  return (
                    <ListItem
                      key={module.id}
                      disableGutters
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0,
                        p: 0,
                        background: checked ? '#f5faff' : '#fff',
                        borderRadius: 0.5,
                        boxShadow: 'none',
                        borderBottom: '1px solid #e0e0e0',
                        borderLeft: checked ? '3px solid #1976d2' : '3px solid #e0e0e0',
                        transition: 'border-color 0.2s, background 0.2s',
                        opacity: forceDisabled ? 0.7 : 1,
                        pointerEvents: forceDisabled ? 'none' : 'auto',
                        minHeight: 56,
                        pl: 2.5,
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={checked}
                        disabled={forceDisabled}
                        onChange={e => {
                          if (forceDisabled) return;
                          setUserModulePermissions(prev => {
                            const updated = { ...prev };
                            if (!updated[String(activeUser)]) return prev;
                            updated[String(activeUser)] = { ...updated[String(activeUser)] };
                            updated[String(activeUser)][module.code] = {
                              ...updated[String(activeUser)][module.code],
                              enabled: e.target.checked,
                              type: e.target.checked ? (perm?.type === 'None' ? 'ReadOnly' : perm?.type || 'ReadOnly') : 'None',
                            };
                            return updated;
                          });
                          setPendingChanges(true);
                        }}
                        sx={{ mr: 2, p: 0.5, ml: 0.5 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: checked ? '#1976d2' : '#222',
                          flex: 1,
                          fontSize: '15px',
                          letterSpacing: '0.1px',
                          transition: 'color 0.2s',
                          pr: 2,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {module.name}
                        {/* Verificación especial para módulos administrativos (USERS, ROLES, PERMISOS, ADMIN_UTILITIES) */}
                        {adminLock && (
                          <Tooltip title="Los administradores siempre deben tener acceso de edición a este módulo central de administración. No es posible modificar estos permisos para rol de administrador.">
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <WarningAmberIcon color="warning" sx={{ ml: 1, fontSize: 18, verticalAlign: 'middle' }} />
                              <span style={{ color: 'red', fontWeight: 700, marginLeft: 8 }}>[ADMIN CORE MODULE]</span>
                            </span>
                          </Tooltip>
                        )}
                        {/* Módulos que pueden ser editados por administradores (no administrativos) */}
                        {isAdmin && !adminLock && (
                          <Tooltip title="Este módulo puede ser modificado incluso para usuarios administradores.">
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <span style={{ color: '#1976d2', fontSize: 14, marginLeft: 8, fontStyle: 'italic' }}>[Editable]</span>
                            </span>
                          </Tooltip>
                        )}
                      </Typography>
                      {checked && (
                        <ToggleButtonGroup
                          exclusive
                          size="small"
                          value={type}
                          onChange={(_, value) => {
                            if (forceDisabled) return;
                            setUserModulePermissions(prev => {
                              const updated = { ...prev };
                              if (!updated[String(activeUser)]) return prev;
                              updated[String(activeUser)] = { ...updated[String(activeUser)] };
                              updated[String(activeUser)][module.code] = {
                                ...updated[String(activeUser)][module.code],
                                type: value as 'Edit' | 'ReadOnly',
                              };
                              return updated;
                            });
                            setPendingChanges(true);
                          }}
                          sx={{ ml: 1, minWidth: 80, background: 'none', boxShadow: 'none', border: 'none', pointerEvents: forceDisabled ? 'none' : 'auto', opacity: forceDisabled ? 0.6 : 1 }}
                          disabled={forceDisabled}
                        >
                          <ToggleButton value="Edit" disabled={forceDisabled} sx={{ p: 0.5, border: 'none', minWidth: 32 }}>
                            <Tooltip title="Edición"><EditIcon fontSize="small" color={type === 'Edit' ? 'primary' : 'action'} /></Tooltip>
                          </ToggleButton>
                          <ToggleButton value="ReadOnly" disabled={forceDisabled} sx={{ p: 0.5, border: 'none', minWidth: 32 }}>
                            <Tooltip title="Solo lectura"><VisibilityIcon fontSize="small" color={type === 'ReadOnly' ? 'primary' : 'action'} /></Tooltip>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    </ListItem>
                  );
                })}
              </React.Fragment>
            );
          })}
        </List>
      </>
    );
  }

  // --- ENFORCE ADMIN RULE: always force all admin modules to enabled+Edit for admins ---
  React.useEffect(() => {
    if (!activeUser) return;
    const activeUserObj = users.find(u => u.id === activeUser);
    if (!activeUserObj) return;
    const userRole = roles.find(r => r.id === activeUserObj.roleId);
    const userIsAdmin = userRole && (userRole.name.toLowerCase() === 'administrador' || userRole.name.toLowerCase() === 'admin');
    if (!userIsAdmin) return;
    
    setUserModulePermissions(prev => {
      const updated = { ...prev };
      if (!updated[String(activeUserObj.id)]) return prev;
      updated[String(activeUserObj.id)] = { ...updated[String(activeUserObj.id)] };
      
      // Force all admin modules to enabled+Edit for admins
      modules.forEach(module => {
        if (!module.code) return;
        
        // Check if this is an admin module (case-insensitive) with simplified detection
        const moduleCodeUpper = module.code.toUpperCase();
        const isAdminModule = ADMIN_MODULES.some(adminModule => {
          const adminModuleUpper = adminModule.toUpperCase();
          return moduleCodeUpper === adminModuleUpper;
        });
        
        if (isAdminModule) {
          updated[String(activeUserObj.id)][module.code] = { enabled: true, type: 'Edit' };
        // Admin permission enforcement - debug logging removed for production
        }
        
        // Also ensure that all non-admin modules are editable for admins
        if (!isAdminModule) {
          // Mantenemos el estado actual pero nos aseguramos de que sea editable si está activado
          const currentState = updated[String(activeUserObj.id)][module.code];
          if (currentState && currentState.enabled) {
            updated[String(activeUserObj.id)][module.code] = { 
              enabled: currentState.enabled, 
              type: currentState.type || 'Edit'
            };
          // Non-admin module editable enforcement - debug logging removed for production
          }
        }
      });
      
      return updated;
    });
  }, [activeUser, users, roles, modules, setUserModulePermissions]);

  return (
    <>
      <Global styles={`
        @keyframes pulseWarn {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `} />
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

      {/* Read Only Banner */}
      {!canEdit && <ReadOnlyBanner />}

      <ModuleHeader
        title="Permissions Management"
        subtitle="Assign and manage user permissions for all modules"
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, minHeight: { xs: 400, md: '70vh' }, alignItems: 'stretch' }}>
        {/* Gestión de Usuarios por Rol */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, minWidth: { xs: 0, md: 220 }, maxWidth: { xs: '100%', md: 500 }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 'none', borderRadius: 1, border: '1px solid #e0e0e0', background: '#fff' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#222' }}>
              Roles
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
          </Paper>
        </Box>

        {/* Module Permissions & Access Type per selected user */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 55%' }, minWidth: { xs: 0, md: 240 }, maxWidth: { xs: '100%', md: 'none' }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 'none', borderRadius: 1, border: '1px solid #e0e0e0', background: '#fff' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#222' }}>
              Permisos por Módulo
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {!activeUser ? (
              <Typography color="text.secondary" sx={{ mt: 2, mb: 2 }}>
                Selecciona un usuario para configurar sus permisos de módulos.
              </Typography>
            ) : (
              <>
                {/* ReadOnlyBanner se muestra aquí si el usuario está inactivo o es sin asignar */}
                {(users.find(u => u.id === activeUser)?.status === 'inactive' || 
                  roles.find(r => r.id === users.find(u => u.id === activeUser)?.roleId)?.name.toLowerCase() === 'sin asignar') && (
                  <ReadOnlyBanner 
                    message="Este usuario está inactivo o sin asignar. Solo se pueden ver los permisos, no editarlos."
                    sx={{ mb: 2 }}
                  />
                )}
                {modulePermissionsContent}
              </>
            )}
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          sx={{
            mx: 1,
            px: 4,
            py: 1.5,
            borderRadius: 1,
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.1rem' },
            boxShadow: 'none',
            textTransform: 'none',
            letterSpacing: 0.5,
            background: '#1976d2',
            '&:hover': {
              background: '#1565c0',
            },
            minWidth: 180,
          }}
          onClick={handleSave}
          disabled={!pendingChanges}
        >
          Guardar Cambios
        </Button>
      </Box>

      {/* Los modales de gestión de usuarios ahora son manejados por el componente UserManagement */}

      {/* Diálogo de confirmación para eliminar rol */}
      <Dialog open={deleteRoleDialogOpen} onClose={cancelDeleteRole}>
        <DialogTitle>Eliminar rol</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar el rol <strong>{roleToDelete?.name}</strong>?</Typography>
          {roleToDelete && roleToDelete.usersCount > 0 && (
            <Typography color="warning.main" sx={{ mt: 1 }}>
              Este rol tiene <strong>{roleToDelete.usersCount} usuario{roleToDelete.usersCount !== 1 ? 's' : ''} asignado{roleToDelete.usersCount !== 1 ? 's' : ''}</strong>.
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
    </>
  );
};

export default Permissions;