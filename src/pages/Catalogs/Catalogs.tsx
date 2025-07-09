import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Rating,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CardActions,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchCatalogs,
  createCatalogAsync,
  updateCatalogAsync,
  deleteCatalogAsync,
  Catalog
} from '../../store/slices/catalogSlice';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { ReadOnlyBanner, ModuleLayout, ModuleHeader } from '../../components/ui';

const Catalogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Catalog | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    rating: 0,
    inStock: true,
  });

  const dispatch: AppDispatch = useDispatch();
  const { catalogs, loading, error } = useSelector((state: RootState) => state.catalog);
  const userPermissions = useUserPermissions();
  const canEdit = userPermissions['catalogs']?.type === 'Edit';

  useEffect(() => {
    dispatch(fetchCatalogs());
  }, [dispatch]);

  const categories = ['all', 'Electronics', 'Home & Kitchen', 'Sports', 'Books', 'Clothing'];

  // Catalog statistics
  const catalogStats = {
    total: catalogs.length,
    inStock: catalogs.filter(c => c.inStock).length,
    categories: new Set(catalogs.map(c => c.category)).size,
    avgRating: catalogs.length > 0 ? (catalogs.reduce((sum, c) => sum + c.rating, 0) / catalogs.length).toFixed(1) : '0',
  };

  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalog.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || catalog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      rating: 0,
      inStock: true,
    });
    setEditingProduct(null);
  };

  // Handle open add dialog
  const handleOpenAddDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (product: Catalog) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      rating: product.rating,
      inStock: product.inStock,
    });
    setEditingProduct(product);
    setOpenDialog(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price.trim() || !formData.category.trim()) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }
    const catalogData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      rating: formData.rating,
      inStock: formData.inStock,
      image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(formData.title)}`,
    };
    if (editingProduct) {
      await dispatch(updateCatalogAsync({ id: editingProduct.id, data: catalogData }));
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
    } else {
      await dispatch(createCatalogAsync(catalogData));
      setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
    }
    setOpenDialog(false);
    resetForm();
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    await dispatch(deleteCatalogAsync(id));
    setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
  };

  // Loading y error UI
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography variant="h6">Loading catalogs...</Typography>
        </Box>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Typography variant="h6" color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ModuleLayout>
      {/* Título y subtítulo usando el componente ModuleHeader */}
      <ModuleHeader
        title="Product Catalog"
        subtitle="Browse and manage your product inventory"
      />
      
      {/* Read Only Banner */}
      {!canEdit && <ReadOnlyBanner />}

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
              Total Products
            </Typography>
            <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
              {catalogStats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              In Stock
            </Typography>
            <Typography variant="h5" color="success.main" sx={{ fontSize: '1.5rem' }}>
              {catalogStats.inStock}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Categories
            </Typography>
            <Typography variant="h5" color="primary.main" sx={{ fontSize: '1.5rem' }}>
              {catalogStats.categories}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ py: 1.5 }}>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.8125rem' }}>
              Avg Rating
            </Typography>
            <Typography variant="h5" color="warning.main" sx={{ fontSize: '1.5rem' }}>
              {catalogStats.avgRating}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: { xs: 1, md: 1.5 }, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' }
        }}>
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '1.1rem' }} />}
              onClick={handleOpenAddDialog}
              size="small"
              sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 'auto' }}
            >
              Add Product
            </Button>
          )}
        </Box>
      </Paper>

      {/* Products Grid - Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }, 
          gap: 3 
        }}>
          {filteredCatalogs.map((product) => (
            <Card key={product.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography gutterBottom variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1.5 }}>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={product.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      ({product.rating})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="primary" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      ${product.price}
                    </Typography>
                    <Chip
                      label={product.inStock ? 'In Stock' : 'Out of Stock'}
                      color={product.inStock ? 'success' : 'error'}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Chip
                    label={product.category}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {canEdit && (
                    <>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(product)}
                      >
                        <EditIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                    </>
                  )}
                  <IconButton size="small" color="secondary">
                    <FavoriteIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                  <IconButton size="small" color="info">
                    <ShareIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </CardActions>
              </Card>
          ))}
        </Box>
      </Box>

      {/* Products List - Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filteredCatalogs.map((product) => (
          <Card key={product.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', p: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, borderRadius: 1, mr: 2 }}
                image={product.image}
                alt={product.title}
              />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1, lineHeight: 1.3 }}>
                  {product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={product.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    ({product.rating})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="primary" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    ${product.price}
                  </Typography>
                  <Chip
                    label={product.inStock ? 'In Stock' : 'Out of Stock'}
                    color={product.inStock ? 'success' : 'error'}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={product.category}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(product)}
                        >
                          <EditIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                        >
                          <DeleteIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleOpenAddDialog}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Product Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="small"
              required
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              size="small"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth size="small" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categories.filter(cat => cat !== 'all').map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography component="legend" sx={{ fontSize: '0.875rem', mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(_, newValue) => setFormData({ ...formData, rating: newValue || 0 })}
              />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.value as boolean })}
                label="Stock Status"
              >
                <MenuItem value="true">In Stock</MenuItem>
                <MenuItem value="false">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Add'} Product
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

export default Catalogs;