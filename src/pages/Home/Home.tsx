import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { ModuleHeader } from '../../components/ui';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

import UserInfo from '../../components/UserInfo';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();


  const dashboardCards = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: 'primary.main',
      path: '/users'
    },
    {
      title: 'Active Catalogs',
      value: '45',
      change: '+5%',
      icon: <InventoryIcon sx={{ fontSize: 32 }} />,
      color: 'secondary.main',
      path: '/catalogs'
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      change: '+2.1%',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: 'success.main',
      path: '/analytics'
    },
    {
      title: 'Dashboard Views',
      value: '8,765',
      change: '+18%',
      icon: <DashboardIcon sx={{ fontSize: 32 }} />,
      color: 'warning.main',
      path: '/dashboard'
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <ModuleHeader 
        title={`Welcome${isAuthenticated && user ? `, ${user.username}` : ''}!`}
        subtitle="Modern React Template Dashboard"
        action={
          !isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label="Please login to access all features" 
                color="info" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
              <Button 
                variant="contained" 
                size="small"
                onClick={() => navigate('/login')}
              >
                Login Now
              </Button>
            </Box>
          )
        }
      />
      

      {isAuthenticated ? (
        <>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 4
            }}
          >
            {dashboardCards.map((card, index) => (
              <Card 
                key={index}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: card.color, mr: 1.5, width: 36, height: 36 }}>
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" component="div" sx={{ fontSize: '1.25rem' }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                        {card.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={card.change} 
                    color="success" 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* User Info Component */}
          <Box sx={{ mb: 4 }}>
            <UserInfo />
          </Box>

          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr'
              },
              gap: 3
            }}
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Here you can see the latest activities and updates from your application.
                This section would typically contain charts, recent transactions, or user activity.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  View All Activities
                </Button>
                <Button variant="contained">
                  Generate Report
                </Button>
              </Box>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/users')}
                >
                  Manage Users
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => navigate('/catalogs')}
                >
                  View Catalogs
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth
                  color="secondary"
                >
                  Create New Item
                </Button>
              </Box>
            </Paper>
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to React Template
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is a modern React application template built with:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip label="React 18" color="primary" />
            <Chip label="TypeScript" color="secondary" />
            <Chip label="Material-UI" color="success" />
            <Chip label="Redux Toolkit" color="warning" />
            <Chip label="React Router" color="info" />
          </Box>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </Paper>
      )}

      {/* API Tester Section - Removed for production */}
    </Box>
  );
};

export default Home;