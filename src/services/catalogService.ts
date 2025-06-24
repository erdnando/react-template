import { fetchData, postData, updateData, deleteData } from './api';
import { Catalog } from '../store/slices/catalogSlice';

export interface CreateCatalogRequest {
  title: string;
  description: string;
  category: string;
  image?: string;
  rating?: number;
  price: number;
  inStock?: boolean;
}

export interface UpdateCatalogRequest extends CreateCatalogRequest {
  id: number;
}

// Get all catalogs
export const getCatalogs = async (): Promise<Catalog[]> => {
  return await fetchData<Catalog[]>('catalogs');
};

// Get catalog by ID
export const getCatalogById = async (id: number): Promise<Catalog> => {
  return await fetchData<Catalog>(`catalogs/${id}`);
};

// Get catalogs by category
export const getCatalogsByCategory = async (category: string): Promise<Catalog[]> => {
  return await fetchData<Catalog[]>(`catalogs/category/${category}`);
};

// Create new catalog
export const createCatalog = async (catalogData: CreateCatalogRequest): Promise<Catalog> => {
  return await postData<Catalog>('catalogs', catalogData);
};

// Update existing catalog
export const updateCatalog = async (catalogData: UpdateCatalogRequest): Promise<Catalog> => {
  return await updateData<Catalog>(`catalogs/${catalogData.id}`, catalogData);
};

// Delete catalog
export const deleteCatalog = async (id: number): Promise<void> => {
  return await deleteData<void>(`catalogs/${id}`);
};

// Update catalog stock status
export const updateCatalogStock = async (id: number, inStock: boolean): Promise<Catalog> => {
  return await updateData<Catalog>(`catalogs/${id}/stock`, { inStock });
};
