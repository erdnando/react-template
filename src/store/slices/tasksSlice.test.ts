import tasksReducer, { Task } from './tasksSlice';

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
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(tasksReducer(undefined, { type: undefined })).toEqual({
      tasks: [],
      loading: false,
      error: null,
    });
  });
});