import { useState, useEffect, useRef } from "react";
import { Search, HardDrive, Palette, Loader2, X, Store, ChevronDown, Check } from "lucide-react";
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
  const [isFetchingBatch, setIsFetchingBatch] = useState(false); // Track batch loading specifically
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

  // close mobile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = mobileDropdownRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetchAllProducts(0);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, allProducts]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const results = await ProductService.searchProducts(query);
      setSuggestions(results.slice(0, 8));
      setShowSuggestions(true);
    } catch (e) {
      console.error("Suggestions fetch failed", e);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    setProducts([product]);
  };

  const fetchAllProducts = async (page: number = 0, size: number = 8) => {
    // Fetch a single page and append (or replace if page === 0)
    try {
      if (page === 0) setLoading(true);
      else setIsFetchingBatch(true);

      const data = await ProductService.getAllProducts(page, size);

      if (page === 0) {
        setAllProducts(data.content);
        setProducts(data.content);
      } else {
        setAllProducts((prev) => {
          const merged = [...prev, ...data.content];
          setProducts(merged);
          return merged;
        });
      }

      setHasMore(!data.last);
      setCurrentPage(page + 1);
    } catch (e) {
      console.error("Paged fetch failed", e);
    } finally {
      setLoading(false);
      setIsFetchingBatch(false);
    }
  };

  // load next page when sentinel becomes visible
  const loadNextPage = () => {
    // don't auto-load when filters/search active
    if (searchTerm.trim() || selectedCategory) return;
    if (loading || isFetchingBatch || !hasMore) return;
    fetchAllProducts(currentPage, 8);
  };

  // IntersectionObserver to trigger loading when user scrolls to bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadNextPage();
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, currentPage, loading, isFetchingBatch, hasMore]);

  const applyFilters = async () => {
    if (searchTerm.trim() || selectedCategory) {
      try {
        setLoading(true);
        const categoryParam = selectedCategory
          ? selectedCategory.toLowerCase()
          : undefined;
        const data = await ProductService.getAllProducts(
          0,
          100,
          categoryParam,
          searchTerm.trim() || undefined,
        );

        // ✅ FIX: Filter out nulls here too
        const validResults = data.content.filter((p: any) => p !== null);
        setProducts(validResults);
      } catch (e) {
        console.error(
          "Filtered fetch failed, falling back to client filter",
          e,
        );

        // Fallback: Filter allProducts (which we already cleaned in fetchAllProducts)
        let filtered = [...allProducts];

        if (searchTerm.trim()) {
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
          );
        }
        if (selectedCategory) {
          filtered = filtered.filter((p) =>
            p.categories?.includes(selectedCategory),
          );
        }
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
      return;
    }

    // No filters
    setProducts(allProducts);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
  };

  const totalMerchantsCount = products
    .filter((p) => p !== null) // Filter out nulls first
    .reduce((acc, product) => acc + (product.totalMerchants || 0), 0);
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
            ref={searchInputRef}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="Search by brand or model..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() =>
              searchTerm && suggestions.length > 0 && setShowSuggestions(true)
            }
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.productId}-${suggestion.variantId}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                >
                  <img
                    src={
                      suggestion.imageUrl || "https://via.placeholder.com/50"
                    }
                    alt={suggestion.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500">{suggestion.brand}</p>
                    <p className="text-sm font-bold text-black">
                      ${suggestion.lowestPrice.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(""); setSuggestions([]); setShowSuggestions(false); if (searchInputRef.current) searchInputRef.current.focus(); }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <X size={18} />
            Clear
          </button>
        )}
      </div>

      {/* Category Filter — visible as pillar chips on large screens */}
      <div className="mb-6 hidden lg:block">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black uppercase tracking-widest text-zinc-600 block">
            Filter by Category
          </label>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Choose a category to narrow results</div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-semibold text-gray-700 transition"
              >
                <X size={14} />
                <span className="ml-2">Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3 py-2 text-sm rounded-full font-semibold transition-all ${selectedCategory === "" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700 hover:shadow"}`}
          >
            All
          </button>

          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 text-sm rounded-full font-semibold transition-all ${selectedCategory === category ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700 hover:shadow"}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* mobile select removed intentionally to hide filter on small screens */}
      </div>

      {/* Compact mobile filter bar (small screens only) */}
      <div className="mb-6 block lg:hidden">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div ref={mobileDropdownRef} className="relative w-full">
              <button
                onClick={() => setMobileDropdownOpen((s) => !s)}
                className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-transparent"
                aria-haspopup="listbox"
                aria-expanded={mobileDropdownOpen}
              >
                <span className="truncate text-sm font-semibold text-gray-700">
                  {selectedCategory || "All Categories"}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {mobileDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedCategory(""); setMobileDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-semibold ${selectedCategory === "" ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Categories</span>
                      {selectedCategory === "" && <Check size={14} className="text-black" />}
                    </div>
                  </button>
                  {FILTER_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => { setSelectedCategory(category); setMobileDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold ${selectedCategory === category ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{category}</span>
                        {selectedCategory === category && <Check size={14} className="text-black" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button
                onClick={() => { setSelectedCategory(""); setMobileDropdownOpen(false); }}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold transition"
                aria-label="Clear filters"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold">{products.length}</span> unique
          products
          {products.length !== 1 ? "s" : ""} available from{" "}
          <span className="font-bold">{totalMerchantsCount}</span> different
          merchants
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link
                key={`${product.productId}-${product.variantId}`}
                to={`/product/${product.productId}?variantId=${product.variantId}`}
                className="block group h-full"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col h-full">
                  {!product.inStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-10">
                      Out of Stock
                    </div>
                  )}
                  <div className="aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                    <img
                      src={
                        product.imageUrl ||
                        "https://via.placeholder.com/400x500"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-gray-400 tracking-wide">
                        {product.brand}
                      </span>

                      {product.usp && product.usp.length > 0 && (
                        <div className="mt-1 mb-2">
                          <span className="text-[8px] font-black uppercase tracking-widest text-black bg-zinc-100 px-1.5 py-0.5 rounded">
                            {product.usp[0]}
                          </span>
                        </div>
                      )}

                      <h3 className="text-lg font-bold mt-1 leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-bold">
                          ${product.lowestPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Store size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {product.totalMerchants}{" "}
                          {product.totalMerchants === 1 ? "Seller" : "Sellers"}{" "}
                          available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Staggered batch loading symbol */}
          {isFetchingBatch && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Loading next batch...
              </p>
            </div>
          )}
          {/* sentinel triggers loading of next page when visible */}
          <div ref={sentinelRef} className="h-1 w-full" />
        </>
      )}
    </div>
  );
}
