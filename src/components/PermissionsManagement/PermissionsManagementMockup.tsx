import React, { useState, useMemo, useRef } from 'react';
import { Box, Typography, Paper, Checkbox, Button, Divider, TextField, List, ListItem, ListItemText, InputAdornment, Chip, Tooltip, Snackbar, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PermissionsManagementMockup: React.FC = () => {
  // Demo: lista de módulos
  // const [search, setSearch] = useState('');
  // const [checked, setChecked] = useState<string[]>([]);
  const modules = useMemo(() => [
    "Module A", "Module B", "Module C", "Module D", "Module E", "Module F", "Module G", "Module H", "Module I", "Module J"
  ], []);
  // Demo: lista de roles y usuarios agrupados por rol
  // const roleList = useMemo(() => [
  //   "Administrador", "Analista", "Reportes", "Soporte", "Invitado"
  // ], []);
  // Permisos posibles sobre cada rol (solo Edición y Viewer)
  const rolePermissionTypes = ["Edición", "Viewer"] as const;
  type PermissionType = typeof rolePermissionTypes[number];
  const rolePermissionIcons: Record<PermissionType, JSX.Element> = {
    "Edición": <Tooltip title="Puede editar"><EditIcon color="primary" fontSize="small" /></Tooltip>,
    Viewer: <Tooltip title="Solo lectura"><VisibilityIcon color="success" fontSize="small" /></Tooltip>,
  };
  // Cambios pendientes y deshacer
  const [pendingChanges, setPendingChanges] = useState(false);
  const lastPermissions = useRef<Record<string, Record<string, { enabled: boolean, type: string }>>>({});

  // Acciones de exportar e importar removidas temporalmente

  // Responsive
  const isMobile = useMediaQuery('(max-width:600px)');

  // Usuarios agrupados por rol (ejemplo)
  const usersByRole = useMemo(() => ({
    Administrador: ["Alice Smith", "Bob Johnson"],
    Analista: ["Charlie Lee", "Diana Prince", "Eve Adams"],
    Reportes: ["Frank Miller", "Grace Hopper"],
    Soporte: ["Henry Ford", "Ivy Clark"],
    Invitado: ["Jack Black"]
  }), []);
  type Role = keyof typeof usersByRole;
  const allRoles = useMemo(() => Object.keys(usersByRole) as Role[], [usersByRole]);

  // Module search and per-user permission state
  const [search, setSearch] = useState('');
  // userModulePermissions: { [user]: { [module]: { enabled: boolean, type: string } } }
  const [userModulePermissions, setUserModulePermissions] = useState<Record<string, Record<string, { enabled: boolean, type: string }>>>({});
  const filteredModules = useMemo(
    () => modules.filter(m => m.toLowerCase().includes(search.toLowerCase())),
    [modules, search]
  );
  const handleModuleToggle = (user: string, module: string) => {
    setUserModulePermissions(prev => {
      setPendingChanges(true);
      const prevType = prev[user]?.[module]?.type as PermissionType | undefined;
      return ({
        ...prev,
        [user]: {
          ...prev[user],
          [module]: {
            enabled: !(prev[user]?.[module]?.enabled),
            type: prevType || 'Viewer',
          }
        }
      });
    });
  };
  const handleModuleTypeChange = (user: string, module: string, type: PermissionType) => {
    setUserModulePermissions(prev => {
      setPendingChanges(true);
      return ({
        ...prev,
        [user]: {
          ...prev[user],
          [module]: {
            enabled: prev[user]?.[module]?.enabled ?? false,
            type,
          }
        }
      });
    });
  };

  // Bulk actions
  // Acciones por lote removidas temporalmente

  // Undo removido temporalmente
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Save
  const handleSave = () => {
    lastPermissions.current = JSON.parse(JSON.stringify(userModulePermissions));
    setPendingChanges(false);
    setSnackbar('Cambios guardados');
  };

  // User search and selection
  const [userSearch, setUserSearch] = useState('');
  // const [userChecked, setUserChecked] = useState<string[]>([]); // Eliminado: no se usa
  // Usuario activo para edición
  const [activeUser, setActiveUser] = useState<string | null>(null);
  // Agrupar usuarios filtrados por rol
  const filteredUsersByRole = useMemo(() => {
    const result: Partial<Record<Role, string[]>> = {};
    allRoles.forEach(role => {
      const filtered = usersByRole[role].filter((u: string) => u.toLowerCase().includes(userSearch.toLowerCase()));
      if (filtered.length > 0) result[role] = filtered;
    });
    return result;
  }, [usersByRole, allRoles, userSearch]);
  // handleUserToggle eliminado: no se usa en el código


  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontSize: isMobile ? 22 : 32 }}>
        Permissions Management
      </Typography>

      {/* Acciones de exportar, importar y deshacer removidas temporalmente */}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, minHeight: { xs: 400, md: '70vh' }, alignItems: 'stretch' }}>
        {/* User Level Permissions - grouped by role with search (now first) */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' }, minWidth: { xs: 0, md: 220 }, maxWidth: { xs: '100%', md: 400 }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              User Permissions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              placeholder="Buscar usuario o módulo..."
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
            <List
              dense
              sx={{
                flex: 1,
                minHeight: 0,
                maxHeight: '100%',
                overflow: 'auto',
                border: '1px solid #eee',
                borderRadius: 1,
              }}
            >
              {Object.keys(filteredUsersByRole).length === 0 ? (
                <ListItem>
                  <ListItemText primary="No users found" sx={{ pl: 1, color: 'text.secondary' }} />
                </ListItem>
              ) : (
                // Renderizar un array plano de elementos (sin flatMap)
                Object.entries(filteredUsersByRole)
                  .map(([role, users]) => {
                    const items: React.ReactNode[] = [
                      <ListItem key={`role-${role}`} sx={{ bgcolor: 'grey.100', py: 0.5 }}>
                        <ListItemText primary={role} primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }} />
                      </ListItem>
                    ];
                    items.push(...users.map(user => (
                      <ListItem
                        key={`user-${role}-${user}`}
                        disablePadding
                        sx={{
                          bgcolor: activeUser === user ? 'primary.main' : undefined,
                          color: activeUser === user ? '#fff' : undefined,
                          fontWeight: activeUser === user ? 700 : 400,
                          cursor: 'pointer',
                          transition: 'background 0.2s, color 0.2s',
                          boxShadow: activeUser === user ? 2 : undefined,
                          borderRadius: 1,
                        }}
                        onClick={() => setActiveUser(user)}
                      >
                        <ListItemText
                          primary={<span>{user}</span>}
                          sx={{ pl: 1, fontWeight: activeUser === user ? 700 : 400, color: activeUser === user ? '#fff' : undefined }}
                        />
                      </ListItem>
                    )));
                    return items;
                  })
                  .flat()
              )}
            </List>
            {/* Resumen visual de permisos activos */}
            {activeUser && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Resumen de permisos:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {Object.entries(userModulePermissions[activeUser] || {})
                    .filter(([, v]) => v.enabled)
                    .map(([mod, v]) => (
                      <Chip key={mod} label={`${mod} (${v.type})`} color={v.type === 'Edición' ? 'primary' : 'success'} size="small" icon={rolePermissionIcons[v.type as 'Edición' | 'Viewer']} />
                    ))}
                  {Object.values(userModulePermissions[activeUser] || {}).filter(v => v.enabled).length === 0 && (
                    <Chip label="Sin permisos asignados" size="small" />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Module Permissions & Access Type per selected user */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 58%' }, minWidth: { xs: 0, md: 240 }, maxWidth: { xs: '100%', md: 'none' }, width: { xs: '100%', md: 'auto' }, display: 'flex', flexDirection: 'column' }}>
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
              <>
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
                          checked={filteredModules.every(module => userModulePermissions[activeUser]?.[module]?.enabled)}
                          indeterminate={filteredModules.some(module => userModulePermissions[activeUser]?.[module]?.enabled) && !filteredModules.every(module => userModulePermissions[activeUser]?.[module]?.enabled)}
                          onChange={e => {
                            const checked = e.target.checked;
                            setUserModulePermissions(prev => {
                              setPendingChanges(true);
                              const updated = { ...prev[activeUser] };
                              filteredModules.forEach(module => {
                                updated[module] = { enabled: checked, type: updated[module]?.type || 'Viewer' };
                              });
                              return { ...prev, [activeUser]: updated };
                            });
                          }}
                          color="primary"
                        />
                        <ListItemText
                          primary={
                            <span>
                              Seleccionar todos los módulos para{' '}
                              <b>{activeUser}</b>
                            </span>
                          }
                          sx={{ minWidth: 120, fontWeight: 600 }}
                        />
                      </ListItem>
                      {filteredModules.map((module) => {
                        const perm = userModulePermissions[activeUser]?.[module] || { enabled: false, type: 'Viewer' };
                        // Visual feedback: highlight row if enabled, highlight selected permission
                        return (
                          <ListItem
                            key={module}
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
                              onChange={() => handleModuleToggle(activeUser, module)}
                              color={perm.enabled ? 'primary' : 'default'}
                            />
                            <ListItemText primary={module} sx={{ minWidth: 120 }} />
                            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                              {rolePermissionTypes.map(type => {
                                const isSelected = perm.type === type && perm.enabled;
                                let chipColor: string | undefined = undefined;
                                if (isSelected) {
                                  chipColor = type === 'Edición' ? '#1976d2' : '#2e7d32';
                                }
                                // Even lighter style for unselected but enabled permissions
                                const vividColor = type === 'Edición' ? '#f5fafd' : '#f5fcf7';
                                const vividText = type === 'Edición' ? '#1976d2' : '#2e7d32';
                                return (
                                  <Tooltip key={type} title={type === 'Edición' ? 'Puede editar' : 'Solo lectura'}>
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
                                        cursor: perm.enabled ? 'pointer' : 'not-allowed',
                                        transition: 'background 0.2s, color 0.2s',
                                        minWidth: 80,
                                      }}
                                      onClick={perm.enabled ? () => handleModuleTypeChange(activeUser, module, type as PermissionType) : undefined}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        disabled={!perm.enabled}
                                        onChange={() => handleModuleTypeChange(activeUser, module, type as PermissionType)}
                                        icon={rolePermissionIcons[type]}
                                        checkedIcon={rolePermissionIcons[type]}
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
            )}
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={handleSave} disabled={!pendingChanges}>
          Guardar Cambios
        </Button>
      </Box>

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

export default PermissionsManagementMockup;
