import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { SettingsOutlined } from '@mui/icons-material';
import { usePermissionsApi } from '../../hooks/usePermissionsApi';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { ReadOnlyBanner } from '../../components/ui';
import { ADMIN_MODULES } from '../../services/businessRulesService';

/**
 * BusinessRulesManager component
 * This is a placeholder component for future development
 * It will provide a UI to configure and manage business rules
 */
const BusinessRulesManager: React.FC = () => {
  const { modules } = usePermissionsApi();
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['admin']?.type === 'Edit';
  const [open, setOpen] = React.useState(false);
  const [adminModules, setAdminModules] = React.useState<string[]>(ADMIN_MODULES);

  const handleToggleModule = (moduleCode: string) => {
    if (adminModules.includes(moduleCode)) {
      setAdminModules(adminModules.filter(mod => mod !== moduleCode));
    } else {
      setAdminModules([...adminModules, moduleCode]);
    }
  };

  const handleSave = () => {
    // Here we would save the configuration to the backend
    // For now, just close the dialog
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Business Rules Management
      </Typography>
      
      {/* Read Only Banner */}
      {!canEdit && <ReadOnlyBanner />}
      
      <Typography variant="body1" paragraph>
        This page allows you to configure the business rules that govern how permissions
        and other aspects of the system behave. This is a placeholder for future development.
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Automatic Permission Assignment Rules" 
          avatar={<SettingsOutlined />}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            When a user&apos;s role changes, permissions can be automatically adjusted based on rules.
            Currently implemented rule: Users assigned to administrator role automatically receive
            permissions to admin modules.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpen(true)}
            sx={{ mt: 2 }}
            disabled={!canEdit}
          >
            Configure Admin Module Rules
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogTitle>Configure Admin Modules</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select which modules should be automatically assigned to users with administrator role.
            Users who are changed to administrator role will get access to these modules.
            Users demoted from administrator role will lose access to these modules.
          </Typography>
          
          <List>
            {modules.map(module => (
              <ListItem key={module.id} divider>
                <ListItemText 
                  primary={module.name} 
                  secondary={module.code} 
                />
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={adminModules.includes(module.code.toUpperCase())} 
                      onChange={() => handleToggleModule(module.code.toUpperCase())} 
                    />
                  }
                  label="Admin Module"
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      
      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          Future Enhancements
        </Typography>
        <Typography variant="body2">
          • Role-based default permission templates
          <br />
          • Custom permission inheritance rules
          <br />
          • Workflow automation for approval processes
          <br />
          • Scheduled permission auditing
        </Typography>
      </Paper>
    </Box>
  );
};

export default BusinessRulesManager;
