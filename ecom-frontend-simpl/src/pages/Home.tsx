import { useState, useEffect, useRef } from "react";
import {
  Search,
  HardDrive,
  Palette,
  Loader2,
  X,
  Store,
  ChevronDown,
  Check,
  Cpu,
  Layers,
} from "lucide-react";
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

// Enhanced Icon Logic
const getAttributeIcon = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes("storage") || k.includes("memory"))
    return <HardDrive size={14} className="text-zinc-900" />;
  if (k.includes("color") || k.includes("colour"))
    return <Palette size={14} className="text-zinc-900" />;
  if (k.includes("processor") || k.includes("cpu"))
    return <Cpu size={14} className="text-zinc-900" />;
  return <Layers size={14} className="text-zinc-900" />;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

  // ... (Existing useEffects and handlers remain exactly the same) ...
  // [Copy-paste your existing useEffects, handleSearchChange, etc. here]
  // To save space, I am focusing on the render part below where the change happens.

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
    const outsideHandler = (e: MouseEvent) => {
      const sug = suggestionsRef.current;
      const input = searchInputRef.current;
      if (e.target instanceof Node) {
        if (sug && sug.contains(e.target)) return;
        if (input && input.contains(e.target)) return;
        setShowSuggestions(false);
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };

    document.addEventListener("mousedown", outsideHandler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", outsideHandler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  useEffect(() => {
    fetchAllProducts(0);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, allProducts]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
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

  const loadNextPage = () => {
    if (searchTerm.trim() || selectedCategory) return;
    if (loading || isFetchingBatch || !hasMore) return;
    fetchAllProducts(currentPage, 8);
  };

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
  }, [sentinelRef.current, currentPage, loading, isFetchingBatch, hasMore]);

  const applyFilters = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const searchResults = await ProductService.searchProducts(
          searchTerm.trim(),
        );
        const validResults = (searchResults || []).filter(
          (p: any) => p !== null,
        );
        const final = selectedCategory
          ? validResults.filter((p) => p.categories?.includes(selectedCategory))
          : validResults;
        setProducts(final);
      } catch (e) {
        let filtered = [...allProducts];
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
        );
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

    if (selectedCategory) {
      try {
        setLoading(true);
        const data = await ProductService.getAllProducts(
          0,
          100,
          selectedCategory.toLowerCase(),
        );
        const validResults = data.content.filter((p: any) => p !== null);
        setProducts(validResults);
      } catch (e) {
        const filtered = allProducts.filter((p) =>
          p.categories?.includes(selectedCategory),
        );
        setProducts(filtered);
      } finally {
        setLoading(false);
      }
      return;
    }
    setProducts(allProducts);
  };

  const totalMerchantsCount = products
    .filter((p) => p !== null)
    .reduce((acc, product) => acc + (product.totalMerchants || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Search Bar & Filters Section (Unchanged) */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg border border-gray-200 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm sm:text-base"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setShowSuggestions(false);
            }}
            onFocus={() =>
              searchTerm && suggestions.length > 0 && setShowSuggestions(true)
            }
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.productId}-${suggestion.variantId}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-2 sm:p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors text-left"
                >
                  <img
                    src={
                      suggestion.imageUrl || "https://via.placeholder.com/50"
                    }
                    alt={suggestion.name}
                    className="w-10 sm:w-12 h-10 sm:h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.brand}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-black">
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
            onClick={() => {
              setSearchTerm("");
              setSuggestions([]);
              setShowSuggestions(false);
              if (searchInputRef.current) searchInputRef.current.focus();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center sm:justify-start gap-2 flex-shrink-0 text-xs sm:text-base"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />{" "}
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      <div className="mb-4 sm:mb-6 hidden lg:block">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-600 block">
            Filter by Category
          </label>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-gray-700 transition flex items-center gap-1"
            >
              <X size={12} className="sm:w-[14px] sm:h-[14px]" /> Clear
            </button>
          )}
        </div>
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-semibold transition-all ${selectedCategory === "" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700 hover:shadow"}`}
          >
            All
          </button>
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-semibold transition-all ${selectedCategory === category ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-700 hover:shadow"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 sm:mb-6 block lg:hidden">
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div ref={mobileDropdownRef} className="relative w-full">
              <button
                onClick={() => setMobileDropdownOpen((s) => !s)}
                className="w-full text-left flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-transparent"
              >
                <span className="truncate text-xs sm:text-sm font-semibold text-gray-700">
                  {selectedCategory || "All Categories"}
                </span>
                <ChevronDown
                  size={14}
                  className="sm:w-[16px] sm:h-[16px] text-gray-500 flex-shrink-0"
                />
              </button>
              {mobileDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setMobileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold ${selectedCategory === "" ? "bg-gray-50" : "hover:bg-gray-50"}`}
                  >
                    All Categories
                  </button>
                  {FILTER_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setMobileDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold ${selectedCategory === category ? "bg-gray-50" : "hover:bg-gray-50"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-gray-600 px-1">
          Showing <span className="font-bold">{products.length}</span> unique
          products available from{" "}
          <span className="font-bold">{totalMerchantsCount}</span> different
          merchants
        </p>
      </div>

      {/* --- MAIN GRID --- */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link
                key={`${product.productId}-${product.variantId}`}
                to={`/product/${product.productId}?variantId=${product.variantId}`}
                className="block group h-full"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 relative flex flex-col h-full group-hover:border-zinc-300">
                  {/* Out of Stock Badge */}
                  {!product.inStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 shadow-sm">
                      Out of Stock
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-[#f8f8f8] overflow-hidden flex-shrink-0 relative">
                    <img
                      src={
                        product.imageUrl ||
                        "https://via.placeholder.com/400x500"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Brand & USP */}
                    <div className="mb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1 block">
                          {product.brand}
                        </span>
                        {product.usp && product.usp.length > 0 && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {product.usp[0]}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 leading-tight line-clamp-2 min-h-[3rem]">
                        {product.name}
                      </h3>
                    </div>

                    {/* ✅ UPDATED: Professional Spec Pills */}
                    {((product.attributes &&
                      Object.keys(product.attributes).length > 0) ||
                      (product.specs &&
                        Object.keys(product.specs).length > 0)) && (
                      <div className="mt-4 mb-4">
                        {(() => {
                          const source =
                            product.attributes || product.specs || {};
                          const entries = Object.entries(source).slice(0, 2); // Show top 2 specs
                          return (
                            <div className="flex flex-wrap gap-2">
                              {entries.map(([k, v]) => (
                                <div
                                  key={k}
                                  className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1.5 max-w-full"
                                >
                                  {/* Icon container */}
                                  <div className="flex-shrink-0 opacity-60">
                                    {getAttributeIcon(String(k))}
                                  </div>

                                  {/* Text Stack */}
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider leading-none mb-0.5 truncate">
                                      {k}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-800 leading-none truncate">
                                      {String(v)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Footer: Price & Merchants */}
                    <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-0.5">
                            Starting at
                          </p>
                          <span className="text-xl font-black text-zinc-900">
                            $
                            {product.lowestPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black text-white px-2.5 py-1.5 rounded-lg">
                          <Store size={12} className="text-zinc-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">
                            {product.totalMerchants}{" "}
                            {product.totalMerchants === 1
                              ? "Option"
                              : "Options"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Loaders */}
          {isFetchingBatch && (
            <div className="flex flex-col items-center justify-center py-10 gap-4 mt-8">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Loading next batch...
              </p>
            </div>
          )}
          <div ref={sentinelRef} className="h-1 w-full" />
        </>
      )}
    </div>
  );
}
