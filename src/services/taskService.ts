import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5096/api';

export interface TaskDto {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: string;
  userId: number;
}

export interface UpdateTaskDto {
  title: string;
  description: string;
  completed: boolean;
  priority: string;
}

// Obtener todas las tareas
export const getTasks = async (): Promise<TaskDto[]> => {
  const res = await axios.get(`${API_URL}/Tasks`);
  return res.data.data;
};

// Obtener una tarea por ID
export const getTaskById = async (id: number): Promise<TaskDto> => {
  const res = await axios.get(`${API_URL}/Tasks/${id}`);
  return res.data.data;
};

// Crear una nueva tarea
export const createTask = async (task: CreateTaskDto): Promise<TaskDto> => {
  const res = await axios.post(`${API_URL}/Tasks`, task);
  return res.data.data;
};

// Actualizar una tarea existente
export const updateTask = async (id: number, task: UpdateTaskDto): Promise<TaskDto> => {
  const res = await axios.put(`${API_URL}/Tasks/${id}`, task);
  return res.data.data;
};

// Eliminar una tarea
export const deleteTask = async (id: number): Promise<boolean> => {
  const res = await axios.delete(`${API_URL}/Tasks/${id}`);
  return res.data.data;
};
