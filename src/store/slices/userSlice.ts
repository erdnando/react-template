import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';

export interface User {
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

const mapUserDtoToUser = (dto: userService.UserDto): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  status: dto.status,
  isActive: dto.isActive,
  avatar: dto.avatar,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
  joinDate: dto.joinDate,
  lastLoginAt: dto.lastLoginAt,
});

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await userService.getUsers();
    return data.map(mapUserDtoToUser);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error fetching users');
  }
});

export const createUserAsync = createAsyncThunk('users/create', async (user: userService.CreateUserDto, thunkAPI) => {
  try {
    const data = await userService.createUser(user);
    return mapUserDtoToUser(data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error creating user');
  }
});

export const updateUserAsync = createAsyncThunk('users/update', async ({ id, data }: { id: number, data: userService.UpdateUserDto }, thunkAPI) => {
  try {
    const updated = await userService.updateUser(id, data);
    return mapUserDtoToUser(updated);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error updating user');
  }
});

export const deleteUserAsync = createAsyncThunk('users/delete', async (id: number, thunkAPI) => {
  try {
    await userService.deleteUser(id);
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
