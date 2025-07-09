import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Home from '../../../pages/Home/Home';
import Catalogs from '../../../pages/Catalogs/Catalogs';
import Tasks from '../../../pages/Tasks/Tasks';
import Users from '../../../pages/Users/Users';
import Roles from '../../../pages/Roles/Roles';
import Permissions from '../../../pages/Permissions/Permissions';
import AdminPasswordReset from '../../../pages/AdminPasswordReset';
import AdminUtils from '../../../pages/AdminUtils';
import { BusinessRulesManager } from '../../../pages/AdminUtils';
import { ProtectedRoute } from '../../ProtectedRoute';

// Add prop type for refreshPermissions
interface AppLayoutProps {
  refreshPermissions?: () => Promise<void>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ refreshPermissions }) => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogs" element={
          <ProtectedRoute moduleCode="catalogs">
            <Catalogs />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute moduleCode="tasks">
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute moduleCode="users">
            <Users refreshPermissions={refreshPermissions} />
          </ProtectedRoute>
        } />
        <Route path="/roles" element={
          <ProtectedRoute moduleCode="roles">
            <Roles />
          </ProtectedRoute>
        } />
        <Route path="/permissions" element={
          <ProtectedRoute moduleCode="permissions">
            <Permissions refreshPermissions={refreshPermissions} />
          </ProtectedRoute>
        } />
        <Route path="/admin/password-reset" element={
          <ProtectedRoute moduleCode="adminPasswordReset">
            <AdminPasswordReset />
          </ProtectedRoute>
        } />
        <Route path="/admin/utils" element={
          <ProtectedRoute moduleCode="admin_utils">
            <AdminUtils />
          </ProtectedRoute>
        } />
        <Route path="/admin/business-rules" element={
          <ProtectedRoute moduleCode="admin_utils">
            <BusinessRulesManager />
          </ProtectedRoute>
        } />
        {/* Redirect any other routes to home when authenticated */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
};

export default AppLayout;
