import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5096/api';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  joinDate: string;
  lastLoginAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name: string;
  email: string;
}

// Obtener todos los usuarios
export const getUsers = async (): Promise<UserDto[]> => {
  const res = await axios.get(`${API_URL}/Users`);
  return res.data.data;
};

// Obtener un usuario por ID
export const getUserById = async (id: number): Promise<UserDto> => {
  const res = await axios.get(`${API_URL}/Users/${id}`);
  return res.data.data;
};

// Crear un nuevo usuario
export const createUser = async (user: CreateUserDto): Promise<UserDto> => {
  const res = await axios.post(`${API_URL}/Users`, user);
  return res.data.data;
};

// Actualizar un usuario existente
export const updateUser = async (id: number, user: UpdateUserDto): Promise<UserDto> => {
  const res = await axios.put(`${API_URL}/Users/${id}`, user);
  return res.data.data;
};

// Eliminar un usuario
export const deleteUser = async (id: number): Promise<boolean> => {
  const res = await axios.delete(`${API_URL}/Users/${id}`);
  return res.data.data;
};
