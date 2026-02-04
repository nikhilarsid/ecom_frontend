import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Star, ShoppingCart, Zap, Loader2, Send, Trash2, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

const FeedbackBanner = styled.div<{ $type: 'error' | 'success' }>`
  background: ${props => props.$type === 'error' ? '#FEF2F2' : '#F0FDF4'};
  border: 1px solid ${props => props.$type === 'error' ? '#FEE2E2' : '#DCFCE7'};
  color: ${props => props.$type === 'error' ? '#991B1B' : '#166534'};
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
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating] = useState(4.8);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  // CRITICAL FIX: Always pull the LATEST token from localStorage inside this function
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async () => {
    try {
      const pRes = await fetch(`https://product-service-jzzf.onrender.com/api/v1/products/${id}`, { 
        headers: getHeaders() 
      });
      if (pRes.ok) {
        const json = await pRes.json();
        setProduct(json.data);
      }

      const rRes = await fetch(`https://review-service-z6zl.onrender.com/api/v1/reviews/product/${id}`, { 
        headers: getHeaders() 
      });
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
    // Re-fetch data if user logs in while on this page
    window.addEventListener("authChange", fetchData);
    return () => window.removeEventListener("authChange", fetchData);
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setStatus({ msg: "Authentication required. Please login.", type: 'error' });
      navigate('/login');
      return;
    }

    if (role !== 'CUSTOMER') {
      setStatus({ msg: "Action Denied: Only customers can use the cart.", type: 'error' });
      return;
    }

    setIsAdding(true);
    setStatus(null);

    try {
      const res = await fetch('https://order-service-p792.onrender.com/api/cart/add', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          merchantProductId: id, 
          quantity: quantity 
        }) 
      });

      if (!res.ok) {
        setStatus({ msg: `Cart Error: ${res.status}. Please try logging out and back in.`, type: 'error' });
        return;
      }

      const json = await res.json();
      if (json.success) {
        window.dispatchEvent(new Event("cartUpdated")); 
        setStatus({ msg: "Success: Item added to cart.", type: 'success' });
      }
    } catch (e) {
      setStatus({ msg: "Network error. Connection failed.", type: 'error' });
    } finally { 
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setIsReviewing(true);
    try {
      const res = await fetch('https://review-service-z6zl.onrender.com/api/v1/reviews', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId: id, rating: userRating, comment: userComment })
      });
      if (res.ok) {
        setUserComment("");
        fetchData(); 
        setStatus({ msg: "Review published.", type: 'success' });
      } else if (res.status === 403) {
        setStatus({ msg: "You must be logged in to leave a review.", type: 'error' });
      }
    } finally {
      setIsReviewing(false);
    }
  };

  if (!product) return <div className="flex justify-center py-20"><Spinner size={40} /></div>;

  return (
    <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto px-4">
      <div className="space-y-4">
        <div className="aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm">
          <img src={product.imageUrls?.[0] || undefined} className="w-full h-full object-cover mix-blend-multiply" alt="" />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">{product.brand}</span>
          <h1 className="text-6xl font-black tracking-tighter mt-4 leading-none">{product.name}</h1>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full">
              <Star size={14} fill="white" /> 
              <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
            </div>
            <span className="text-zinc-400 font-bold text-sm uppercase tracking-widest">({reviews.length} Reviews)</span>
          </div>
        </div>

        <p className="text-zinc-500 text-lg leading-relaxed">{product.description}</p>
        
        {status && (
          <FeedbackBanner $type={status.type}>
            <AlertCircle size={18} /> {status.msg}
          </FeedbackBanner>
        )}

        <div className="flex items-center gap-8">
          <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Quantity</span>
          <div className="flex items-center bg-zinc-100 rounded-2xl p-1 border border-zinc-200">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Minus size={16}/></button>
            <span className="px-8 font-black text-xl">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Plus size={16}/></button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleAddToCart} disabled={isAdding} className="flex-[2] bg-black text-white h-20 rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4">
            {isAdding ? <Spinner size={24} /> : <><ShoppingCart size={24} /> Add to Cart</>}
          </button>
          <button 
            onClick={() => navigate('/checkout', { state: { product, quantity } })} 
            className="flex-1 border-2 border-black h-20 rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3"
          >
            <Zap size={22} /> Buy Now
          </button>
        </div>

        <div className="pt-16 border-t border-zinc-100">
          <h3 className="text-3xl font-black tracking-tight italic mb-10 uppercase">Verified Feedback</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-6 bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100">
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
              placeholder="Describe your experience..."
              className="w-full p-6 rounded-2xl border-none bg-white shadow-inner outline-none min-h-[160px]"
            />
            <button type="submit" disabled={isReviewing} className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em]">
              {isReviewing ? <Spinner size={18} /> : "Publish Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}