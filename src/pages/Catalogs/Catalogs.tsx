import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { addCatalog, updateCatalog, deleteCatalog, Catalog } from '../../store/slices/catalogSlice';

const Catalogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Catalog | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    rating: 0,
    inStock: true,
  });

  const dispatch = useDispatch();
  // Obtener catálogos del estado global
  const catalogs = useSelector((state: RootState) => state.catalog.catalogs);

  const categories = ['all', 'Electronics', 'Home & Kitchen', 'Sports', 'Books', 'Clothing'];

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

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // Handle form submission
  const handleSubmitProduct = () => {
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const productData = {
      id: editingProduct ? editingProduct.id : Date.now(), // Use timestamp for new products
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      rating: formData.rating,
      inStock: formData.inStock,
    };

    if (editingProduct) {
      dispatch(updateCatalog(productData));
      setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
    } else {
      dispatch(addCatalog(productData));
      setSnackbar({ open: true, message: 'Product added successfully!', severity: 'success' });
    }

    handleCloseDialog();
  };

  // Handle delete product
  const handleDeleteProduct = (productId: number) => {
    dispatch(deleteCatalog(productId));
    setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage your product inventory
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Product
        </Button>
      </Box>

      {/* Product Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: 3,
          mb: 4
        }}
      >
        {filteredCatalogs.map((catalog) => (
          <Card key={catalog.id} sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <CategoryIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {catalog.title}
                </Typography>
                <Chip 
                  label={catalog.inStock ? 'In Stock' : 'Out of Stock'} 
                  color={catalog.inStock ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {catalog.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={catalog.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({catalog.rating})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  ${catalog.price}
                </Typography>
                <Chip label={catalog.category} variant="outlined" size="small" />
              </Box>
            </CardContent>
            
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  aria-label="edit product"
                  onClick={() => handleOpenEditDialog(catalog)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  aria-label="delete product"
                  onClick={() => handleDeleteProduct(catalog.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton aria-label="add to favorites" size="small">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share" size="small">
                  <ShareIcon />
                </IconButton>
              </Box>
            </CardActions>
          </Card>
        ))}
      </Box>

      {filteredCatalogs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search criteria or add a new product
          </Typography>
          <Button variant="contained" onClick={handleOpenAddDialog}>
            Add First Product
          </Button>
        </Box>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Product Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price *"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category *</InputLabel>
              <Select 
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.filter(cat => cat !== 'all').map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, rating: newValue || 0 }));
                }}
                precision={0.5}
              />
            </Box>
            <FormControl sx={{ mb: 2 }}>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={formData.inStock ? 'inStock' : 'outOfStock'}
                onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.value === 'inStock' }))}
                label="Stock Status"
              >
                <MenuItem value="inStock">In Stock</MenuItem>
                <MenuItem value="outOfStock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitProduct}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenAddDialog}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Catalogs;