// Mock API responses that match the new backend structure
const mockUsers = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    email: 'alice@example.com',
    status: 1, // Active
    roleId: 1,
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    email: 'bob@example.com',
    status: 1, // Active
    roleId: 1,
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 3,
    firstName: 'Charlie',
    lastName: 'Brown',
    fullName: 'Charlie Brown',
    email: 'charlie@example.com',
    status: 1, // Active
    roleId: 2,
    avatar: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLoginAt: '2023-12-01T00:00:00Z'
  }
];

const mockRoles = [
  {
    id: 1,
    name: 'Administrador',
    description: 'Administrator role',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Analista',
    description: 'Analyst role',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

const mockModules = [
  {
    id: 1,
    moduleCode: 'users',
    name: 'Gestión de Usuarios',
    description: 'User management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    moduleCode: 'tasks',
    name: 'Gestión de Tareas',
    description: 'Task management module',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

const mockUserPermissions = [
  {
    id: 1,
    userId: 1,
    moduleId: 1,
    moduleCode: 'users',
    permissionType: 0, // Admin
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    moduleId: 2,
    moduleCode: 'tasks',
    permissionType: 2, // Write
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

const createPagedResponse = (data: unknown[], page = 1, pageSize = 10) => ({
  success: true,
  message: 'Success',
  data: {
    data,
    pageNumber: page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
    totalRecords: data.length,
    hasNext: page * pageSize < data.length,
    hasPrevious: page > 1
  }
});

const createResponse = (data: unknown) => ({
  success: true,
  message: 'Success',
  data
});

const mockGet = jest.fn((url: string) => {
  // Mock axios.get called
  
  // Handle API endpoint patterns
  if (url.includes('/api/users') || url.includes('/users')) {
    return Promise.resolve({ data: createPagedResponse(mockUsers) });
  }
  if (url.includes('/api/roles') || url.includes('/roles')) {
    return Promise.resolve({ data: createPagedResponse(mockRoles) });
  }
  if (url.includes('/api/modules') || url.includes('/modules')) {
    return Promise.resolve({ data: createPagedResponse(mockModules) });
  }
  if (url.includes('/api/permissions/user/') || url.includes('/permissions/user/')) {
    const urlParts = url.split('/');
    const userIdIndex = urlParts.findIndex(part => part === 'user') + 1;
    const userId = parseInt(urlParts[userIdIndex] || '1');
    const userPerms = mockUserPermissions.filter(p => p.userId === userId);
    return Promise.resolve({ data: createResponse(userPerms) });
  }
  
  return Promise.resolve({ data: createResponse({}) });
});

const mockPost = jest.fn((url: string, data: Record<string, unknown>) => {
  // Mock axios.post called
  
  if (url.includes('/api/users') || url.includes('/users')) {
    const newUser = { id: Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(newUser) });
  }
  if (url.includes('/api/roles') || url.includes('/roles')) {
    const newRole = { id: Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(newRole) });
  }
  if (url.includes('/api/permissions') || url.includes('/permissions')) {
    const newPermission = { id: Date.now(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(newPermission) });
  }
  
  return Promise.resolve({ data: createResponse(data) });
});

const mockPut = jest.fn((url: string, data: Record<string, unknown>) => {
  // Mock axios.put called
  
  if (url.includes('/api/users/') || url.includes('/users/')) {
    const updatedUser = { ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(updatedUser) });
  }
  if (url.includes('/api/roles/') || url.includes('/roles/')) {
    const updatedRole = { ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(updatedRole) });
  }
  if (url.includes('/api/permissions/') || url.includes('/permissions/')) {
    const updatedPermission = { ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve({ data: createResponse(updatedPermission) });
  }
  
  return Promise.resolve({ data: createResponse(data) });
});

const mockDelete = jest.fn((url: string) => {
  // Mock axios.delete called
  if (url.includes('/api/') || url.includes('/users/') || url.includes('/roles/') || url.includes('/permissions/')) {
    return Promise.resolve({ data: createResponse({ success: true }) });
  }
  return Promise.resolve({ data: createResponse({ success: true }) });
});

export default {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  create: jest.fn(function () {
    return this;
  }),
  defaults: {
    adapter: {}
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
};
