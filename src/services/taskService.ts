import { fetchData, postData, updateData, deleteData } from './api';
import { Task } from '../store/slices/tasksSlice';

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface UpdateTaskRequest extends CreateTaskRequest {
  id: number;
}

// Get all tasks
export const getTasks = async (): Promise<Task[]> => {
  return await fetchData<Task[]>('tasks');
};

// Get task by ID
export const getTaskById = async (id: number): Promise<Task> => {
  return await fetchData<Task>(`tasks/${id}`);
};

// Create new task
export const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
  return await postData<Task>('tasks', taskData);
};

// Update existing task
export const updateTask = async (taskData: UpdateTaskRequest): Promise<Task> => {
  return await updateData<Task>(`tasks/${taskData.id}`, taskData);
};

// Delete task
export const deleteTask = async (id: number): Promise<void> => {
  return await deleteData<void>(`tasks/${id}`);
};

// Toggle task completion
export const toggleTaskCompletion = async (id: number): Promise<Task> => {
  return await updateData<Task>(`tasks/${id}/toggle`, {});
};
