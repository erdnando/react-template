import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { Task } from '../../store/slices/tasksSlice';
import {
  fetchTasks,
  createTaskAsync,
  updateTaskAsync,
  deleteTaskAsync
} from '../../store/slices/tasksSlice';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  SelectChangeEvent,
  Chip,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { VALIDATION_LIMITS } from '../../utils/validationConstants';

const Tasks: React.FC = () => {
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const dispatch: AppDispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // UserId: for demo, use 1. Replace with real userId from auth if available.
  const userId = 1;

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Validations
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
  };

  const getPriorityColor = (priority: string): "primary" | "warning" | "error" => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Real-time validation
    const newErrors = { ...errors };
    const { name, value } = e.target;
    
    if (name === 'title') {
      if (!value.trim()) {
        newErrors.title = 'Title is required';
      } else if (value.length > VALIDATION_LIMITS.TASK_TITLE_MAX) {
        newErrors.title = `Title cannot exceed ${VALIDATION_LIMITS.TASK_TITLE_MAX} characters`;
      } else {
        // Check for duplicates
        const duplicate = tasks.find(
          t => t.title.trim().toLowerCase() === value.trim().toLowerCase() && t.id !== editingId
        );
        if (duplicate) {
          newErrors.title = 'A task with this title already exists';
        } else {
          newErrors.title = '';
        }
      }
    } else if (name === 'description') {
      if (!value.trim()) {
        newErrors.description = 'Description is required';
      } else if (value.length > VALIDATION_LIMITS.TASK_DESCRIPTION_MAX) {
        newErrors.description = `Description cannot exceed ${VALIDATION_LIMITS.TASK_DESCRIPTION_MAX} characters`;
      } else {
        newErrors.description = '';
      }
    }
    
    setErrors(newErrors);
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value as string });
  };

  // Validaciones avanzadas
  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > VALIDATION_LIMITS.TASK_TITLE_MAX) {
      newErrors.title = `Title cannot exceed ${VALIDATION_LIMITS.TASK_TITLE_MAX} characters`;
    } else {
      // Check for duplicates
      const duplicate = tasks.find(
        t => t.title.trim().toLowerCase() === form.title.trim().toLowerCase() && t.id !== editingId
      );
      if (duplicate) {
        newErrors.title = 'A task with this title already exists';
      }
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.length > VALIDATION_LIMITS.TASK_DESCRIPTION_MAX) {
      newErrors.description = `Description cannot exceed ${VALIDATION_LIMITS.TASK_DESCRIPTION_MAX} characters`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId !== null) {
      await dispatch(updateTaskAsync({
        id: editingId,
        data: {
          title: form.title,
          description: form.description,
          completed: false, // Optionally allow editing completed
          priority: form.priority as 'low' | 'medium' | 'high',
        },
      }));
      setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
      setEditingId(null);
    } else {
      await dispatch(createTaskAsync({
        title: form.title,
        description: form.description,
        priority: form.priority,
        userId: userId,
      }));
      setSnackbar({ open: true, message: 'Task added!', severity: 'success' });
    }
    setForm({ title: '', description: '', priority: 'medium' });
    setErrors({});
  };

  const handleEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
    });
    setEditingId(task.id);
    setErrors({});
  };

  // Diálogo de confirmación
  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete !== null) {
      await dispatch(deleteTaskAsync(taskToDelete));
      setSnackbar({ open: true, message: 'Task deleted!', severity: 'success' });
    }
    setDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setTaskToDelete(null);
  };

  // Loading and error UI
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography variant="h6">Loading tasks...</Typography>
        </Box>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Task Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, manage and track your tasks efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: { xs: 1.5, md: 2 }, 
          mb: 3 
        }}
      >
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Total Tasks
            </Typography>
            <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
              {taskStats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Completed
            </Typography>
            <Typography variant="h5" color="success.main" sx={{ fontSize: '1.5rem' }}>
              {taskStats.completed}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Pending
            </Typography>
            <Typography variant="h5" color="warning.main" sx={{ fontSize: '1.5rem' }}>
              {taskStats.pending}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              High Priority
            </Typography>
            <Typography variant="h5" color="error.main" sx={{ fontSize: '1.5rem' }}>
              {taskStats.highPriority}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Task Form */}
      <Paper sx={{ p: { xs: 1, md: 1.5 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          {editingId ? 'Edit Task' : 'Add New Task'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2
            }}>
              <TextField
                name="title"
                label="Title"
                value={form.title}
                onChange={handleInputChange}
                required
                size="small"
                sx={{ flex: 1 }}
                error={!!errors.title}
                helperText={errors.title || `Maximum ${VALIDATION_LIMITS.TASK_TITLE_MAX} characters`}
                inputProps={{ maxLength: VALIDATION_LIMITS.TASK_TITLE_MAX }}
              />
              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleInputChange}
                required
                size="small"
                sx={{ flex: 2 }}
                error={!!errors.description}
                helperText={errors.description || `Maximum ${VALIDATION_LIMITS.TASK_DESCRIPTION_MAX} characters`}
                inputProps={{ maxLength: VALIDATION_LIMITS.TASK_DESCRIPTION_MAX }}
                multiline
                maxRows={3}
              />
              <Select
                name="priority"
                value={form.priority}
                onChange={handleSelectChange}
                size="small"
                sx={{ minWidth: { xs: '100%', md: 120 } }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', description: '', priority: 'medium' });
                    setErrors({});
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                size="small"
              >
                {editingId ? 'Update Task' : 'Add Task'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* Tasks List - Desktop Cards */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Stack spacing={1.5}>
          {tasks.map((task: Task) => (
            <Card key={task.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {task.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, py: 1 }}>
                <IconButton color="primary" onClick={() => handleEdit(task)} size="small">
                  <EditIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(task.id)} size="small">
                  <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Tasks List - Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {tasks.map((task: Task) => (
          <Card key={task.id} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                  {task.title}
                </Typography>
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                  size="small"
                  sx={{ fontSize: '0.75rem', ml: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 2 }}>
                {task.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                <IconButton 
                  onClick={() => handleEdit(task)}
                  color="primary"
                  size="small"
                >
                  <EditIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
                <IconButton 
                  onClick={() => handleDeleteClick(task.id)}
                  color="error" 
                  size="small"
                >
                  <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => {
          setEditingId(null);
          setForm({ title: '', description: '', priority: 'medium' });
          setErrors({});
        }}
      >
        <AddIcon />
      </Fab>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDeleteCancel}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;
