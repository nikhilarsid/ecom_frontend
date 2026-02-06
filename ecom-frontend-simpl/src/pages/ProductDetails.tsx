import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductService, { ProductDetail } from "../services/ProductService";
import { Star, ShoppingCart, AlertCircle, Loader2, Check } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
    }
  }, [id, variantId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProductDetail(
        id!,
        variantId || undefined,
      );
      setProduct(data);
    } catch (e) {
      console.error("Fetch failed", e);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (merchantName: string, price: number) => {
    // For now, just console log
    console.log(
      `Added to cart: ${product?.name} from ${merchantName} at $${price}`,
    );
    alert(`Added to cart: ${product?.name} from ${merchantName}`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-black" />
          <p className="text-zinc-500 font-semibold">
            Loading product details...
          </p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 text-center">
          <p className="text-zinc-600 font-semibold">Product not found</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        {/* Product Image - Smaller and elegant */}
        <div className="lg:col-span-1">
          <div className="aspect-[3/4] bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 flex items-center justify-center">
            <img
              src={
                product.imageUrls?.[0] || "https://via.placeholder.com/400x500"
              }
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
          </div>
          {/* Carousel if multiple images */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} ${index + 1}`}
                  className="w-14 h-14 object-cover rounded-lg cursor-pointer border border-zinc-200 hover:border-black transition-colors flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
              {product.brand}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full">
              <Star size={14} className="fill-white" />
              <span className="text-sm font-bold">4.8</span>
            </div>
            <span className="text-xs text-zinc-400 font-semibold">
              (0 REVIEWS)
            </span>
          </div>

          {product.description && (
            <p className="text-zinc-600 mb-8 text-lg leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                Attributes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-1">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-1">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Offers Section */}
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight uppercase">
            Available Offers
          </h2>
        </div>

        {product.sellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.sellers.map((seller, index) => (
              <div
                key={index}
                className="bg-white border border-zinc-100 rounded-[2rem] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-black mb-1">
                    {seller.merchantName}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    {seller.merchantId}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black">
                    ${seller.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  {seller.stock > 0 ? (
                    <>
                      <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                        <Check size={16} />
                        IN STOCK ({seller.stock})
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                      <AlertCircle size={16} />
                      OUT OF STOCK
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleAddToCart(seller.merchantName, seller.price)
                  }
                  disabled={seller.stock === 0}
                  className="w-full bg-black text-white px-4 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 text-center">
            <p className="text-zinc-600 font-semibold">
              No sellers available for this product
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
