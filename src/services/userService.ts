import { fetchData, postData, updateData, deleteData } from './api';
import { User } from '../store/slices/userSlice';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status?: 'active' | 'inactive';
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: number;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  return await fetchData<User[]>('users');
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
  return await fetchData<User>(`users/${id}`);
};

// Create new user
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  return await postData<User>('users', userData);
};

// Update existing user
export const updateUser = async (userData: UpdateUserRequest): Promise<User> => {
  return await updateData<User>(`users/${userData.id}`, userData);
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  return await deleteData<void>(`users/${id}`);
};
