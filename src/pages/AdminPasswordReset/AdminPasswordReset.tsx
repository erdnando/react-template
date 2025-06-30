import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPasswordReset.css';

/**
 * This component is kept for backward compatibility.
 * It redirects to the AdminUtils page which now contains the password reset functionality
 * in a tabbed interface for better organization.
 */
const AdminPasswordReset: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new AdminUtils page
    navigate('/admin/utils');
  }, [navigate]);
  
  return (
    <div className="admin-password-reset-page">
      <p>Redirecting to Admin Utilities...</p>
    </div>
  );
};

export default AdminPasswordReset;
