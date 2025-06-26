import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../Layout/Layout';
import Home from '../../../pages/Home/Home';
import Catalogs from '../../../pages/Catalogs/Catalogs';
import Tasks from '../../../pages/Tasks/Tasks';
import Users from '../../../pages/Users/Users';
import Permissions from '../../../pages/Permissions/Permissions';

export const AppLayout: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogs" element={<Catalogs />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/users" element={<Users />} />
          <Route path="/permissions" element={<Permissions />} />
          {/* Redirect any other routes to home when authenticated */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppLayout;
