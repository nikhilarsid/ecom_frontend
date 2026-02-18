import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  Star,
  ShoppingCart,
  Loader2,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  Edit,
} from "lucide-react";
import AuthModal from "../components/AuthModal";
import { showToast } from "../utils/toast";

// --- CONSTANTS ---
const MAX_PURCHASE_LIMIT = 5;

// --- ANIMATIONS ---
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  position: absolute; /* Relative to the Button */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* Perfectly offsets the icon's own width/height */
`;

const Button = styled.button`
  position: relative; /* Context for the absolute Spinner */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  /* Add transitions for a smoother feel */
  transition: all 0.2s ease; 
`;
// --- STYLED COMPONENTS ---
// const Button = styled.button`
//   position: relative; /* Essential for absolute children */
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   padding: 12px 24px;

//   `;


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
`;

const ThumbnailButton = styled.button<{ $active: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  border: 2px solid ${(props) => (props.$active ? "#000" : "#f1f1f1")};
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
    border-color: ${(props) => (props.$active ? "#000" : "#d1d1d6")};
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  cursor: grab;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export default function IndividualProductDetails() {
  const MySwal = withReactContent(Swal);
  
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

  
  const [status, setStatus] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  // Review Form State
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [selectedMerchantForReview, setSelectedMerchantForReview] =
    useState<string>("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const hasUserReviewed = reviews.some((r) => r.userName === currentUserEmail);
  const isCurrentlyEditing = editingReviewId !== null;

  const getHeaders = () => ({
    "Content-Type": "application/json",
    ...(token && token !== "null" ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchData = async () => {
    if (!id || !variantId) return;
    try {
      const cleanId = id.replace(":", "");
      const pRes = await fetch(
        `http://10.65.1.75:8063/api/v1/products/${cleanId}?variantId=${variantId}`,
        { headers: getHeaders() },
      );
      if (pRes.ok) {
        const json = await pRes.json();
        setProduct(json.data);

        // Auto-select first merchant with stock, otherwise select first available
        if (json.data.sellers?.length > 0) {
          const merchantWithStock = json.data.sellers.find(
            (s: any) => s.stock > 0,
          );
          const defaultMerchant = merchantWithStock || json.data.sellers[0];
          setSelectedMerchantForReview(defaultMerchant.merchantId);
        }
      }
    } catch (e) {
      console.error("Product fetch failed", e);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    const cleanId = id.replace(":", "");
    try {
      const rRes = await fetch(
        `http://10.65.1.75:8061/api/v1/reviews/product/${cleanId}`,
        {
          headers: getHeaders(),
        },
      );
      if (rRes.ok) {
        const rJson = await rRes.json();
        setReviews(rJson || []);
        // Don't auto-load edit mode on page load
        // User must click the edit icon to enter edit mode
        setEditingReviewId(null);
        setUserComment("");
        setUserRating(0);
      }
    } catch (e) {
      console.error("Review fetch failed", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, variantId]);
  useEffect(() => {
    fetchReviews();
  }, [id, variantId]);

  // --- QUANTITY HANDLERS ---
  const incrementQuantity = () => {
    if (quantity < MAX_PURCHASE_LIMIT) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast.error(`Maximum purchase limit is ${MAX_PURCHASE_LIMIT} items`);
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleReviewAction = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Authorization check
  if (!token) {
    setShowAuthModal(true);
    return;
  }

  // 2. Validation: Ensure user has actually selected stars and written text
  if (userRating === 0) {
    showToast.error("Please select a star rating.");
    return;
  }

  if (!userComment.trim()) {
    showToast.error("Please enter a comment.");
    return;
  }

  setIsReviewing(true);
  setStatus(null);

  const productIdNum = Number(id?.replace(":", ""));

  /**
   * FIX: Consolidated Payload
   * We send all identifiers (productId, variantId, merchantId) even for updates.
   * This ensures the backend has full context and helps map the star rating 
   * correctly from the state variable 'userRating'.
   */
  const payload = {
    productId: productIdNum,
    variantId: variantId,
    merchantId: selectedMerchantForReview,
    rating: userRating, // Explicitly capturing the state
    comment: userComment.trim(), // Explicitly capturing the state
  };

  const url = editingReviewId
    ? `http://10.65.1.75:8061/api/v1/reviews/update/${editingReviewId}`
    : `http://10.65.1.75:8061/api/v1/reviews/create`;

  try {
    const res = await fetch(url, {
      method: editingReviewId ? "PUT" : "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    if (res.ok) {
      showToast.success(
        editingReviewId ? "Review updated!" : "Feedback published!"
      );
      
      // Reset form state after successful action
      setEditingReviewId(null);
      setUserComment("");
      setUserRating(0);
      
      // Refresh the UI list
      fetchReviews();
    } else {
      // Handle backend validation errors (e.g., missing fields)
      const errorMsg = resJson.message || "Please make sure you entered the rating and comment.";
      showToast.error(errorMsg);
    }
  } catch (e) {
    showToast.error("Connection error. Please try again after some time.");
    console.error("Review action failed:", e);
  } finally {
    setIsReviewing(false);
  }
};

  // Change the function to accept reviewId

const handleDeleteReview = async (reviewId: number) => {
  // Use the library's pretty confirmation
  const result = await MySwal.fire({
    title: 'Are you sure?',
    text: "This will permanently remove your feedback.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#000000', // Matches your black buttons
    cancelButtonColor: '#000000',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    background: '#ffffff',
    color: '#000000',
    // borderRadius: '32px', // Matches your card styling
    customClass: {
      confirmButton: 'font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl',
      cancelButton: 'font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl text-zinc-400'
    }
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`http://10.65.1.75:8061/api/v1/reviews/delete/${reviewId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (res.ok) {
        showToast.success("Review deleted"); // Your existing toast library
        fetchReviews();
      }
    } catch (e) {
      showToast.error("Server error. Please try again.");
    }
  }
};

  const handleEditReview = (review: any) => {
    setEditingReviewId(review.id);
    setUserRating(review.rating);
    setUserComment(review.comment);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setUserComment("");
    setUserRating(5);
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

    const targetMerchantId =
      specificMerchantId || product.sellers[0]?.merchantId;
    if (!targetMerchantId) return;

    const targetSeller = product.sellers?.find(
      (s: any) => s.merchantId === targetMerchantId,
    );

    // --- CHECK STOCK STATUS ---
    if (targetSeller && targetSeller.stock === 0) {
      showToast.error(
        "We apologize, but this item is currently out of stock. Please check back later or try another seller.",
      );
      return;
    }

    // Check quantity against stock
    if (targetSeller && quantity > targetSeller.stock) {
      const merchantName =
        targetSeller.merchantName?.split("@")[0] ||
        targetSeller.firstName ||
        "This seller";
      const message = `You selected ${quantity} item(s) but ${merchantName} only has ${targetSeller.stock} item(s) in stock. Please reduce your quantity to ${targetSeller.stock} or less.`;
      showToast.error(message);
      return;
    }

    setIsAdding(true);
    try {
      const cleanId = Number(id?.replace(":", ""));

      console.log("Sending to Cart:", { productId: cleanId, quantity });

      const res = await fetch(
        "http://10.65.1.75:8062/api/cart/addItem",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            productId: cleanId,
            variantId: variantId,
            merchantId: targetMerchantId,
            quantity: Number(quantity),
          }),
        },
      );

      if (res.ok) {
        const nextCount = Math.max(0, parseInt(localStorage.getItem("cartCount") || "0") + quantity);
      localStorage.setItem("cartCount", nextCount.toString());
        window.dispatchEvent(new Event("cartUpdated"));
        showToast.success(`Added ${quantity} item(s) to Bag`);
      } else {
        let errorMessage = "Failed to add to cart";

        if (res.status === 500) {
          errorMessage = "Stock unavailable.";
        } else if (res.status === 400) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = "Invalid request. Please try again.";
          }
        } else if (res.status === 404) {
          errorMessage = "Product or merchant not found.";
        } else {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `Error ${res.status}: Unable to process request`;
          }
        }

        showToast.error(errorMessage);
      }
    } catch (e) {
      const errorMessage =
        "Unable to connect to server. Please check your connection and try again.";
      showToast.error(errorMessage);
      console.error("Cart error:", e);
    } finally {
      setIsAdding(false);
    }
  };

  if (!product)
    return (
      <div className="flex justify-center py-40">
        <Spinner size={40} />
      </div>
    );

  return (
  <div className="max-w-7xl mx-auto px-8 py-6">
    {/* items-stretch is key: it makes the text column the same height as the image column */}
    <div className="flex flex-col lg:flex-row gap-12 mb-10 items-stretch">
      
      {/* Media Gallery Column */}
      <div className="flex-shrink-0 space-y-4">
        <div className="w-[500px] h-[550px] bg-white rounded-[2.5rem] border border-zinc-100 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={product.imageUrls?.[activeImage]}
            alt={product.name}
            className="w-full h-full object-contain p-6 transition-all duration-500"
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
      </div>

      {/* Info & Actions Column: flex-1 and flex-col h-full allows mt-auto to anchor to the bottom */}
      <div className="flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-black text-sm font-black uppercase tracking-[0.2em] border-b-2 border-zinc-100 pb-0.5">
              {product.brand}
            </span>

            {product.usp && product.usp.length > 0 && (
              <span className="text-[10px] font-black bg-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest italic shadow-md">
                {product.usp[0]}
              </span>
            )}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight mb-3">
            {product.name}
          </h1>

          {product.usp && product.usp.length > 1 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
              {product.usp.slice(1).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-zinc-300 rounded-full" />
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description: High margin-bottom (mb-16) to create clear separation */}
        <p className="text-zinc-500 text-lg leading-relaxed mb-16 max-w-xl">
          {product.description}
        </p>

        {/* Merchants Section: mb-10 matches the visual weight of the gap below it */}
        <div className="space-y-4 mb-10">
          <h3 className="text-[15px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Available From Merchants
          </h3>
          <ScrollContainer>
            {product.sellers?.map((seller: any) => {
              const isOutOfStock = seller.stock === 0;
              const isSelected = selectedMerchantForReview === seller.merchantId;

              return (
                <div
                  key={seller.merchantId}
                  className={`flex-shrink-0 w-[240px] p-5 rounded-[2rem] border-2 transition-all ${
                    isOutOfStock
                      ? "border-zinc-200 bg-zinc-100 cursor-not-allowed opacity-60"
                      : isSelected
                        ? "border-black bg-white shadow-xl scale-[1.02] cursor-pointer"
                        : "border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white cursor-pointer"
                  }`}
                  onClick={() => !isOutOfStock && setSelectedMerchantForReview(seller.merchantId)}
                >
                  <div className="flex flex-col mb-3">
                    <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                      Merchant
                    </span>
                    <span className={`font-black text-sm uppercase tracking-tight ${isOutOfStock ? "text-zinc-400" : "text-black"}`}>
                      {seller.merchantName?.split("@")[0] || "Independent Seller"}
                    </span>
                    <span className={`text-[9px] font-bold mt-1 ${isOutOfStock ? "text-red-500" : "text-zinc-400"}`}>
                      {isOutOfStock ? "Out of Stock" : `Stock: ${seller.stock} Units`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-xl ${isOutOfStock ? "text-zinc-400" : "text-black"}`}>
                      ${seller.price.toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) handleAddToCart(seller.merchantId);
                      }}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isOutOfStock ? "bg-zinc-200 text-zinc-400" : "bg-black text-white hover:scale-105"
                      }`}
                    >
                      {isOutOfStock ? "Out" : "Pick"}
                    </button>
                  </div>
                </div>
              );
            })}
          </ScrollContainer>
        </div>

        {/* BOTTOM ACTION SECTION: Anchored to thumbnails via mt-auto */}
        <div className="mt-auto pt-8 border-t border-zinc-100 flex flex-col gap-6">
          
          {/* Trust Badges: Bigger, thicker, and placed above the button */}
          <div className="flex gap-4">
            <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center justify-center gap-3">
              <ShieldCheck className="text-black" size={18} strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-widest text-black">
                Genuine Product
              </span>
            </div>
            <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex items-center justify-center gap-3">
              <Zap className="text-black" size={18} strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-widest text-black">
                Fast Delivery
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {quantity === MAX_PURCHASE_LIMIT && (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">
                Limit reached
              </span>
            )}
            <div className="flex items-center gap-4">
              {/* Thicker Quantity Selector */}
              <div className="flex items-center bg-zinc-100 rounded-2xl p-1.5">
                <button onClick={decrementQuantity} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:scale-95 transition-all">
                  <Minus size={18} strokeWidth={3} />
                </button>
                <span className="px-6 font-black text-xl w-14 text-center italic">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= MAX_PURCHASE_LIMIT}
                  className={`w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm transition-all ${quantity >= MAX_PURCHASE_LIMIT ? "opacity-20" : "hover:scale-95"}`}
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>

              {/* Thicker/Bigger Add to Bag Button */}
              <button
                onClick={() => handleAddToCart(selectedMerchantForReview)}
                disabled={isAdding}
                className="flex-1 bg-black text-white h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-zinc-200"
              >
                {isAdding ? <Spinner size={20} /> : <ShoppingCart size={20} strokeWidth={2.5} />} 
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
{/* </div> */}

      {/* Reviews Section */}
      <div className="pt-20 border-t border-zinc-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div>
            <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">
              Product
              <br />
              Feedback
            </h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Showing community experiences for{" "}
              <span className="text-black font-black">{product.name}</span>.
            </p>
          </div>
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center gap-4 mb-4">
            <span className="text-zinc-400 text-[14px] font-bold uppercase tracking-widest">
              {reviews.length} Verified Reviews
            </span>
          </div>
  {hasUserReviewed && !isCurrentlyEditing ? (
    /* SUCCESS BANNER: Shows when a review already exists */
    <div className="bg-zinc-50 p-8 border border-zinc-100 max-w-xl flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
        <Star size={24} fill="black" />
      </div>
      <h4 className="font-black text-lg uppercase tracking-tighter mb-2">
        Review Already Published
      </h4>
      <p className="text-zinc-500 text-sm mb-6 px-4">
        You have already shared your thoughts on this product. You can update your existing feedback at any time.
      </p>
      <button
        onClick={() => {
          const myReview = reviews.find(r => r.userName === currentUserEmail);
          if (myReview) handleEditReview(myReview);
        }}
        className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors"
      >
        Edit Your Review
      </button>
    </div>
  ) : (
    /* FORM MODE: Shows for new reviews OR when clicking "Edit" */
    <form
      onSubmit={handleReviewAction}
      className="bg-zinc-50 p-6 border border-zinc-100 max-w-xl"
    >
      <h4 className="font-black text-sm uppercase mb-4 tracking-tight">
        {isCurrentlyEditing ? "Update your Review" : "Rate this Product"}
      </h4>
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((n) => (
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
        onChange={(e) => setUserComment(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full p-4 rounded-xl border-none bg-white min-h-[90px] mb-4 text-sm focus:ring-1 focus:ring-black outline-none"
      />
      <div className="flex gap-3">
  <button
    type="submit"
    disabled={isReviewing}
    className="flex-1 relative bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest min-h-[44px]"
  >
    {/* Wrap text in a span to control visibility without changing layout */}
    <span style={{ opacity: isReviewing ? 0 : 1 }}>
      {isCurrentlyEditing ? "Save Changes" : "Submit Review"}
    </span>
    
    {isReviewing && <Spinner size={16} />}
  </button>

  {isCurrentlyEditing && (
    <button
      type="button"
      onClick={cancelEditReview}
      className="px-6 bg-zinc-200 text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
    >
      Cancel
    </button>
  )}
</div>
    </form>
  )}
            <div className="space-y-6">
   {reviews.map((r: any) => {
  const isUserReview = r.userName === currentUserEmail;

  return (
    <div
      key={r.id}
      className="p-8 bg-white border border-zinc-100  hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-xs uppercase text-zinc-400">
            {r.userName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-tight">
              {r.userName.split("@")[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < r.rating ? "black" : "#eee"}
                stroke="none"
              />
            ))}
          </div>

          {isUserReview && (
            <div className="flex items-center gap-1">
              {/* Edit Button */}
              <button
                onClick={() => {
                  handleEditReview(r);
                  window.scrollTo({ top: 800, behavior: "smooth" });
                }}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Edit your review"
              >
                <Edit size={16} className="text-zinc-500 hover:text-black" />
              </button>

              {/* Delete Button */}
             {/* Delete Button inside reviews.map */}
<button
  onClick={() => {
    // if (window.confirm("Are you sure you want to delete this review?")) {
      // Pass the ID directly to the function
      handleDeleteReview(r.id);
    // }
  }}
  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
  title="Delete review"
>
  <Trash2 size={16} className="text-zinc-400 hover:text-red-500" />
</button>
            </div>
          )}
        </div>
      </div>

      <p className="text-zinc-500 text-sm leading-relaxed italic">
        "{r.comment}"
      </p>
    </div>
  );
})}
            </div>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
