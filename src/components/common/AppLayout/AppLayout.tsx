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

export const AppLayout: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogs" element={<Catalogs />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/users" element={<Users />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/admin/password-reset" element={<AdminPasswordReset />} />
        <Route path="/admin/utils" element={<AdminUtils />} />
        {/* Redirect any other routes to home when authenticated */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
};

export default AppLayout;
