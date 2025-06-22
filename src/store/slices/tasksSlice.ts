import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// This interface defines the structure of a Task object
// it includes properties with its datatype of the entity
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

//this interface define the initial state of the tasks slice
interface TasksState {
  tasks: Task[];
}

// this part allows us to define mock data for the tasks slice
const initialState: TasksState = {
  tasks: [
    {
      id: 1,
      title: 'Learn Redux Toolkit',
      description: 'Read the official docs and build a demo app',
      completed: false,
      priority: 'high',
    },
    {
      id: 2,
      title: 'Write documentation',
      description: 'Document the new Tasks module for the team',
      completed: false,
      priority: 'medium',
    },
  ],
};

//this part creates a slice of the Redux store for managing tasks
// and allows us to define actions and reducers for managing tasks
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
    deleteTask(state, action: PayloadAction<number>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTask, updateTask, deleteTask } = tasksSlice.actions;
export default tasksSlice.reducer;
export type { TasksState };