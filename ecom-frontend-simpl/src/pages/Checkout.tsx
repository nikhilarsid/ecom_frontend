import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  Loader2,
  Smartphone,
  Banknote,
  DollarSign,
} from "lucide-react";
import { showToast } from "../utils/toast";

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
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
    &:focus {
      border-color: #000;
      background: white;
    }
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

const PaymentMethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const PaymentOption = styled.button<{ $selected: boolean }>`
  padding: 20px;
  border-radius: 16px;
  border: 2px solid ${(props) => (props.$selected ? "#000" : "#e4e4e7")};
  background: ${(props) => (props.$selected ? "#000" : "#fafafa")};
  color: ${(props) => (props.$selected ? "#fff" : "#000")};
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    border-color: #000;
    background: ${(props) => (props.$selected ? "#000" : "#f3f4f6")};
  }
`;

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  // We expect 'cart' object from navigation state
  const { cart } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "debit" | "credit" | "upi"
  >("cod");

  if (!cart) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black mb-4">NO ITEMS TO CHECKOUT</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold"
        >
          RETURN TO SHOP
        </button>
      </div>
    );
  }

  // Calculate totals from Cart object
  const totalAmount = cart.totalValue;
  const itemCount = cart.items.length;
  const displayImage = cart.items.length > 0 ? cart.items[0].imageUrl : null;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("token");

    try {
      // ✅ FIXED: Correct Endpoint /api/orders/add
      const res = await fetch(
        "https://order-service-p792.onrender.com/api/orders/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Backend places order from current cart
        },
      );

      const json = await res.json();

      if (json.success) {
        showToast.success(`Order Placed Successfully! Order ID: ${json.data}`);
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/orders");
      } else {
        showToast.error("Failed to place order: " + json.message);
      }
    } catch (e) {
      showToast.error("Network Error during checkout.");
    } finally {
      setIsProcessing(false);
    }
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
          <Title>
            <Truck size={20} /> Shipping Details
          </Title>
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
          <Title>
            <CreditCard size={20} /> Payment Method
          </Title>
          <PaymentMethodGrid>
            <PaymentOption
              $selected={paymentMethod === "cod"}
              onClick={() => setPaymentMethod("cod")}
            >
              <DollarSign size={24} />
              Cash On Delivery
            </PaymentOption>
            <PaymentOption
              $selected={paymentMethod === "debit"}
              onClick={() => setPaymentMethod("debit")}
            >
              <CreditCard size={24} />
              Debit Card
            </PaymentOption>
            <PaymentOption
              $selected={paymentMethod === "credit"}
              onClick={() => setPaymentMethod("credit")}
            >
              <Banknote size={24} />
              Credit Card
            </PaymentOption>
            <PaymentOption
              $selected={paymentMethod === "upi"}
              onClick={() => setPaymentMethod("upi")}
            >
              <Smartphone size={24} />
              UPI
            </PaymentOption>
          </PaymentMethodGrid>

          {paymentMethod !== "cod" && paymentMethod !== "upi" && (
            <div className="space-y-4">
              <input
                placeholder="Card Number"
                className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:border-black transition-all"
              />
              <InputGroup>
                <input placeholder="MM / YY" />
                <input placeholder="CVC" />
              </InputGroup>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div>
              <input
                placeholder="UPI ID (e.g. yourname@bank)"
                className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50 outline-none focus:border-black transition-all"
              />
            </div>
          )}
        </Section>
      </div>

      <OrderSummary>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">
          Order Summary
        </h3>

        <div className="flex gap-4 mb-8 pb-8 border-b border-white/10">
          <div className="w-20 h-20 bg-white/10 rounded-xl overflow-hidden">
            <img
              src={displayImage || "https://via.placeholder.com/150"}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm leading-tight">Current Cart</h4>
            <p className="text-zinc-500 text-xs mt-1">
              Total Items: {itemCount}
            </p>
          </div>
          <p className="font-bold">${totalAmount.toLocaleString()}</p>
        </div>

        <div className="space-y-4 mb-10 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10">
            <span>Total</span>
            <span>${totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Complete Purchase"
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Secure Encrypted Checkout
        </div>
      </OrderSummary>
    </CheckoutContainer>
  );
}
