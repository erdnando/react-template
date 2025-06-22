// src/data/mockData.ts
export const mockUsers = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "admin",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "user",
    },
    {
        id: 3,
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        role: "user",
    },
];

export const mockCatalogs = [
    {
        id: 1,
        title: "Catalog 1",
        description: "Description for Catalog 1",
    },
    {
        id: 2,
        title: "Catalog 2",
        description: "Description for Catalog 2",
    },
];

export const mockAuth = {
    isAuthenticated: false,
    user: null,
};