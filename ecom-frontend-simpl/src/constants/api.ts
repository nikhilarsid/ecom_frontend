// --- BASE URLS ---
const AUTH_BASE = "https://auth-service-qivh.onrender.com/api/auth";
const PRODUCT_BASE =
  "https://product-service-jzzf.onrender.com/api/v1/products";
const ORDER_BASE = "https://order-service-p792.onrender.com/api";
const REVIEW_BASE = "https://review-service-z6zl.onrender.com/api/v1/reviews";

export const API_ENDPOINTS = {
  // --- AUTH SERVICE ---
  LOGIN: `${AUTH_BASE}/login`,
  REGISTER: `${AUTH_BASE}/register`,

  // --- PRODUCT SERVICE ---
  GET_ALL_PRODUCTS: `${PRODUCT_BASE}`,
  GET_SINGLE_PRODUCT: (id: string) => `${PRODUCT_BASE}/${id}`,
  GET_SEARCH_PRODUCTS: (keyword: string) =>
    `${PRODUCT_BASE}/search?keyword=${keyword}`,
  GET_MERCHANT_LISTINGS: `${PRODUCT_BASE}/my-listings`,

  // --- ORDER & CART SERVICE ---
  GET_CART: `${ORDER_BASE}/cart`,
  ADD_TO_CART: `${ORDER_BASE}/cart/add`,
  ORDER_HISTORY: `${ORDER_BASE}/orders/history`,

  // --- REVIEW SERVICE ---
  POST_REVIEW: `${REVIEW_BASE}`,
  GET_PRODUCT_REVIEWS: (productId: string) =>
    `${REVIEW_BASE}/product/${productId}`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
};
