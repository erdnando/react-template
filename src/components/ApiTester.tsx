import React, { useState } from 'react';
import { 
  fetchData
} from '../services/api';
import {
  getUsers,
  createUser
} from '../services/userService';
import {
  getTasks,
  createTask
} from '../services/taskService';
import {
  getCatalogs,
  createCatalog
} from '../services/catalogService';
import { login } from '../services/auth';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'pending';
  data?: string;
  error?: string;
  timestamp: string;
}

const ApiTester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: Omit<TestResult, 'timestamp'>) => {
    setResults(prev => [{
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const testEndpoint = async (
    name: string,
    method: string,
    testFunction: () => Promise<unknown>
  ) => {
    addResult({ endpoint: name, method, status: 'pending' });
    
    try {
      const data = await testFunction();
      const dataString = Array.isArray(data) 
        ? `Array with ${data.length} items` 
        : typeof data === 'string' 
          ? data 
          : JSON.stringify(data, null, 2);
      
      addResult({ 
        endpoint: name, 
        method, 
        status: 'success', 
        data: dataString 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addResult({ 
        endpoint: name, 
        method, 
        status: 'error', 
        error: errorMessage
      });
    }
  };

  // Test Functions
  const testAuthLogin = () => testEndpoint(
    '/api/auth/login', 
    'POST',
    () => login({ email: 'erdnando@gmail.com', password: 'user123' })
  );

  const testGetUsers = () => testEndpoint(
    '/api/users',
    'GET',
    () => getUsers()
  );

  const testCreateUser = () => testEndpoint(
    '/api/users',
    'POST',
    () => createUser({
      name: 'Test User',
      email: 'testuser@example.com',
      role: 'user'
    })
  );

  const testGetTasks = () => testEndpoint(
    '/api/tasks',
    'GET',
    () => getTasks()
  );

  const testCreateTask = () => testEndpoint(
    '/api/tasks',
    'POST',
    () => createTask({
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'medium',
      userId: 1 // Replace with a valid userId as needed
    })
  );

  const testGetCatalogs = () => testEndpoint(
    '/api/catalogs',
    'GET',
    () => getCatalogs()
  );

  const testCreateCatalog = () => testEndpoint(
    '/api/catalogs',
    'POST',
    () => createCatalog({
      title: 'Test Product',
      description: 'This is a test product',
      category: 'Test',
      price: 99.99
    })
  );

  // Raw API tests
  const testRawApiHealth = () => testEndpoint(
    '/api/health',
    'GET',
    () => fetchData('health')
  );

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    const tests = [
      testRawApiHealth,
      testAuthLogin,
      testGetUsers,
      testGetTasks,
      testGetCatalogs,
      testCreateUser,
      testCreateTask,
      testCreateCatalog
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔧 API Connection Tester</h2>
      <p>Current API Base URL: <code>http://localhost:5096/api</code></p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
        </button>

        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🗑️ Clear
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Individual Tests:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button onClick={testAuthLogin} style={buttonStyle}>Login</button>
          <button onClick={testGetUsers} style={buttonStyle}>Get Users</button>
          <button onClick={testGetTasks} style={buttonStyle}>Get Tasks</button>
          <button onClick={testGetCatalogs} style={buttonStyle}>Get Catalogs</button>
          <button onClick={testCreateUser} style={buttonStyle}>Create User</button>
          <button onClick={testCreateTask} style={buttonStyle}>Create Task</button>
          <button onClick={testCreateCatalog} style={buttonStyle}>Create Catalog</button>
          <button onClick={testRawApiHealth} style={buttonStyle}>Health Check</button>
        </div>
      </div>

      <div>
        <h3>Test Results ({results.length}):</h3>
        {results.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No tests run yet. Click &quot;Run All Tests&quot; to start.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.map((result, index) => (
              <div 
                key={index}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: result.status === 'success' ? '#d4edda' : 
                                 result.status === 'error' ? '#f8d7da' : '#fff3cd'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>
                    {result.status === 'success' ? '✅' : 
                     result.status === 'error' ? '❌' : '⏳'} 
                    {result.method} {result.endpoint}
                  </strong>
                  <small style={{ color: '#6c757d' }}>{result.timestamp}</small>
                </div>
                
                {result.status === 'success' && result.data && (
                  <div style={{ marginTop: '5px', fontSize: '14px' }}>
                    <strong>Response:</strong>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                      {result.data}
                    </pre>
                  </div>
                )}
                
                {result.status === 'error' && result.error && (
                  <div style={{ marginTop: '5px', fontSize: '14px', color: '#721c24' }}>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

export default ApiTester;
