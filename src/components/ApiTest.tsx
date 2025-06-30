import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';
import { UserSearchAutocomplete } from './UserSearchAutocomplete';

interface HealthResponse {
  status: string;
  timestamp: string;
}

export const ApiTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [backendStatus, setBackendStatus] = useState<string>('Disconnected');
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Test basic health endpoint
        const response = await apiRequest.get<HealthResponse>('/health');
        setHealthStatus(`✅ Backend Connected: ${response.data.status}`);
        setBackendStatus('Connected');
      } catch (error) {
        console.error('Backend connection failed:', error);
        setHealthStatus('❌ Backend Disconnected');
        setBackendStatus('Disconnected');
      }
    };

    checkBackendConnection();
  }, []);

  const testEndpoints = async () => {
    try {
      // Test diagnostics endpoint
      const diagnostics = await apiRequest.get('/diagnostics/database-state');
      alert(`Diagnostics Success: ${JSON.stringify(diagnostics.data, null, 2)}`);
    } catch (error) {
      console.error('Diagnostics test failed:', error);
      alert('Diagnostics test failed - check console for details');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: backendStatus === 'Connected' ? '#e8f5e8' : '#f5e8e8'
    }}>
      <h3>🔗 API Connection Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {healthStatus}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Backend URL:</strong> http://localhost:5000/api
      </div>
      
      <button 
        onClick={testEndpoints}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Test Diagnostics Endpoint
      </button>

      {/* User Search Test */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🔍 User Search Autocomplete Test</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          Type at least 2 characters to search for users:
        </p>
        <UserSearchAutocomplete
          placeholder="Search users by email..."
          onUserSelected={(email) => {
            setSelectedUser(email);
            alert(`User selected: ${email}`);
          }}
        />
        {selectedUser && (
          <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <strong>Selected user:</strong> {selectedUser}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p>📝 <strong>Instructions:</strong></p>
        <ul>
          <li>Make sure your .NET backend is running on port 5000</li>
          <li>Use: <code>./start-backend.sh</code> to start the backend</li>
          <li>This component tests the connection automatically</li>
        </ul>
      </div>
    </div>
  );
};
