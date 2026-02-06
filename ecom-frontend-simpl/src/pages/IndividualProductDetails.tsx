import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Star,
  ShoppingCart,
  Loader2,
  Minus,
  Plus,
  AlertCircle,
  Store,
  Trash2
} from "lucide-react";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

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

export default function IndividualProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("userName");

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [selectedMerchantForReview, setSelectedMerchantForReview] = useState<string>("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && token !== "null" ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

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

  const fetchReviews = async (merchantId: string) => {
    if (!id || !merchantId) return;
    const cleanId = id.replace(':', '');
    console.log(`[LOG] Fetching reviews for Product: ${cleanId}, Merchant: ${merchantId}`);
    
    try {
      const rRes = await fetch(`https://review-service-z6zl.onrender.com/api/v1/reviews/view?productId=${cleanId}&merchantId=${merchantId}`, { 
        headers: getHeaders() 
      });
      
      if (rRes.ok) {
        const rJson = await rRes.json();
        console.log("[LOG] Reviews Received:", rJson);
        setReviews(rJson || []);
        
        // Find if current user already reviewed this SPECIFIC variant with this merchant
        const existing = rJson.find((r: any) => 
          r.userName === currentUserEmail && r.variantId === variantId
        );
        
        if (existing) {
          console.log("[LOG] User has existing review. Setting ID:", existing.id);
          setEditingReviewId(existing.id);
          setUserRating(existing.rating);
          setUserComment(existing.comment);
        } else {
          setEditingReviewId(null);
          setUserComment("");
          setUserRating(5);
        }
      }
    } catch (e) { console.error("[ERROR] Review fetch failed", e); }
  };

  useEffect(() => { fetchData(); }, [id, variantId]);
  useEffect(() => { if (selectedMerchantForReview) fetchReviews(selectedMerchantForReview); }, [selectedMerchantForReview, variantId]);

  const handleReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim() || !selectedMerchantForReview) return;

    setIsReviewing(true);
    setStatus(null);

    // SANITIZE TYPES: productId MUST be a Number for the Create API
    const productIdNum = Number(id?.replace(':', ''));
    
    const payload = editingReviewId 
      ? { rating: userRating, comment: userComment } // Update Body
      : { // Create Body
          productId: productIdNum, 
          variantId: variantId, 
          merchantId: selectedMerchantForReview, 
          rating: userRating, 
          comment: userComment 
        };

    const url = editingReviewId 
      ? `https://review-service-z6zl.onrender.com/api/v1/reviews/update/${editingReviewId}`
      : `https://review-service-z6zl.onrender.com/api/v1/reviews/create`;

    console.log(`[LOG] Review Action: ${editingReviewId ? 'UPDATE' : 'CREATE'}`);
    console.log("[LOG] Request URL:", url);
    console.log("[LOG] Request Payload:", payload);
    console.log("[LOG] Payload Types:", {
        productId: typeof payload.productId,
        rating: typeof payload.rating,
        variantId: typeof payload.variantId
    });

    try {
      const res = await fetch(url, { 
        method: editingReviewId ? "PUT" : "POST", 
        headers: getHeaders(), 
        body: JSON.stringify(payload) 
      });
      
      console.log("[LOG] Response Status:", res.status);
      const resJson = await res.json();
      console.log("[LOG] Server Response Body:", resJson);

      if (res.ok) {
        setStatus({ msg: editingReviewId ? "Review updated!" : "Review published!", type: "success" });
        fetchReviews(selectedMerchantForReview);
      } else {
        setStatus({ msg: resJson.message || `Error ${res.status}`, type: "error" });
      }
    } catch (e) {
      console.error("[ERROR] Network failure", e);
      setStatus({ msg: "Service unreachable", type: "error" });
    } finally { setIsReviewing(false); }
  };

  const handleDeleteReview = async () => {
    if (!editingReviewId || !window.confirm("Delete your review permanently?")) return;
    
    console.log(`[LOG] Deleting Review ID: ${editingReviewId}`);
    try {
      const res = await fetch(`https://review-service-z6zl.onrender.com/api/v1/reviews/delete/${editingReviewId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setStatus({ msg: "Review deleted successfully.", type: "success" });
        setEditingReviewId(null);
        setUserComment("");
        fetchReviews(selectedMerchantForReview);
      } else {
        console.error("[ERROR] Delete failed with status:", res.status);
      }
    } catch (e) { console.error("[ERROR] Delete Network error", e); }
  };

  // Cart Logic (Retained from previous version)
  const handleAddToCart = async (specificMerchantId?: string) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    const targetMerchantId = specificMerchantId || product.sellers[0]?.merchantId;
    if (!targetMerchantId) return;
    setIsAdding(true);
    try {
      const cleanId = Number(id?.replace(':', ''));
      const res = await fetch("https://order-service-p792.onrender.com/api/cart/addItem", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ productId: cleanId, variantId, merchantId: targetMerchantId, quantity }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("cartUpdated"));
        setStatus({ msg: "Added to cart", type: "success" });
      }
    } catch (e) { setStatus({ msg: "Cart operation failed", type: "error" }); } finally { setIsAdding(false); }
  };

  if (!product) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-1">
          <div className="aspect-[3/4] bg-zinc-50 rounded-[2rem] border flex items-center justify-center overflow-hidden">
            <img src={product.imageUrls?.[0]} alt={product.name} className="w-full h-full object-contain p-6" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">{product.brand}</span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mt-4 leading-none">{product.name}</h1>
          </div>

          <p className="text-zinc-600 text-lg leading-relaxed">{product.description}</p>

          {/* Offers List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-zinc-400">Available Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.sellers?.map((seller: any) => (
                <div key={seller.merchantId} className={`bg-white border p-6 rounded-[2rem] transition-all ${selectedMerchantForReview === seller.merchantId ? 'border-black ring-1 ring-black' : 'border-zinc-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-lg">{seller.merchantName}</h4>
                    <button onClick={() => setSelectedMerchantForReview(seller.merchantId)} className="text-zinc-300 hover:text-black">
                      <Star size={16} fill={selectedMerchantForReview === seller.merchantId ? "black" : "none"} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-3xl">${seller.price.toFixed(2)}</span>
                    <button onClick={() => handleAddToCart(seller.merchantId)} disabled={seller.stock === 0} className="bg-black text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase">Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {status && <FeedbackBanner $type={status.type}>{status.msg}</FeedbackBanner>}

          {/* Action Bar */}
          <div className="flex items-center gap-6 pt-6 border-t">
             <div className="flex items-center bg-zinc-100 rounded-2xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center"><Minus size={14}/></button>
                <span className="px-4 font-black">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center"><Plus size={14}/></button>
             </div>
             <button onClick={() => handleAddToCart()} disabled={isAdding} className="flex-1 bg-black text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                {isAdding ? <Spinner size={20} /> : <ShoppingCart size={20} />} Add to Cart
             </button>
          </div>

          {/* Review Section */}
          <div className="pt-16 border-t">
            <h3 className="text-3xl font-black italic uppercase mb-8">Feedback for {selectedMerchantForReview}</h3>
            
            <form onSubmit={handleReviewAction} className="space-y-4 bg-zinc-50 p-8 rounded-[2rem] border">
              <h4 className="font-bold text-lg">{editingReviewId ? "Update Your Review" : "Post a Review"}</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} size={24} onClick={() => setUserRating(n)} fill={n <= userRating ? "black" : "none"} className="cursor-pointer" />
                ))}
              </div>
              <textarea value={userComment} onChange={e => setUserComment(e.target.value)} placeholder="How was your experience?" className="w-full p-4 rounded-xl border-none bg-white min-h-[100px]" />
              <div className="flex gap-2">
                <button type="submit" disabled={isReviewing} className="flex-1 bg-black text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest">
                  {isReviewing ? <Spinner size={16}/> : (editingReviewId ? "Update Review" : "Post Review")}
                </button>
                {editingReviewId && (
                  <button type="button" onClick={handleDeleteReview} className="bg-red-500 text-white px-4 rounded-xl hover:bg-red-600"><Trash2 size={18}/></button>
                )}
              </div>
            </form>

            <div className="mt-8 space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="p-6 bg-white border border-zinc-100 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-900">{r.userName}</span>
                    <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < r.rating ? "black" : "#eee"} stroke="none" />)}</div>
                  </div>
                  <p className="text-zinc-600 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-zinc-400 text-sm text-center py-10 italic">Be the first to review this merchant.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}