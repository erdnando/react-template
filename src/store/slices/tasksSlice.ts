import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskService from '../../services/taskService';

// This interface defines the structure of a Task object
// it includes properties with its datatype of the entity
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  userId?: number;
  userName?: string;
}

//this interface define the initial state of the tasks slice
interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// this part allows us to define mock data for the tasks slice
const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Helper to map TaskDto to Task
const mapTaskDtoToTask = (dto: taskService.TaskDto): Task => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  completed: dto.completed,
  priority: dto.priority as 'low' | 'medium' | 'high',
  userId: dto.userId,
  userName: dto.userName,
});

// Thunks CRUD
export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await taskService.getTasks();
    return data.map(mapTaskDtoToTask);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error fetching tasks');
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id: number, thunkAPI) => {
  try {
    const data = await taskService.getTaskById(id);
    return mapTaskDtoToTask(data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error fetching task');
  }
});

export const createTaskAsync = createAsyncThunk('tasks/create', async (task: taskService.CreateTaskDto, thunkAPI) => {
  try {
    const data = await taskService.createTask(task);
    return mapTaskDtoToTask(data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error creating task');
  }
});

export const updateTaskAsync = createAsyncThunk('tasks/update', async ({ id, data }: { id: number, data: taskService.UpdateTaskDto }, thunkAPI) => {
  try {
    const updated = await taskService.updateTask(id, data);
    return mapTaskDtoToTask(updated);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error updating task');
  }
});

export const deleteTaskAsync = createAsyncThunk('tasks/delete', async (id: number, thunkAPI) => {
  try {
    await taskService.deleteTask(id);
    return id;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error deleting task');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
export type { TasksState };