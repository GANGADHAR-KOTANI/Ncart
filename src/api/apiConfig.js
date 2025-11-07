export const BASE_URL = "https://selecto-project.onrender.com";

export const ENDPOINTS = {
  SELLERS: `${BASE_URL}/apis/sellers`,
  SELLER_PRODUCTS: (sellerId) => `${BASE_URL}/apis/${sellerId}/products`,
  SELLER_CATEGORIES: (sellerId) => `${BASE_URL}/sellers/${sellerId}/categories`, // ✅ fixed path
  PRODUCTS_BY_CATEGORY: (sellerId, category) =>
    `${BASE_URL}/sellers/${sellerId}/products/${category}`,
};
