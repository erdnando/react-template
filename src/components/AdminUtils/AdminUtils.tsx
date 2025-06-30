import React, { useState } from 'react';
import { AdminPasswordResetManagement } from '../AdminPasswordResetManagement';
import './AdminUtils.css';

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

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Find the active tab component
  const activeTabComponent = ADMIN_TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-utils">
      <h1>Administration Utilities</h1>
      
      {/* Tab Navigation */}
      <div className="admin-tabs">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTabComponent}
      </div>
    </div>
  );
};

export default AdminUtils;
