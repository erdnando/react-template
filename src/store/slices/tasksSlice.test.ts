import tasksReducer, { addTask, updateTask, deleteTask, Task } from './tasksSlice';

describe('tasksSlice', () => {
  const initialState = {
    tasks: [
      {
        id: 1,
        title: 'Test Task',
        description: 'Description',
        completed: false,
        priority: 'medium' as const,
      },
    ],
  };

  it('should return the initial state', () => {
    expect(tasksReducer(undefined, { type: undefined })).toEqual({
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
    });
  });

  it('should handle addTask', () => {
    const newTask: Task = {
      id: 2,
      title: 'New Task',
      description: 'New Desc',
      completed: false,
      priority: 'low',
    };
    const state = tasksReducer(initialState, addTask(newTask));
    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[1]).toEqual(newTask);
  });

  it('should handle updateTask', () => {
    const updatedTask: Task = {
      id: 1,
      title: 'Updated Task',
      description: 'Updated Desc',
      completed: true,
      priority: 'high',
    };
    const state = tasksReducer(initialState, updateTask(updatedTask));
    expect(state.tasks[0]).toEqual(updatedTask);
  });

  it('should handle deleteTask', () => {
    const state = tasksReducer(initialState, deleteTask(1));
    expect(state.tasks).toHaveLength(0);
  });
});