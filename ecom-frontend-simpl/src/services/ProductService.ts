import axios from "axios";

const BASE_URL = "https://product-service-jzzf.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- INTERFACES ---

export interface ProductListItem {
  productId: number;
  name: string;
  brand: string;
  description?: string;
  imageUrl: string;
  categories: string[];
  attributes: Record<string, string>;
  lowestPrice: number;
  totalMerchants: number;
  inStock: boolean;
  usp: string[];
  variantId: string;
}

// Interface to match Spring Data Page structure
export interface PagedProductResponse {
  content: ProductListItem[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ProductDetail {
  productId: number;
  name: string;
  brand: string;
  description?: string;
  imageUrls?: string[];
  categories: string[];
  specs: Record<string, string>;
  variantId: string;
  attributes: Record<string, string>;
  sellers: {
    merchantId: string;
    merchantName: string;
    price: number;
    stock: number;
  }[];
}

export interface CreateProductPayload {
  name: string;
  brand: string;
  description?: string;
  categories: string[];
  specs: Record<string, string>;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
  imageUrls: string[];
}

// --- SERVICE CLASS ---

class ProductService {
  /**
   * Returns the full PagedProductResponse.
   * This allows Home.tsx to access 'data.content' and 'data.last'.
   */
  async getAllProducts(page: number = 0, size: number = 4): Promise<PagedProductResponse> {
    const response = await api.get("/products", {
      params: { page, size }
    });
    // Returns the Page object stored in the 'data' field of your ApiResponse
    return response.data.data; 
  }

  async getMerchantListings(): Promise<ProductListItem[]> {
    const response = await api.get("/products/my-listings");
    return response.data.data;
  }

  async getProductDetail(
    productId: string,
    variantId?: string,
  ): Promise<ProductDetail> {
    const params = variantId ? { variantId } : {};
    const response = await api.get(`/products/${productId}`, { params });
    return response.data;
  }

  async createProduct(payload: CreateProductPayload): Promise<any> {
    const response = await api.post("/products", payload);
    return response.data;
  }

  async updateInventory(
    productId: string,
    variantId: string,
    price: number,
    stock: number,
  ): Promise<any> {
    const response = await api.put(
      `/products/inventory/${productId}?variantId=${variantId}&price=${price}&stock=${stock}`,
    );
    return response.data;
  }

  async deleteInventory(productId: string, variantId: string): Promise<any> {
    const response = await api.delete(
      `/products/inventory/${productId}?variantId=${variantId}`,
    );
    return response.data;
  }

  async searchProducts(keyword: string): Promise<ProductListItem[]> {
    const response = await api.get("/products/search", { params: { keyword } });
    return response.data.data;
  }
}

export default new ProductService();