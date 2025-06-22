import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Catalog {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  rating: number;
  price: number;
  inStock: boolean;
}

interface CatalogState {
  catalogs: Catalog[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  catalogs: [
    {
      id: 1,
      title: 'Premium Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      category: 'Electronics',
      rating: 4.5,
      price: 299.99,
      inStock: true,
    },
    {
      id: 2,
      title: 'Smart Watch',
      description: 'Advanced smartwatch with health monitoring features',
      category: 'Electronics',
      rating: 4.2,
      price: 199.99,
      inStock: true,
    },
    {
      id: 3,
      title: 'Coffee Maker',
      description: 'Automatic coffee machine with multiple brewing options',
      category: 'Home & Kitchen',
      rating: 4.7,
      price: 149.99,
      inStock: false,
    },
    {
      id: 4,
      title: 'Running Shoes',
      description: 'Professional running shoes with advanced cushioning',
      category: 'Sports',
      rating: 4.3,
      price: 89.99,
      inStock: true,
    },
  ],
  loading: false,
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setCatalogs(state, action: PayloadAction<Catalog[]>) {
      state.catalogs = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCatalog(state, action: PayloadAction<Catalog>) {
      state.catalogs.push(action.payload);
    },
    updateCatalog(state, action: PayloadAction<Catalog>) {
      const index = state.catalogs.findIndex(catalog => catalog.id === action.payload.id);
      if (index !== -1) {
        state.catalogs[index] = action.payload;
      }
    },
    deleteCatalog(state, action: PayloadAction<number>) {
      state.catalogs = state.catalogs.filter(catalog => catalog.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { 
  setCatalogs, 
  addCatalog, 
  updateCatalog, 
  deleteCatalog, 
  setLoading, 
  setError 
} = catalogSlice.actions;
export default catalogSlice.reducer;
