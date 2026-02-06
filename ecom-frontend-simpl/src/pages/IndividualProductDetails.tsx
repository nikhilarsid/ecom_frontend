import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Star,
  ShoppingCart,
  Zap,
  Loader2,
  Minus,
  Plus,
  AlertCircle,
  Store // Added Store icon
} from "lucide-react";

// --- Styled Components ---
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const FeedbackBanner = styled.div<{ $type: "error" | "success" }>`
  background: ${(props) => (props.$type === "error" ? "#FEF2F2" : "#F0FDF4")};
  border: 1px solid
    ${(props) => (props.$type === "error" ? "#FEE2E2" : "#DCFCE7")};
  color: ${(props) => (props.$type === "error" ? "#991B1B" : "#166534")};
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default function IndividualProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); 
  const variantId = searchParams.get("variantId"); 
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(4.8);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [status, setStatus] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);
  
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [selectedMerchantForReview, setSelectedMerchantForReview] = useState<string>(""); 

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchData = async () => {
    if (!id || !variantId) return;

    try {
      // Fetch Product Details
      const pRes = await fetch(
        `https://product-service-jzzf.onrender.com/api/v1/products/${id}?variantId=${variantId}`,
        { headers: getHeaders() }
      );

      if (pRes.ok) {
        const json = await pRes.json();
        setProduct(json.data);
      } else {
        console.error("Product fetch failed with status:", pRes.status);
      }

      // Fetch Reviews
      const rRes = await fetch(
        `https://review-service-z6zl.onrender.com/api/v1/reviews/product/${id}`,
        { headers: getHeaders() }
      );
      if (rRes.ok) {
        const rJson = await rRes.json();
        setReviews(rJson.data || []);
      }
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("authChange", fetchData);
    return () => window.removeEventListener("authChange", fetchData);
  }, [id, variantId]);

  // ✅ HANDLER: Add to Cart with Local Storage Caching
  const handleAddToCart = async (specificMerchantId?: string) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setStatus({ msg: "Authentication required. Please login.", type: "error" });
      navigate("/login");
      return;
    }

    if (role !== "CUSTOMER") {
      setStatus({ msg: "Action Denied: Only customers can use the cart.", type: "error" });
      return;
    }

    // Determine target merchant
    let targetMerchantId = specificMerchantId;
    if(!targetMerchantId && product?.sellers?.length > 0) {
        targetMerchantId = product.sellers[0].merchantId;
    }

    if(!targetMerchantId) {
        setStatus({ msg: "No merchant offers available.", type: "error" });
        return;
    }

    setIsAdding(true);
    setStatus(null);

    try {
      const productIdNum = Number(id);

      // --- 🆕 CRITICAL: SAVE TO LOCAL STORAGE CACHE ---
      // We save image/name/specs locally so Cart page can show them 
      // without needing to re-fetch from the restricted API.
      const cartDetails = JSON.parse(localStorage.getItem("cartDetails") || "{}");
      
      // Unique key combining all identifying factors
      const cacheKey = `${productIdNum}-${variantId}-${targetMerchantId}`;
      
      cartDetails[cacheKey] = {
        imageUrl: product.imageUrls?.[0] || null,
        productName: product.name,
        specs: product.specs || {}
      };
      
      localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
      // ------------------------------------------------

      // Send Request to Backend
      const res = await fetch(
        "https://order-service-p792.onrender.com/api/cart/addItem",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            productId: productIdNum,
            variantId: variantId,
            merchantId: targetMerchantId,
            quantity: quantity
          }),
        }
      );

      const json = await res.json();

      if (json.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        setStatus({ msg: "Success: Item added to cart.", type: "success" });
      } else {
        setStatus({
          msg: json.message || "Failed to add item.",
          type: "error",
        });
      }
    } catch (e) {
      setStatus({ msg: "Network error. Connection failed.", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    
    if (!selectedMerchantForReview) {
        setStatus({ msg: "Please select which merchant you bought from.", type: 'error' });
        return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch(
        "https://review-service-z6zl.onrender.com/api/v1/reviews",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            productId: id,
            merchantId: selectedMerchantForReview,
            rating: userRating,
            comment: userComment,
          }),
        }
      );
      if (res.ok) {
        setUserComment("");
        fetchData();
        setStatus({ msg: "Review published.", type: "success" });
      } else if (res.status === 403) {
        setStatus({ msg: "You must be logged in to leave a review.", type: "error" });
      }
    } finally {
      setIsReviewing(false);
    }
  };

  if (!product) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        
        {/* Left Column: Image */}
        <div className="lg:col-span-1">
          <div className="aspect-[3/4] bg-zinc-50 rounded-[2rem] overflow-hidden border border-zinc-100 flex items-center justify-center">
            <img
              src={product.imageUrls?.[0] || undefined}
              className="w-full h-full object-contain p-6"
              alt={product.name}
            />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
              {product.brand}
            </span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mt-4 leading-none">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full">
                <Star size={14} fill="white" />
                <span className="font-bold text-sm">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest">
                ({reviews.length} REVIEWS)
              </span>
            </div>
          </div>

          <p className="text-zinc-600 text-lg leading-relaxed">
            {product.description}
          </p>

          {/* Specs */}
          {product.specs && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block mb-1">
                    {key}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Sellers / Offers List */}
          {product.sellers && product.sellers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                Available Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.sellers.map((seller: any, index: number) => (
                  <div key={index} className="bg-white border border-zinc-100 rounded-[2rem] p-6 hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <h4 className="font-black text-lg mb-1">{seller.merchantName}</h4>
                      <p className={`text-xs font-bold uppercase tracking-wider ${seller.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {seller.stock > 0 ? `✓ In Stock (${seller.stock})` : "✕ Out of Stock"}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="font-black text-3xl">${seller.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(seller.merchantId)}
                      disabled={seller.stock === 0}
                      className="w-full bg-black text-white px-4 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:bg-zinc-300 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status && (
            <FeedbackBanner $type={status.type}>
              <AlertCircle size={18} /> {status.msg}
            </FeedbackBanner>
          )}

          {/* Main Action Buttons */}
          <div className="space-y-6 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-8">
              <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Quantity</span>
              <div className="flex items-center bg-zinc-100 rounded-2xl p-1 border border-zinc-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Minus size={16}/></button>
                <span className="px-8 font-black text-xl">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Plus size={16}/></button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => handleAddToCart()} disabled={isAdding} className="flex-[2] bg-black text-white h-20 rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4 hover:opacity-90 transition-opacity">
                {isAdding ? <Spinner size={24} /> : <><ShoppingCart size={24} /> Add to Cart (Quick)</>}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-16 mt-16 border-t border-zinc-100">
            <h3 className="text-3xl font-black tracking-tight italic mb-10 uppercase">Verified Feedback</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-6 bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 mb-12">
                <h4 className="font-bold text-lg">Write a Review</h4>
                
                {product?.sellers && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Bought from which seller?</label>
                        <select 
                            value={selectedMerchantForReview}
                            onChange={(e) => setSelectedMerchantForReview(e.target.value)}
                            className="w-full p-3 rounded-xl border border-zinc-200 bg-white font-medium outline-none focus:border-black transition-colors"
                        >
                            <option value="">-- Select Merchant --</option>
                            {product.sellers.map((s: any) => (
                                <option key={s.merchantId} value={s.merchantId}>{s.merchantName} (${s.price})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star 
                      key={num} 
                      size={32} 
                      onClick={() => setUserRating(num)} 
                      fill={num <= userRating ? "black" : "none"} 
                      className="cursor-pointer hover:scale-110 transition-transform" 
                    />
                  ))}
                </div>
                
                <textarea 
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Describe your experience..."
                  className="w-full p-6 rounded-2xl border-none bg-white shadow-inner outline-none min-h-[120px]"
                />
                
                <button type="submit" disabled={isReviewing} className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-80 transition-opacity">
                  {isReviewing ? <Spinner size={18} /> : "Publish Review"}
                </button>
            </form>

            <div className="grid gap-6">
                {reviews.map((review: any) => (
                    <div key={review.id} className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-zinc-900">{review.userName || "Anonymous"}</span>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                    <Store size={10} /> 
                                    <span>Verified Purchase from: <span className="text-zinc-600">{review.merchantId}</span></span>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < review.rating ? "black" : "#e4e4e7"} stroke="none" />
                                ))}
                            </div>
                        </div>
                        <p className="text-zinc-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                ))}
                {reviews.length === 0 && <p className="text-zinc-400 text-sm">No reviews yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}