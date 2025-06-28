// Task API service - Updated to match new API structure
import { apiRequest, ApiResponse } from './apiClient';

// Task DTOs based on the API definition
export interface TaskDto {
  id: number;
  title: string | null;
  description: string | null;
  completed: boolean;
  priority: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string | null;
}

export interface CreateTaskDto {
  title: string | null;
  description: string | null;
  priority: string | null;
  userId: number;
}

export interface UpdateTaskDto {
  title: string | null;
  description: string | null;
  completed: boolean | null;
  priority: string | null;
}

// Task service functions
export const taskService = {
  // Get all tasks
  getTasks: (): Promise<ApiResponse<TaskDto[]>> => {
    return apiRequest.get<TaskDto[]>('/Tasks');
  },

  // Get task by ID
  getTaskById: (id: number): Promise<ApiResponse<TaskDto>> => {
    return apiRequest.get<TaskDto>(`/Tasks/${id}`);
  },

  // Get tasks by user ID
  getTasksByUserId: (userId: number): Promise<ApiResponse<TaskDto[]>> => {
    return apiRequest.get<TaskDto[]>(`/Tasks/user/${userId}`);
  },

  // Get completed tasks
  getCompletedTasks: (): Promise<ApiResponse<TaskDto[]>> => {
    return apiRequest.get<TaskDto[]>('/Tasks/completed');
  },

  // Get pending tasks
  getPendingTasks: (): Promise<ApiResponse<TaskDto[]>> => {
    return apiRequest.get<TaskDto[]>('/Tasks/pending');
  },

  // Create new task
  createTask: (taskData: CreateTaskDto): Promise<ApiResponse<TaskDto>> => {
    return apiRequest.post<TaskDto>('/Tasks', taskData);
  },

  // Update task
  updateTask: (id: number, taskData: UpdateTaskDto): Promise<ApiResponse<TaskDto>> => {
    return apiRequest.put<TaskDto>(`/Tasks/${id}`, taskData);
  },

  // Delete task
  deleteTask: (id: number): Promise<ApiResponse<boolean>> => {
    return apiRequest.delete<boolean>(`/Tasks/${id}`);
  },
};

// Export individual functions for backward compatibility
export const getTasks = taskService.getTasks;
export const getTaskById = taskService.getTaskById;
export const getTasksByUserId = taskService.getTasksByUserId;
export const getCompletedTasks = taskService.getCompletedTasks;
export const getPendingTasks = taskService.getPendingTasks;
export const createTask = taskService.createTask;
export const updateTask = taskService.updateTask;
export const deleteTask = taskService.deleteTask;

export default taskService;
