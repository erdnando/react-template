import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApiService from '../../services/userApiService';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  status: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  joinDate: string;
  lastLoginAt?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const mapUserDtoToUser = (dto: userApiService.UserDto): User => ({
  id: dto.id,
  name: dto.fullName || `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
  email: dto.email || '',
  role: dto.role?.name || 'Unknown',
  roleId: dto.roleId,
  status: dto.isActive ? 'active' : 'inactive', // Map isActive boolean to string
  isActive: dto.isActive,
  avatar: dto.avatar || undefined,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt || dto.createdAt,
  joinDate: dto.createdAt, // Use createdAt as joinDate since there's no specific joinDate field
  lastLoginAt: dto.lastLoginAt || undefined,
});

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await userApiService.userService.getUsers();
    return (response.data.data || []).map(mapUserDtoToUser);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error fetching users');
  }
});

export const createUserAsync = createAsyncThunk('users/create', async (user: userApiService.CreateUserDto, thunkAPI) => {
  try {
    const response = await userApiService.userService.createUser(user);
    return mapUserDtoToUser(response.data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error creating user');
  }
});

export const updateUserAsync = createAsyncThunk('users/update', async ({ id, data }: { id: number, data: userApiService.UpdateUserDto }, thunkAPI) => {
  try {
    const response = await userApiService.userService.updateUser(id, data);
    return mapUserDtoToUser(response.data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error updating user');
  }
});

export const deleteUserAsync = createAsyncThunk('users/delete', async (id: number, thunkAPI) => {
  try {
    await userApiService.userService.deleteUser(id);
    return id;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error deleting user');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
export type { UserState };
