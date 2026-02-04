import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  @media (max-width: 968px) { grid-template-columns: 1fr; }
`;

const Section = styled.section`
  background: white;
  padding: 40px;
  border-radius: 32px;
  border: 1px solid #f1f1f1;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 32px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  input {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e4e4e7;
    background: #fafafa;
    outline: none;
    transition: all 0.2s;
    &:focus { border-color: #000; background: white; }
  }
`;

const OrderSummary = styled.aside`
  position: sticky;
  top: 100px;
  height: fit-content;
  background: #000;
  color: #fff;
  padding: 40px;
  border-radius: 32px;
`;

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity } = location.state || {};
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Fallback if no product data is passed
  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black mb-4">NO ITEMS TO CHECKOUT</h2>
        <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 rounded-xl font-bold">RETURN TO SHOP</button>
      </div>
    );
  }

  const subtotal = product.price * (quantity || 1);
  const shipping = 25.00;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate Order API call
    setTimeout(() => {
      setIsProcessing(false);
      alert("Order Placed Successfully!");
      navigate('/orders');
    }, 2000);
  };

  return (
    <CheckoutContainer>
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> Back to details
        </button>

        <Section>
          <Title><Truck size={20} /> Shipping Details</Title>
          <InputGroup>
            <input placeholder="First Name" />
            <input placeholder="Last Name" />
          </InputGroup>
          <input 
            placeholder="Delivery Address" 
            className="w-full p-4 mb-5 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:border-black transition-all" 
          />
          <InputGroup>
            <input placeholder="City" />
            <input placeholder="Postal Code" />
          </InputGroup>
        </Section>

        <Section>
          <Title><CreditCard size={20} /> Payment Method</Title>
          <div className="p-6 border-2 border-black rounded-2xl flex justify-between items-center mb-4">
            <span className="font-bold">Credit / Debit Card</span>
            <div className="flex gap-2">
              <div className="w-8 h-5 bg-zinc-200 rounded" />
              <div className="w-8 h-5 bg-zinc-200 rounded" />
            </div>
          </div>
          <input 
            placeholder="Card Number" 
            className="w-full p-4 mb-4 rounded-xl border border-zinc-200 bg-zinc-50 outline-none" 
          />
          <InputGroup>
            <input placeholder="MM / YY" />
            <input placeholder="CVC" />
          </InputGroup>
        </Section>
      </div>

      <OrderSummary>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Order Summary</h3>
        
        <div className="flex gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="w-20 h-20 bg-white/10 rounded-xl overflow-hidden">
            <img src={product.imageUrls[0]} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
            <p className="text-zinc-500 text-xs mt-1">QTY: {quantity || 1}</p>
          </div>
          <p className="font-bold">${subtotal.toLocaleString()}</p>
        </div>

        <div className="space-y-4 mb-10 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Shipping</span>
            <span>${shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Complete Purchase"}
        </button>

        <div className="flex items-center justify-center gap-2 mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Secure Encrypted Checkout
        </div>
      </OrderSummary>
    </CheckoutContainer>
  );
}