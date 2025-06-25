import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as catalogService from '../../services/catalogService';

export interface Catalog {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  rating: number;
  price: number;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CatalogState {
  catalogs: Catalog[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  catalogs: [],
  loading: false,
  error: null,
};

const mapCatalogDtoToCatalog = (dto: catalogService.CatalogDto): Catalog => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  category: dto.category,
  image: dto.image,
  rating: dto.rating ?? 0,
  price: dto.price,
  inStock: dto.inStock,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

export const fetchCatalogs = createAsyncThunk('catalog/fetchAll', async (_, thunkAPI) => {
  try {
    const data = await catalogService.getCatalogs();
    return data.map(mapCatalogDtoToCatalog);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error fetching catalogs');
  }
});

export const createCatalogAsync = createAsyncThunk('catalog/create', async (catalog: catalogService.CreateCatalogDto, thunkAPI) => {
  try {
    const data = await catalogService.createCatalog(catalog);
    return mapCatalogDtoToCatalog(data);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error creating catalog');
  }
});

export const updateCatalogAsync = createAsyncThunk('catalog/update', async ({ id, data }: { id: number, data: catalogService.UpdateCatalogDto }, thunkAPI) => {
  try {
    const updated = await catalogService.updateCatalog(id, data);
    return mapCatalogDtoToCatalog(updated);
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error updating catalog');
  }
});

export const deleteCatalogAsync = createAsyncThunk('catalog/delete', async (id: number, thunkAPI) => {
  try {
    await catalogService.deleteCatalog(id);
    return id;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue((err as Error).message || 'Error deleting catalog');
  }
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogs = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCatalogAsync.fulfilled, (state, action) => {
        state.catalogs.push(action.payload);
      })
      .addCase(updateCatalogAsync.fulfilled, (state, action) => {
        const idx = state.catalogs.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.catalogs[idx] = action.payload;
      })
      .addCase(deleteCatalogAsync.fulfilled, (state, action) => {
        state.catalogs = state.catalogs.filter(c => c.id !== action.payload);
      });
  },
});

export default catalogSlice.reducer;
export type { CatalogState };
