import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPasswordResetManagement } from '../AdminPasswordResetManagement';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { 
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { 
  ReadOnlyBanner,
  ModuleLayout,
  SectionCard,
  ModuleHeader
} from '../../components/ui';

// Tab configuration
type AdminTab = {
  id: string;
  label: string;
  component: React.ReactNode;
};

const ADMIN_TABS: AdminTab[] = [
  {
    id: 'password-reset',
    label: 'Password Reset Management',
    component: <AdminPasswordResetManagement />
  },
  // Additional tabs can be added here in the future
  // Example:
  // {
  //   id: 'user-activity',
  //   label: 'User Activity Logs',
  //   component: <AdminUserActivityLogs />
  // },
];

const AdminUtils: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(ADMIN_TABS[0].id);
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['admin_utils']?.type === 'Edit';
  const isReadOnly = !canEdit;

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Find the active tab component
  const activeTabComponent = ADMIN_TABS.find(tab => tab.id === activeTab)?.component;
  
  // Admin utilities statistics
  const totalTools = ADMIN_TABS.length + 1; // +1 for business rules
  const accessType = isReadOnly ? 'Read Only' : 'Full Access';
  const accessColor = isReadOnly ? "warning" : "success";

  return (
    <ModuleLayout>
      {/* Read Only Banner */}
      {isReadOnly && <ReadOnlyBanner />}

      <ModuleHeader 
        title="Administration Utilities"
        subtitle="Manage system configuration and administrative tasks"
      />
      
      {/* Stats Overview - Homologado con el estilo del módulo Users */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(2, 1fr)' 
          }, 
          gap: { xs: 1.5, md: 2 }, 
          mb: 3 
        }}
      >
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Total Tools
            </Typography>
            <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
              {totalTools}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Access Type
            </Typography>
            <Typography variant="h5" color={`${accessColor}.main`} sx={{ fontSize: '1.5rem' }}>
              {accessType}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      
      {/* Business Rules Management Card */}
      <SectionCard 
        title="Business Rules Management"
        sx={{ mb: 4 }}
      >
        <Box sx={{ p: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 500, 
              color: 'text.primary',
              fontSize: '1.1rem',
              mb: 1
            }}>
              System Behavior Configuration
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
              Configure system behavior rules including automatic permission assignment 
              when user roles change.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              to="/admin/business-rules"
              sx={{ 
                textTransform: 'none', 
                px: 3, 
                py: 1,
                fontSize: '0.95rem',
                fontWeight: 500,
                boxShadow: (theme) => theme.shadows[2],
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
              disabled={isReadOnly}
              startIcon={<SettingsIcon />}
            >
              Manage Business Rules
            </Button>
          </Box>
        </Box>
      </SectionCard>
      
      {/* Tab Navigation */}
      <SectionCard title="Administrative Tools">
        <Box sx={{ width: '100%' }}>
          {/* Tab Navigation */}
          <Box sx={{ 
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            mb: 3,
            px: 2,
            pt: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {ADMIN_TABS.map(tab => (
              <Button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                variant={activeTab === tab.id ? 'text' : 'text'}
                color={activeTab === tab.id ? 'primary' : 'inherit'}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  mb: 0,
                  px: 2,
                  py: 1.5,
                  borderBottom: '2px solid',
                  borderRadius: 0,
                  borderColor: activeTab === tab.id ? 'primary.main' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    borderColor: activeTab === tab.id ? 'primary.main' : 'action.hover',
                    color: activeTab === tab.id ? 'primary.main' : 'text.primary',
                  },
                  transition: 'border-color 0.3s ease'
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
          
          {/* Tab Content */}
          <Box sx={{ px: 3, py: 2 }}>
            {activeTabComponent}
          </Box>
        </Box>
      </SectionCard>
    </ModuleLayout>
  );
};

export default AdminUtils;
