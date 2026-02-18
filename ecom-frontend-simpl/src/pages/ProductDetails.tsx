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
  Edit3,
  Trash2,
  X,
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
`;

const SpecsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
`;

const SpecCard = styled.div`
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 12px 14px;
  text-align: center;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .spec-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #71717a;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .spec-value {
    font-size: 14px;
    font-weight: 700;
    color: #000;
    word-break: break-word;
  }
`;

export default function IndividualProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("userName"); // Assuming email is stored here

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [status, setStatus] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [selectedMerchantForReview, setSelectedMerchantForReview] =
    useState<string>("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = async () => {
    if (!id || !variantId) return;
    try {
      const pRes = await fetch(
        `http://10.65.1.75:8063/api/v1/products/${id}?variantId=${variantId}`,
        { headers: getHeaders() },
      );
      if (pRes.ok) {
        const json = await pRes.json();
        setProduct(json.data);
        // Default selection for review to first merchant if available
        if (json.data.sellers?.length > 0)
          setSelectedMerchantForReview(json.data.sellers[0].merchantId);
      }
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  const fetchReviews = async (merchantId: string) => {
    try {
      const rRes = await fetch(
        `http://localhost:8061/api/v1/reviews/view?productId=${id}&merchantId=${merchantId}`,
        { headers: getHeaders() },
      );
      if (rRes.ok) {
        const rJson = await rRes.json();
        setReviews(rJson || []);

        // Check if user already has a review for this variant and merchant
        const existing = rJson.find(
          (r: any) =>
            r.userName === currentUserEmail && r.variantId === variantId,
        );
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
    } catch (e) {
      console.error("Review fetch failed", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, variantId]);

  useEffect(() => {
    if (selectedMerchantForReview) fetchReviews(selectedMerchantForReview);
  }, [selectedMerchantForReview]);

  const handleReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim() || !selectedMerchantForReview) return;

    setIsReviewing(true);
    const url = editingReviewId
      ? `http://localhost:8061/api/v1/reviews/update/${editingReviewId}`
      : `http://localhost:8061/api/v1/reviews/create`;

    const method = editingReviewId ? "PUT" : "POST";
    const body = editingReviewId
      ? { rating: userRating, comment: userComment }
      : {
          productId: id,
          variantId,
          merchantId: selectedMerchantForReview,
          rating: userRating,
          comment: userComment,
        };

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus({
          msg: editingReviewId ? "Review updated." : "Review published.",
          type: "success",
        });
        fetchReviews(selectedMerchantForReview);
      } else {
        const err = await res.json();
        setStatus({ msg: err.message || "Action failed.", type: "error" });
      }
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(
        `http://localhost:8061/api/v1/reviews/delete/${reviewId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      if (res.ok) {
        setStatus({ msg: "Review deleted.", type: "success" });
        setEditingReviewId(null);
        setUserComment("");
        fetchReviews(selectedMerchantForReview);
      }
    } catch (e) {
      setStatus({ msg: "Delete failed.", type: "error" });
    }
  };

  if (!product)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={40} />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* ... (Product Image and Specs remain same) ... */}

      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-5xl font-black">{product.name}</h1>

        {/* Product Specs Section */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div>
            <h3 className="text-sm font-black uppercase text-zinc-400 mb-4">
              Key Specifications
            </h3>
            <SpecsContainer>
              {Object.entries(product.specs).map(([key, value]) => (
                <SpecCard key={key}>
                  <div className="spec-label">{key}</div>
                  <div className="spec-value">{String(value)}</div>
                </SpecCard>
              ))}
            </SpecsContainer>
          </div>
        )}

        {/* Sellers List */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-zinc-400">
            Merchant Offers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.sellers?.map((seller: any) => (
              <div
                key={seller.merchantId}
                className="bg-white border p-6 rounded-[2rem]"
              >
                <h4 className="font-black">{seller.merchantName}</h4>
                <span className="font-black text-2xl">
                  ${seller.price.toFixed(2)}
                </span>
                <button
                  onClick={() =>
                    setSelectedMerchantForReview(seller.merchantId)
                  }
                  className="mt-2 text-xs font-bold text-zinc-400 flex items-center gap-1 hover:text-black"
                >
                  <Star size={12} /> View Reviews for this Seller
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pt-16 mt-16 border-t border-zinc-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black italic uppercase">
              Feedback for {selectedMerchantForReview}
            </h3>
          </div>

          {/* Form */}
          <form
            onSubmit={handleReviewAction}
            className="space-y-6 bg-zinc-50 p-8 rounded-[2rem] border mb-12"
          >
            <h4 className="font-bold text-lg">
              {editingReviewId ? "Modify Your Review" : "Share Your Experience"}
            </h4>

            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star
                  key={num}
                  size={32}
                  onClick={() => setUserRating(num)}
                  fill={num <= userRating ? "black" : "none"}
                  className="cursor-pointer"
                />
              ))}
            </div>

            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="How was the product and the delivery?"
              className="w-full p-6 rounded-2xl border-none bg-white shadow-inner min-h-[120px]"
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isReviewing}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                {isReviewing ? (
                  <Spinner size={18} />
                ) : editingReviewId ? (
                  "Update Review"
                ) : (
                  "Publish Review"
                )}
              </button>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => handleDeleteReview(editingReviewId)}
                  className="bg-red-500 text-white px-6 rounded-2xl"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="grid gap-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-6 bg-white border rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{review.userName}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "black" : "#e4e4e7"}
                        stroke="none"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-zinc-600 text-sm">{review.comment}</p>
                <span className="text-[10px] text-zinc-400 font-bold uppercase mt-2 block">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
