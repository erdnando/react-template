// Tipos para la nueva API según swagger.json

export interface UserDto {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
  updatedAt: string | null;
  joinDate: string;
  lastLoginAt: string | null;
}

export interface CreateUserDto {
  name: string | null;
  email: string | null;
  password: string | null;
}

export interface UpdateUserDto {
  name: string | null;
  email: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
}

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

export interface CatalogDto {
  id: number;
  title: string | null;
  description: string | null;
  category: string | null;
  image: string | null;
  rating: number;
  price: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string | null;
  password: string | null;
}

export interface LoginResponseDto {
  token: string | null;
  user: UserDto;
}
