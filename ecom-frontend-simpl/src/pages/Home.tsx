import { useState, useEffect } from "react";
import { Search, HardDrive, Palette, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import ProductService, { ProductListItem } from "../services/ProductService";

// --- TYPES ---
interface Product extends ProductListItem {}

// --- CATEGORIES ---
const FILTER_CATEGORIES = [
  "Electricals",
  "Sports",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Books",
  "Toys",
];

const getAttributeIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case "storage":
      return <HardDrive size={14} />;
    case "color":
      return <Palette size={14} />;
    default:
      return null;
  }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, allProducts]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllProducts();
      setAllProducts(data);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...allProducts];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter((p) =>
        p.categories?.includes(selectedCategory),
      );
    }

    setProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Search Bar */}
      <div className="flex gap-4 mb-8 items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="Search by brand or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {(searchTerm || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Clear
          </button>
        )}
      </div>

      {/* Category Filter Dropdown */}
      <div className="mb-8">
        <label className="text-sm font-black uppercase tracking-widest text-zinc-600 block mb-3">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white font-semibold text-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all min-w-[250px]"
        >
          <option value="">All Categories</option>
          {FILTER_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold">{products.length}</span> product
          {products.length !== 1 ? "s" : ""}
          {selectedCategory && (
            <span className="ml-2">
              in <span className="font-bold">{selectedCategory}</span>
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
            <p className="text-zinc-500 font-semibold">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-semibold">
              No products found
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your filters or search term
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={`${product.productId}-${product.variantId}`}
              to={`/product/${product.productId}?variantId=${product.variantId}`}
              className="block group"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                {!product.inStock && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-10">
                    Out of Stock
                  </div>
                )}
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={
                      product.imageUrl || "https://via.placeholder.com/400x500"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wide">
                    {product.brand}
                  </span>
                  <h3 className="text-lg font-bold mt-1 leading-tight">
                    {product.name}
                  </h3>

                  {/* Attributes */}
                  <div className="mt-2 mb-3 flex flex-wrap gap-2">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-xs"
                      >
                        {getAttributeIcon(key)}
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">
                      ${product.lowestPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.totalMerchants} seller
                      {product.totalMerchants !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
