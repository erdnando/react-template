import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5096/api';

export interface CatalogDto {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  rating?: number;
  price: number;
  inStock: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCatalogDto {
  title: string;
  description: string;
  category: string;
  image?: string;
  rating?: number;
  price: number;
  inStock?: boolean;
}

export interface UpdateCatalogDto {
  title: string;
  description: string;
  category: string;
  image?: string;
  rating?: number;
  price: number;
  inStock?: boolean;
}

// Obtener todos los catálogos
export const getCatalogs = async (): Promise<CatalogDto[]> => {
  const res = await axios.get(`${API_URL}/Catalog`);
  return res.data.data;
};

// Obtener un catálogo por ID
export const getCatalogById = async (id: number): Promise<CatalogDto> => {
  const res = await axios.get(`${API_URL}/Catalog/${id}`);
  return res.data.data;
};

// Crear un nuevo catálogo
export const createCatalog = async (catalog: CreateCatalogDto): Promise<CatalogDto> => {
  const res = await axios.post(`${API_URL}/Catalog`, catalog);
  return res.data.data;
};

// Actualizar un catálogo existente
export const updateCatalog = async (id: number, catalog: UpdateCatalogDto): Promise<CatalogDto> => {
  const res = await axios.put(`${API_URL}/Catalog/${id}`, catalog);
  return res.data.data;
};

// Eliminar un catálogo
export const deleteCatalog = async (id: number): Promise<boolean> => {
  const res = await axios.delete(`${API_URL}/Catalog/${id}`);
  return res.data.data;
};
