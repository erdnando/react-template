// Test script for API endpoints
// You can run these functions from the browser console to test the API

import { fetchData, postData } from '../services/api';
import { login } from '../services/auth';
import { getUsers, createUser, CreateUserDto } from '../services/userService';

import { getCatalogs, createCatalog, CreateCatalogDto } from '../services/catalogService';
import { getTasks, createTask, CreateTaskDto } from '../services/taskService';

interface WindowWithApiTests extends Window {
  apiTests: {
    testRawGet: (endpoint: string) => Promise<unknown>;
    testRawPost: (endpoint: string, data: unknown) => Promise<unknown>;
    testLogin: (username?: string, password?: string) => Promise<unknown>;
    testGetUsers: () => Promise<unknown>;
    testCreateUser: (userData?: CreateUserDto) => Promise<unknown>;
    testGetTasks: () => Promise<unknown>;
    testCreateTask: (taskData?: CreateTaskDto) => Promise<unknown>;
    testGetCatalogs: () => Promise<unknown>;
    testCreateCatalog: (catalogData?: CreateCatalogDto) => Promise<unknown>;
    runAllTests: () => Promise<unknown>;
    checkToken: () => void;
    clearAuth: () => void;
  };
}

// Test functions for the browser console
(window as unknown as WindowWithApiTests).apiTests = {
  // Basic API functions
  async testRawGet(endpoint: string) {
    console.log(`Testing GET ${endpoint}`);
    try {
      const result = await fetchData(endpoint);
      console.log('✅ Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  },

  async testRawPost(endpoint: string, data: unknown) {
    console.log(`Testing POST ${endpoint}`, data);
    try {
      const result = await postData(endpoint, data);
      console.log('✅ Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  },

  // Authentication tests
  async testLogin(email = 'demo', password = 'demo123') {
    console.log('Testing login...');
    try {
      const result = await login({ email, password });
      console.log('✅ Login successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // User service tests
  async testGetUsers() {
    console.log('Testing getUsers...');
    try {
      const result = await getUsers();
      console.log('✅ Users fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  async testCreateUser(userData?: CreateUserDto) {
    const defaultUser: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234'
    };
    const user = userData || defaultUser;
    
    console.log('Testing createUser...', user);
    try {
      const result = await createUser(user);
      console.log('✅ User created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  // Task service tests
  async testGetTasks() {
    console.log('Testing getTasks...');
    try {
      const result = await getTasks();
      console.log('✅ Tasks fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      throw error;
    }
  },

  async testCreateTask(taskData?: CreateTaskDto) {
    const defaultTask: CreateTaskDto = {
      title: 'Test Task',
      description: 'This is a test task from console',
      priority: 'medium',
      userId: 1
    };
    const task = taskData || defaultTask;
    
    console.log('Testing createTask...', task);
    try {
      const result = await createTask(task);
      console.log('✅ Task created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  // Catalog service tests
  async testGetCatalogs() {
    console.log('Testing getCatalogs...');
    try {
      const result = await getCatalogs();
      console.log('✅ Catalogs fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching catalogs:', error);
      throw error;
    }
  },

  async testCreateCatalog(catalogData?: CreateCatalogDto) {
    const defaultCatalog: CreateCatalogDto = {
      title: 'Test Catalog',
      description: 'This is a test catalog',
      category: 'Electronics',
      price: 100,
      inStock: true
    };
    const catalog = catalogData || defaultCatalog;
    
    console.log('Testing createCatalog...', catalog);
    try {
      const result = await createCatalog(catalog);
      console.log('✅ Catalog created:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating catalog:', error);
      throw error;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running all API tests...');
    
    const tests = [
      () => this.testLogin(),
      () => this.testGetUsers(),
      () => this.testGetTasks(),
      () => this.testGetCatalogs(),
      () => this.testCreateUser(),
      () => this.testCreateTask(),
      () => this.testCreateCatalog()
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
        const result = await test();
        results.push({ status: 'success', result });
      } catch (error) {
        results.push({ status: 'error', error });
      }
    }
    
    console.log('📊 Test Results:', results);
    return results;
  },

  // Helper to check current token
  checkToken() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Current token:', token);
    console.log('Current user:', user ? JSON.parse(user) : null);
  },

  // Helper to clear auth data
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth data cleared');
  }
};

console.log('🔧 API Test functions loaded! Available in window.apiTests');
console.log('Example usage:');
console.log('  window.apiTests.testLogin()');
console.log('  window.apiTests.testGetUsers()');
console.log('  window.apiTests.runAllTests()');
console.log('  window.apiTests.checkToken()');

export {};
