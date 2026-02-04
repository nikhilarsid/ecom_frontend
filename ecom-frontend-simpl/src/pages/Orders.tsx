import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Loader2, PackageOpen, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

// --- ANIMATIONS ---
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

// --- STYLED COMPONENTS ---
const FeedbackBanner = styled.div<{ $type: 'error' | 'info' }>`
  background: ${props => props.$type === 'error' ? '#FEF2F2' : '#F9FAFB'};
  border: 1px solid ${props => props.$type === 'error' ? '#FEE2E2' : '#F3F4F6'};
  color: ${props => props.$type === 'error' ? '#991B1B' : '#4B5563'};
  padding: 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  text-align: center;
  color: #a1a1aa;

  svg { margin-bottom: 32px; color: #e4e4e7; }
  h2 { color: #18181b; font-size: 28px; font-weight: 900; margin-bottom: 12px; letter-spacing: -1px; }
  p { font-size: 16px; margin-bottom: 40px; max-width: 300px; line-height: 1.5; }
  
  .shop-btn {
    background: black;
    color: white;
    padding: 16px 40px;
    border-radius: 18px;
    text-decoration: none;
    font-weight: 900;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
    &:hover { transform: scale(1.05); }
  }
`;

const OrderCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 32px;
  border: 1px solid #efeff1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: #000;
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  }
`;

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError("Active session not found. Please login to view your orders.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://order-service-p792.onrender.com/api/orders/history', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 403) {
        setError("Your session has expired. Please log in again to sync your history.");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      } else {
        setError("We couldn't retrieve your data. The order service might be undergoing maintenance.");
      }
    } catch (e) {
      setError("Network error. Unable to connect to the Ethereal secure server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">History</h1>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-4">Secure Order Archive</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Spinner size={48} strokeWidth={1.5} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Synchronizing Data</p>
        </div>
      ) : error ? (
        <FeedbackBanner $type="error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black"
          >
            RE-AUTHENTICATE
          </button>
        </FeedbackBanner>
      ) : orders.length === 0 ? (
        <EmptyState>
          <PackageOpen size={80} strokeWidth={1} />
          <h2>ARCHIVE EMPTY</h2>
          <p>No transactions have been recorded under this account profile yet.</p>
          <Link to="/" className="shop-btn">
            Explore Collection <ArrowRight size={16} />
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.orderId}>
              <div>
                <p className="text-[9px] font-black text-zinc-300 tracking-[0.2em] uppercase mb-2">Reference ID: {order.orderId}</p>
                <h3 className="text-3xl font-black tracking-tight leading-none">${order.totalAmount.toLocaleString()}</h3>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-200 pr-3">
                    {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                    {order.items?.length || 0} Units
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-zinc-100 text-black border border-zinc-200 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                  {order.status}
                </div>
              </div>
            </OrderCard>
          ))}
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-zinc-50 text-center">
        <p className="text-zinc-300 text-[9px] font-black uppercase tracking-[0.5em]">End of Archive</p>
      </div>
    </div>
  );
}