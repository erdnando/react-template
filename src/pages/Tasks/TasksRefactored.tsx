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
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import { VALIDATION_LIMITS } from '../../utils/validationConstants';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { 
  ModuleLayout, 
  ModuleCard, 
  SectionCard,
  SearchField,
  ActionButtons,
  StatsDisplay,
  FormSection,
  StatusChip
} from '../../components/ui';

const Tasks: React.FC = () => {
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
  const dispatch: AppDispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['tasks']?.type === 'Edit';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtered tasks based on search
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (form.title.length > VALIDATION_LIMITS.title.max) {
      newErrors.title = `El título no puede exceder ${VALIDATION_LIMITS.title.max} caracteres`;
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (form.description.length > VALIDATION_LIMITS.description.max) {
      newErrors.description = `La descripción no puede exceder ${VALIDATION_LIMITS.description.max} caracteres`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Clear error for this field if it exists
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const taskData = {
        ...form,
        userId,
        completed: false,
      };

      if (editingId) {
        await dispatch(updateTaskAsync({
          id: editingId,
          task: { ...taskData, id: editingId, completed: tasks.find(t => t.id === editingId)?.completed || false }
        })).unwrap();
        setSnackbar({ open: true, message: 'Tarea actualizada correctamente', severity: 'success' });
      } else {
        await dispatch(createTaskAsync(taskData)).unwrap();
        setSnackbar({ open: true, message: 'Tarea creada correctamente', severity: 'success' });
      }
      
      resetForm();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: editingId ? 'Error al actualizar la tarea' : 'Error al crear la tarea', 
        severity: 'error' 
      });
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium' });
    setEditingId(null);
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

  const handleDeleteClick = (id: number) => {
    setTaskToDelete(id);
    setDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete !== null) {
      try {
        await dispatch(deleteTaskAsync(taskToDelete)).unwrap();
        setSnackbar({ open: true, message: 'Tarea eliminada correctamente', severity: 'success' });
        handleDeleteCancel();
      } catch (err) {
        setSnackbar({ open: true, message: 'Error al eliminar la tarea', severity: 'error' });
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await dispatch(updateTaskAsync({
        id: task.id,
        task: { ...task, completed: !task.completed }
      })).unwrap();
      setSnackbar({ 
        open: true, 
        message: task.completed ? 'Tarea marcada como pendiente' : 'Tarea marcada como completada', 
        severity: 'success' 
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar el estado de la tarea', severity: 'error' });
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <ModuleLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Cargando tareas...</Typography>
        </Box>
      </ModuleLayout>
    );
  }

  if (error) {
    return (
      <ModuleLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Alert severity="error">Error al cargar las tareas: {error}</Alert>
        </Box>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout title="Gestión de Tareas">
      {/* Estadísticas */}
      <Box sx={{ mb: 3 }}>
        <StatsDisplay 
          stats={[
            { label: "Total", value: taskStats.total, color: "primary" },
            { label: "Completadas", value: taskStats.completed, color: "success" },
            { label: "Pendientes", value: taskStats.pending, color: "warning" },
            { label: "Alta Prioridad", value: taskStats.highPriority, color: "error" },
          ]}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Formulario */}
        <Grid item xs={12} md={4}>
          <ModuleCard title={editingId ? "Editar Tarea" : "Nueva Tarea"}>
            <FormSection title="Información de la Tarea">
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título"
                  value={form.title}
                  onChange={handleInputChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: VALIDATION_LIMITS.title.max }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  value={form.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  inputProps={{ maxLength: VALIDATION_LIMITS.description.max }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    name="priority"
                    value={form.priority}
                    onChange={handleSelectChange}
                    label="Prioridad"
                  >
                    <MenuItem value="low">Baja</MenuItem>
                    <MenuItem value="medium">Media</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </FormSection>
            
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !canEdit}
                fullWidth
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
              {editingId && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  fullWidth
                >
                  Cancelar
                </Button>
              )}
            </Stack>
          </ModuleCard>
        </Grid>

        {/* Lista de Tareas */}
        <Grid item xs={12} md={8}>
          <SectionCard 
            title="Lista de Tareas"
            action={
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar tareas..."
                sx={{ minWidth: 250 }}
              />
            }
          >
            {filteredTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {searchTerm ? 'No se encontraron tareas' : 'No hay tareas disponibles'}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    canEdit={canEdit}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => handleDeleteClick(task.id)}
                    onToggleComplete={() => handleToggleComplete(task)}
                  />
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Diálogo de Confirmación */}
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
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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
    </ModuleLayout>
  );
};

// Componente TaskCard reutilizable
interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  canEdit, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}) => {
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

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      default:
        return 'Baja';
    }
  };

  return (
    <Card 
      variant="outlined"
      sx={{
        '&:hover': {
          boxShadow: 2,
        },
        opacity: task.completed ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.95rem', 
              flex: 1,
              textDecoration: task.completed ? 'line-through' : 'none'
            }}
          >
            {task.title}
          </Typography>
          <StatusChip 
            status={task.completed ? 'completada' : 'pendiente'}
            colorMap={{
              completada: 'success',
              pendiente: 'warning'
            }}
          />
          <Chip
            label={getPriorityLabel(task.priority)}
            color={getPriorityColor(task.priority)}
            size="small"
            sx={{ fontSize: '0.75rem', ml: 1 }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontSize: '0.8125rem', mb: 2 }}
        >
          {task.description}
        </Typography>
        
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canEdit}
          editLabel="Editar tarea"
          deleteLabel="Eliminar tarea"
        />
        
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderTopColor: 'divider' }}>
          <Button
            size="small"
            variant={task.completed ? "outlined" : "contained"}
            color={task.completed ? "secondary" : "success"}
            onClick={onToggleComplete}
            disabled={!canEdit}
            fullWidth
          >
            {task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Tasks;
