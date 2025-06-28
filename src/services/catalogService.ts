// Catalog API service - Updated to match new API structure
import { apiRequest, ApiResponse } from './apiClient';

// Catalog DTOs based on the API definition
export interface CatalogDto {
  id: number;
  title: string | null;
  description: string | null;
  category: string | null;
  image: string | null;
  rating: number;
  price: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogDto {
  title: string | null;
  description: string | null;
  category: string | null;
  image: string | null;
  rating: number;
  price: number;
  inStock: boolean;
}

export interface UpdateCatalogDto {
  title: string | null;
  description: string | null;
  category: string | null;
  image: string | null;
  rating: number | null;
  price: number | null;
  inStock: boolean | null;
}

// Catalog service functions
export const catalogService = {
  // Get all catalogs
  getCatalogs: (): Promise<ApiResponse<CatalogDto[]>> => {
    return apiRequest.get<CatalogDto[]>('/Catalog');
  },

  // Get catalog by ID
  getCatalogById: (id: number): Promise<ApiResponse<CatalogDto>> => {
    return apiRequest.get<CatalogDto>(`/Catalog/${id}`);
  },

  // Get catalogs by category
  getCatalogsByCategory: (category: string): Promise<ApiResponse<CatalogDto[]>> => {
    return apiRequest.get<CatalogDto[]>(`/Catalog/category/${encodeURIComponent(category)}`);
  },

  // Get catalogs by type
  getCatalogsByType: (type: string): Promise<ApiResponse<CatalogDto[]>> => {
    return apiRequest.get<CatalogDto[]>(`/Catalog/type/${encodeURIComponent(type)}`);
  },

  // Get active catalogs
  getActiveCatalogs: (): Promise<ApiResponse<CatalogDto[]>> => {
    return apiRequest.get<CatalogDto[]>('/Catalog/active');
  },

  // Get catalogs in stock
  getCatalogsInStock: (): Promise<ApiResponse<CatalogDto[]>> => {
    return apiRequest.get<CatalogDto[]>('/Catalog/in-stock');
  },

  // Create new catalog
  createCatalog: (catalogData: CreateCatalogDto): Promise<ApiResponse<CatalogDto>> => {
    return apiRequest.post<CatalogDto>('/Catalog', catalogData);
  },

  // Update catalog
  updateCatalog: (id: number, catalogData: UpdateCatalogDto): Promise<ApiResponse<CatalogDto>> => {
    return apiRequest.put<CatalogDto>(`/Catalog/${id}`, catalogData);
  },

  // Delete catalog
  deleteCatalog: (id: number): Promise<ApiResponse<boolean>> => {
    return apiRequest.delete<boolean>(`/Catalog/${id}`);
  },

  // Update catalog status (activate/deactivate)
  updateCatalogStatus: (id: number, isActive: boolean): Promise<ApiResponse<CatalogDto>> => {
    return apiRequest.patch<CatalogDto>(`/Catalog/${id}/status`, isActive);
  },
};

// Export individual functions for backward compatibility
export const getCatalogs = catalogService.getCatalogs;
export const getCatalogById = catalogService.getCatalogById;
export const getCatalogsByCategory = catalogService.getCatalogsByCategory;
export const getCatalogsByType = catalogService.getCatalogsByType;
export const getActiveCatalogs = catalogService.getActiveCatalogs;
export const getCatalogsInStock = catalogService.getCatalogsInStock;
export const createCatalog = catalogService.createCatalog;
export const updateCatalog = catalogService.updateCatalog;
export const deleteCatalog = catalogService.deleteCatalog;
export const updateCatalogStatus = catalogService.updateCatalogStatus;

export default catalogService;
