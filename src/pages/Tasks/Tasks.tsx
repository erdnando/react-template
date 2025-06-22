import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { Task, addTask, deleteTask, updateTask } from '../../store/slices/tasksSlice';
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
  SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Tasks: React.FC = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const dispatch = useDispatch();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value as string });
  };

  // Validaciones avanzadas
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (form.title.length > 40) newErrors.title = 'Title must be 40 characters or less';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (form.description.length > 100) newErrors.description = 'Description must be 100 characters or less';
    // Evitar duplicados
    const duplicate = tasks.find(
      t =>
        t.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
        t.id !== editingId
    );
    if (duplicate) newErrors.title = 'A task with this title already exists';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId !== null) {
      dispatch(updateTask({
        id: editingId,
        title: form.title,
        description: form.description,
        completed: false,
        priority: form.priority as 'low' | 'medium' | 'high',
      }));
      setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
      setEditingId(null);
    } else {
      const newTask: Task = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        completed: false,
        priority: form.priority as 'low' | 'medium' | 'high',
      };
      dispatch(addTask(newTask));
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

  const handleDeleteConfirm = () => {
    if (taskToDelete !== null) {
      dispatch(deleteTask(taskToDelete));
      setSnackbar({ open: true, message: 'Task deleted!', severity: 'success' });
    }
    setDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="title"
              label="Title"
              value={form.title}
              onChange={handleInputChange}
              required
              size="small"
              sx={{ flex: 1 }}
              error={!!errors.title}
              helperText={errors.title}
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
              helperText={errors.description}
            />
            <Select
              name="priority"
              value={form.priority}
              onChange={handleSelectChange}
              size="small"
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
            <Button type="submit" variant="contained" color="primary">
              {editingId !== null ? 'Update' : 'Add Task'}
            </Button>
            {editingId !== null && (
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: '', description: '', priority: 'medium' });
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </form>
      </Paper>
      <Stack spacing={2}>
        {tasks.map((task: Task) => (
          <Card key={task.id} variant="outlined">
            <CardContent>
              <Typography variant="h6" component="div" fontWeight="bold">
                {task.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {task.description}
              </Typography>
              <Typography variant="body2">
                Priority: <b>{task.priority}</b>
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton color="primary" onClick={() => handleEdit(task)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteClick(task.id)}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Stack>
      {/* Snackbar para feedback visual */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={dialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;