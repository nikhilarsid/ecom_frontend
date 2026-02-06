import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Loader2, PackageOpen, AlertCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`animation: ${spin} 1s linear infinite;`;

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
    margin-top: 24px;
  }
`;

const OrderCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 32px;
  border: 1px solid #efeff1;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    border-color: #000;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  }
`;

const OrderItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f1f1;
`;

const MiniProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  padding: 12px;
  border-radius: 16px;
  
  img {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    object-fit: cover;
    mix-blend-mode: multiply;
  }
  
  div {
    display: flex;
    flex-direction: column;
  }
`;

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stores items for specific orders
  const [orderDetails, setOrderDetails] = useState<Record<string, any[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Active session not found.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://order-service-p792.onrender.com/api/orders/view', {
        headers: getHeaders()
      });

      if (res.status === 403) {
        setError("Your session has expired.");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (rawOrderId: string | number) => {
    const orderId = String(rawOrderId);

    if (expandedOrder === orderId) {
        setExpandedOrder(null);
        return;
    }

    if (orderDetails[orderId]) {
        setExpandedOrder(orderId);
        return;
    }

    setExpandingId(orderId);

    try {
        const res = await fetch(`https://order-service-p792.onrender.com/api/orders/viewItem/${orderId}`, {
            headers: getHeaders()
        });
        const json = await res.json();
        
        if (json.success) {
            let items = json.data;
            
            // ✅ FIX: Safety check for array
            if (!Array.isArray(items)) {
                items = items?.items ? items.items : [];
            }

            const hydratedItems = await Promise.all(items.map(async (item: any) => {
                try {
                    // ✅ FIX: Check ID existence before fetch
                    if(item.merchantProductId && item.merchantProductId !== 'undefined') {
                        const pRes = await fetch(`https://product-service-jzzf.onrender.com/api/v1/products/${item.merchantProductId}`);
                        const pData = await pRes.json();
                        if (pData.success) {
                            return { 
                                ...item, 
                                productName: pData.data.name, 
                                imageUrl: pData.data.imageUrls?.[0] 
                            };
                        }
                    }
                } catch(e) {
                    console.warn("Image fetch failed for", item.merchantProductId);
                }
                return item;
            }));

            setOrderDetails(prev => ({ ...prev, [orderId]: hydratedItems }));
            setExpandedOrder(orderId);
        }
    } catch (e) {
        console.error("API Error", e);
    } finally {
        setExpandingId(null);
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
        <div className="flex justify-center py-32"><Spinner size={48} /></div>
      ) : error ? (
        <FeedbackBanner $type="error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="mt-4 bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black">RE-AUTHENTICATE</button>
        </FeedbackBanner>
      ) : orders.length === 0 ? (
        <EmptyState>
          <PackageOpen size={80} strokeWidth={1} />
          <h2>ARCHIVE EMPTY</h2>
          <Link to="/" className="shop-btn">Explore Collection <ArrowRight size={16} /></Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrder === String(order.orderId);
            const isExpanding = expandingId === String(order.orderId);

            return (
              <OrderCard key={order.orderId} onClick={() => fetchOrderItems(order.orderId)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black text-zinc-300 tracking-[0.2em] uppercase mb-2">Order #{order.orderId}</p>
                    <h3 className="text-3xl font-black tracking-tight leading-none">${order.totalAmount.toLocaleString()}</h3>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-200 pr-3">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                          {isExpanding ? 'Loading...' : (isExpanded ? 'Hide Items' : 'View Items')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                      <div className="bg-zinc-100 text-black border border-zinc-200 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                      {order.status}
                      </div>
                      {isExpanding ? <Spinner size={20} className="text-zinc-400"/> : 
                        (isExpanded ? <ChevronUp size={20} className="text-zinc-400"/> : <ChevronDown size={20} className="text-zinc-400"/>)
                      }
                  </div>
                </div>

                {/* Expanded Items Section */}
                {isExpanded && orderDetails[String(order.orderId)] && (
                    <OrderItemsGrid onClick={(e) => e.stopPropagation()}>
                        {orderDetails[String(order.orderId)].map((item: any) => (
                            <MiniProduct key={item.itemId || Math.random()}>
                                <img src={item.imageUrl || 'https://via.placeholder.com/50?text=No+Img'} alt="" />
                                <div>
                                    <span className="text-[10px] font-bold text-zinc-900 leading-tight">{item.productName || 'Product'}</span>
                                    <span className="text-[9px] font-bold text-zinc-400 mt-1">
                                        Qty: {item.quantity} · ${item.price}
                                    </span>
                                </div>
                            </MiniProduct>
                        ))}
                    </OrderItemsGrid>
                )}
              </OrderCard>
            );
          })}
        </div>
      )}
      
      <div className="mt-20 pt-10 border-t border-zinc-50 text-center">
        <p className="text-zinc-300 text-[9px] font-black uppercase tracking-[0.5em]">End of Archive</p>
      </div>
    </div>
  );
}