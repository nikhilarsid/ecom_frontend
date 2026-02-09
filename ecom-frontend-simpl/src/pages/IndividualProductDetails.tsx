import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Star,
  ShoppingCart,
  Loader2,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AuthModal from "../components/AuthModal";
import { showToast } from "../utils/toast";

// --- CONSTANTS ---
const MAX_PURCHASE_LIMIT = 5;

// --- ANIMATIONS ---
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

// --- STYLED COMPONENTS ---
const FeedbackBanner = styled.div<{ $type: "error" | "success" }>`
  background: ${(props) => (props.$type === "error" ? "#FEF2F2" : "#F0FDF4")};
  border: 1px solid ${(props) => (props.$type === "error" ? "#FEE2E2" : "#DCFCE7")};
  color: ${(props) => (props.$type === "error" ? "#991B1B" : "#166534")};
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center; gap: 10px; margin-bottom: 24px; text-transform: uppercase;
`;

const ThumbnailButton = styled.button<{ $active: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  border: 2px solid ${props => props.$active ? '#000' : '#f1f1f1'};
  background: #fff;
  overflow: hidden;
  flex-shrink: 0;
  transition: all 0.2s ease;
  padding: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    border-color: ${props => props.$active ? '#000' : '#d1d1d6'};
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  cursor: grab;
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export default function IndividualProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("userName");
  const token = localStorage.getItem("token");

  // State
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [selectedMerchantForReview, setSelectedMerchantForReview] = useState<string>("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token && token !== "null" ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchData = async () => {
    if (!id || !variantId) return;
    try {
      const cleanId = id.replace(':', '');
      const pRes = await fetch(`https://product-service-jzzf.onrender.com/api/v1/products/${cleanId}?variantId=${variantId}`, { headers: getHeaders() });
      if (pRes.ok) {
        const json = await pRes.json();
        setProduct(json.data);
        if (json.data.sellers?.length > 0) setSelectedMerchantForReview(json.data.sellers[0].merchantId);
      }
    } catch (e) { console.error("Product fetch failed", e); }
  };

  const fetchReviews = async () => {
    if (!id) return;
    const cleanId = id.replace(':', '');
    try {
      const rRes = await fetch(`https://review-service-z6zl.onrender.com/api/v1/reviews/product/${cleanId}`, { 
        headers: getHeaders() 
      });
      if (rRes.ok) {
        const rJson = await rRes.json();
        setReviews(rJson || []);
        
        const existing = rJson.find((r: any) => r.userName === currentUserEmail && r.variantId === variantId);
        if (existing) {
          setEditingReviewId(existing.id);
          setUserRating(existing.rating);
          setUserComment(existing.comment);
        } else {
          setEditingReviewId(null);
          setUserComment("");
          setUserRating(5);
        }
      }
    } catch (e) { console.error("Review fetch failed", e); }
  };

  useEffect(() => { fetchData(); }, [id, variantId]);
  useEffect(() => { fetchReviews(); }, [id, variantId]);

  // --- QUANTITY HANDLERS ---
  const incrementQuantity = () => {
    if (quantity < MAX_PURCHASE_LIMIT) {
      setQuantity(prev => prev + 1);
    } else {
      showToast.error(`Maximum purchase limit is ${MAX_PURCHASE_LIMIT} items`);
    }
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setShowAuthModal(true); return; }
    if (!userComment.trim() || !selectedMerchantForReview) return;

    setIsReviewing(true);
    setStatus(null);

    const productIdNum = Number(id?.replace(':', ''));
    const payload = editingReviewId 
      ? { rating: userRating, comment: userComment }
      : { productId: productIdNum, variantId, merchantId: selectedMerchantForReview, rating: userRating, comment: userComment };

    const url = editingReviewId 
      ? `https://review-service-z6zl.onrender.com/api/v1/reviews/update/${editingReviewId}`
      : `https://review-service-z6zl.onrender.com/api/v1/reviews/create`;

    try {
      const res = await fetch(url, { 
        method: editingReviewId ? "PUT" : "POST", 
        headers: getHeaders(), 
        body: JSON.stringify(payload) 
      });
      const resJson = await res.json();

      if (res.ok) {
        showToast.success(editingReviewId ? "Review updated!" : "Feedback published!");
        fetchReviews();
      } else {
        setStatus({ msg: resJson.message || `Error ${res.status}`, type: "error" });
      }
    } catch (e) { setStatus({ msg: "Service unreachable", type: "error" }); } finally { setIsReviewing(false); }
  };

  const handleDeleteReview = async () => {
    if (!editingReviewId) return;
    try {
      const res = await fetch(`https://review-service-z6zl.onrender.com/api/v1/reviews/delete/${editingReviewId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showToast.success("Review deleted");
        setEditingReviewId(null);
        setUserComment("");
        fetchReviews();
      }
    } catch (e) { console.error("Delete error", e); }
  };

  const handleAddToCart = async (specificMerchantId?: string) => {
  if (!token) {
    setShowAuthModal(true);
    return;
  }

  // Safety check: Don't allow adding more than the limit
  if (quantity > MAX_PURCHASE_LIMIT) {
    showToast.error(`Limit is ${MAX_PURCHASE_LIMIT} items`);
    return;
  }

  const targetMerchantId = specificMerchantId || product.sellers[0]?.merchantId;
  if (!targetMerchantId) return;

  setIsAdding(true);
  try {
    const cleanId = Number(id?.replace(':', ''));
    
    // LOG THIS: Check console to see if quantity is what you expect right before fetch
    console.log("Sending to Cart:", { productId: cleanId, quantity });

    const res = await fetch("https://order-service-p792.onrender.com/api/cart/addItem", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        productId: cleanId,
        variantId: variantId,
        merchantId: targetMerchantId,
        // FORCE the quantity to be a Number type
        quantity: Number(quantity) 
      }),
    });

    if (res.ok) {
      window.dispatchEvent(new Event("cartUpdated"));
      showToast.success(`Added ${quantity} item(s) to Bag`);
    } else {
      const errorData = await res.json();
      showToast.error(errorData.message || "Failed to add to cart");
    }
  } catch (e) {
    showToast.error("Service unreachable");
  } finally {
    setIsAdding(false);
  }
};

  if (!product) return <div className="flex justify-center py-40"><Spinner size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
        {/* Media Gallery */}
        <div className="space-y-6">
          <div className="aspect-square bg-white rounded-[3rem] border border-zinc-100 flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src={product.imageUrls?.[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain p-12 transition-all duration-500" 
            />
          </div>
          <ScrollContainer>
            {product.imageUrls?.map((url: string, index: number) => (
              <ThumbnailButton 
                key={index} 
                $active={activeImage === index} 
                onClick={() => setActiveImage(index)}
              >
                <img src={url} alt={`View ${index + 1}`} />
              </ThumbnailButton>
            ))}
          </ScrollContainer>
          <div className="flex gap-4">
             <div className="flex-1 bg-zinc-50 rounded-2xl p-6 flex items-center gap-3">
                <ShieldCheck className="text-zinc-400" size={20}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Genuine Product</span>
             </div>
             <div className="flex-1 bg-zinc-50 rounded-2xl p-6 flex items-center gap-3">
                <Zap className="text-zinc-400" size={20}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</span>
             </div>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-black text-2xl font-black uppercase tracking-[0.2em] border-b-4 border-zinc-100 pb-1">
                  {product.brand}
                </span>
                
                {product.usp && product.usp.length > 0 && (
                  <span className="text-[10px] font-black bg-black text-white px-4 py-2 rounded-full uppercase tracking-widest italic shadow-lg">
                    {product.usp[0]}
                  </span>
                )}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6">{product.name}</h1>
            
            {product.usp && product.usp.length > 1 && (
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
                {product.usp.slice(1).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="flex bg-black text-white px-3 py-1 rounded-full items-center gap-1.5">
              <Star size={12} fill="white"/>
              <span className="text-xs font-black">4.8</span>
            </div>
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{reviews.length} Verified Reviews</span>
          </div>

          <p className="text-zinc-500 text-lg leading-relaxed mb-12 max-w-xl">{product.description}</p>

          <div className="space-y-6 mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Available From Merchants</h3>
            <ScrollContainer>
              {product.sellers?.map((seller: any) => (
                <div 
                  key={seller.merchantId} 
                  className={`flex-shrink-0 w-[280px] p-6 rounded-3xl border transition-all cursor-pointer ${selectedMerchantForReview === seller.merchantId ? 'border-black bg-white shadow-xl scale-[1.02]' : 'border-zinc-100 bg-zinc-50/50 hover:bg-zinc-100'}`}
                  onClick={() => setSelectedMerchantForReview(seller.merchantId)}
                >
                  <div className="flex flex-col mb-4">
                    <span className="font-black text-sm uppercase tracking-tight">
                      {(seller.merchantName?.split('@')[0]) || seller.firstName || seller.lastName || "Independent Seller"}
                    </span>
                    <span className="text-zinc-400 text-[10px] font-bold">Available: {seller.stock} units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-2xl">${seller.price.toFixed(2)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(seller.merchantId); }}
                      className="bg-black text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                      Pick This
                    </button>
                  </div>
                </div>
              ))}
            </ScrollContainer>
          </div>

          {/* Corrected Quantity & Add to Cart Section */}
          <div className="mt-auto pt-10 border-t border-zinc-100 flex flex-col gap-4">
            {quantity === MAX_PURCHASE_LIMIT && (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                Max limit of {MAX_PURCHASE_LIMIT} reached
              </span>
            )}
            <div className="flex items-center gap-6">
              <div className="flex items-center bg-zinc-100 rounded-2xl p-1">
                <button 
                    onClick={decrementQuantity} 
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                >
                    <Minus size={16}/>
                </button>
                <span className="px-6 font-black text-lg w-12 text-center">{quantity}</span>
                <button 
                    onClick={incrementQuantity} 
                    disabled={quantity >= MAX_PURCHASE_LIMIT}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${quantity >= MAX_PURCHASE_LIMIT ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white'}`}
                >
                    <Plus size={16}/>
                </button>
              </div>
              <button 
                onClick={() => handleAddToCart()} 
                disabled={isAdding}
                className="flex-1 bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isAdding ? <Spinner size={20} /> : <ShoppingCart size={20} />} Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-20 border-t border-zinc-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div>
            <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">Product<br/>Feedback</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">Showing community experiences for <span className="text-black font-black">{product.name}</span>.</p>
          </div>
          <div className="lg:col-span-2 space-y-12">
            <form onSubmit={handleReviewAction} className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 max-w-xl">
              <h4 className="font-black text-sm uppercase mb-4 tracking-tight">{editingReviewId ? "Update Review" : "Rate this Product"}</h4>
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star 
                    key={n} 
                    size={22} 
                    onClick={() => setUserRating(n)} 
                    fill={n <= userRating ? "black" : "none"} 
                    className="cursor-pointer transition-transform hover:scale-110" 
                  />
                ))}
              </div>
              <textarea 
                value={userComment} 
                onChange={e => setUserComment(e.target.value)} 
                placeholder="Share your thoughts..." 
                className="w-full p-4 rounded-xl border-none bg-white min-h-[90px] mb-4 text-sm focus:ring-1 focus:ring-black outline-none" 
              />
              <div className="flex gap-2">
                <button type="submit" disabled={isReviewing} className="flex-1 bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  {isReviewing ? <Spinner size={14}/> : (editingReviewId ? "Update" : "Submit Review")}
                </button>
                {editingReviewId && (
                  <button type="button" onClick={handleDeleteReview} className="bg-white border border-red-100 text-red-500 px-4 rounded-xl hover:bg-red-50 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
              {status && <div className="mt-4"><FeedbackBanner $type={status.type}>{status.msg}</FeedbackBanner></div>}
            </form>
            <div className="space-y-6">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-xs uppercase text-zinc-400">
                        {r.userName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase tracking-tight">{r.userName.split('@')[0]}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? "black" : "#eee"} stroke="none" />)}
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}