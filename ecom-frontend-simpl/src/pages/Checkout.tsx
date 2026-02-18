import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import styled from "styled-components";
// import emailjs from "@emailjs/browser"; // ✅ Imported EmailJS
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  Loader2,
  Smartphone,
  DollarSign,
} from "lucide-react";
import { showToast } from "../utils/toast";

// --- STYLED COMPONENTS ---
const RecentAddressesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const ButtonSpinner = styled(Loader2)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;
const PrimaryButton = styled.button`
  position: relative; /* Context for the absolute spinner */
  width: 100%;
  background: white;
  color: black;
  padding: 20px;
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
const AddressPill = styled.button`
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #71717a;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #000;
    color: #fff;
    border-color: #000;
  }
`;

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  padding: 40px 20px;
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
  font-size: 25px;
  font-weight: 900;
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  gap: 12px;
  text-transform: uppercase;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.$hasError ? "#ef4444" : "#e4e4e7"};
  background: ${props => props.$hasError ? "#fef2f2" : "#fafafa"};
  outline: none;
  &:focus { border-color: #000; }
`;

const OrderSummary = styled.aside`
  position: sticky;
  top: 100px;
  background: #000;
  color: #fff;
  padding: 40px;
  border-radius: 32px;
`;

const PaymentOption = styled.button<{ $selected: boolean }>`
  padding: 20px;
  border-radius: 16px;
  border: 2px solid ${props => props.$selected ? "#000" : "#e4e4e7"};
  background: ${props => props.$selected ? "#000" : "#fafafa"};
  color: ${props => props.$selected ? "#fff" : "#000"};
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
`;

const SummaryItem = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  img { width: 60px; height: 60px; object-fit: contain; border-radius: 12px; background: white; padding: 4px; }
`;

// --- EMAILJS CONFIGURATION ---
const EMAILJS_SERVICE_ID = "service_olg21u3";
const EMAILJS_TEMPLATE_ID = "template_gcy6mwo";
const EMAILJS_PUBLIC_KEY = "UEWIZ-hGeB-5N8eNF";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [formData, setFormData] = useState({ firstName: "", lastName: "", address: "", paymentDetail: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("userName");

  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);

// Load addresses when component starts
useEffect(() => {
  const saved = localStorage.getItem("recentAddresses");
  const legacy = localStorage.getItem("addresses");

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setRecentAddresses(parsed);
        return; // Exit early if we have a clean array
      }
    } catch (e) {
      // If parsing fails, fall through to string handling
    }
  }

  // Handle the "One Box" Problem (Legacy or Corrupted Saved Data)
  const rawData = saved || legacy;
  if (rawData) {
    // 1. Clean up quotes and URL encoding (%20)
    const cleanData = decodeURIComponent(rawData).replace(/'/g, "");

    // 2. SPLIT logic: Change the delimiter based on how your old data was stored.
    // If they were separated by commas: cleanData.split(',')
    // If they were just stuck together, we wrap the whole thing.
    const splitAddresses = cleanData.split(',').map(a => a.trim()).filter(Boolean);
    
    setRecentAddresses(splitAddresses);
  }
}, []);

// Function to update the list
const saveAddressLocally = (newAddress: string) => {
  // Ensure we are working with an array
  let currentList = Array.isArray(recentAddresses) ? [...recentAddresses] : [];
  
  // Filter out duplicates
  currentList = currentList.filter(a => a.toLowerCase() !== newAddress.toLowerCase());
  
  // Add new to top and limit to 5
  const updatedList = [newAddress, ...currentList].slice(0, 5);
  
  // CRITICAL: Save as a JSON stringified array
  localStorage.setItem("recentAddresses", JSON.stringify(updatedList));
  setRecentAddresses(updatedList);
};
  useEffect(() => {
    if (cart?.items) {
      const fetchDetails = async () => {
        const enriched = await Promise.all(cart.items.map(async (item: any) => {
          try {
            const res = await fetch(`http://10.65.1.75:8063/api/v1/products/${item.productId}?variantId=${item.variantId}`);
            const json = await res.json();
            return { ...item, name: json.data.name, img: json.data.imageUrls?.[0] };
          } catch (e) { return { ...item, name: "Product", img: null }; }
        }));
        setEnrichedItems(enriched);
      };
      fetchDetails();
    }
  }, [cart]);

  if (!cart) return <Navigate to="/cart" replace />;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    const postalRegex = /^\d{5,6}$/;
    if (!nameRegex.test(formData.firstName)) newErrors.firstName = "Letters only (2-30)";
    if (!nameRegex.test(formData.lastName)) newErrors.lastName = "Letters only (2-30)";
    if (!nameRegex.test(formData.address)) newErrors.address = "Letters only (2-30)";
    // if (!nameRegex.test(formData.city)) newErrors.city = "Letters only";
    // if (!postalRegex.test(formData.postalCode)) newErrors.postalCode = "5-6 digit code";
if (paymentMethod === "upi") {
    const upiValue = formData.paymentDetail.trim();
    const upiRegex = /^[\w.-]+@[\w.-]+$/; // Basic vpa@bank check

    if (!upiValue) {
      newErrors.paymentDetail = "UPI ID is required for this method";
    } else if (!upiRegex.test(upiValue)) {
      newErrors.paymentDetail = "Invalid UPI ID format (e.g. name@okaxis)";
    }
  }
      setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Helper to send email via EmailJS
  // ✅ UPDATE THIS FUNCTION
  const sendConfirmationEmail = async () => {
    try {
      await fetch("http://10.65.1.75:8064/api/notify/email", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          to: currentUserEmail,
          subject: `Order Confirmation: `,
          message: `Thank you for your purchase!`,
          firstName: formData.firstName // Passing this in case your notify template needs it
        }), 
      });
      console.log("Notify Service triggered");
    } catch (e) {
      console.error("Notify Service failed", e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validate()) { showToast.error("Fix form errors"); return; }
    setIsProcessing(true);
    const token = localStorage.getItem("token");
    const orderPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      paymentStatus: paymentMethod === "upi" ? "PAID" : "PENDING"    
    };
    
    try {
      // Placing order. 
      // NOTE: We do not send image URLs. The backend pulls from the Cart DB.
      const res = await fetch("http://10.65.1.75:8062/api/orders/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload), 
      });

      const json = await res.json();

      // If the backend returns 500 but also says "success: true" or if the order was created
      if (json.success || res.status === 200 || res.status === 201) {
        saveAddressLocally(formData.address); 
        // // ✅ UPDATE THIS LINE to pass the data
        sendConfirmationEmail();
        localStorage.setItem("cartCount","0");

        showToast.success("Order Placed Successfully! Please check your email for confirmation.");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/orders");
      } else {
        throw new Error(json.message || "Database constraint error: Image URL too long.");
      }
    } catch (e: any) {
      // If order actually went through despite the 500 error (common in some misconfigured backends)
      if (e.message.includes("image_url")) {
          showToast.error("Order failed due to product image size. Please contact support.");
      } else {
          showToast.error(`Order Failed: ${e.message}`);
      }
    } finally { setIsProcessing(false); }
  };

  return (
    <CheckoutContainer>
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase mb-8"><ArrowLeft size={14} /> Back</button>
        <Section>
          <Title><Truck size={30} /> Shipping Details </Title>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <InputWrapper>
              <StyledInput placeholder="First Name" $hasError={!!errors.firstName} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
            </InputWrapper>
            <InputWrapper>
              <StyledInput placeholder="Last Name" $hasError={!!errors.lastName} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
            </InputWrapper>
          </div>
          <InputWrapper className="mb-5">
            <StyledInput placeholder="Address" $hasError={!!errors.address} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            {errors.address && <ErrorText>{errors.address}</ErrorText>}
          </InputWrapper>

          {recentAddresses.length > 0 && (
  <div className="mt-4">
    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
      Recently Used
    </p>
    <RecentAddressesWrapper>
      {recentAddresses.map((addr, idx) => (
        <AddressPill 
          key={idx} 
          type="button" // Important: prevents form submission
          onClick={() => setFormData({...formData, address: addr})}
        >
          {addr}
        </AddressPill>
      ))}
    </RecentAddressesWrapper>
  </div>
)}
          {/* <div className="grid grid-cols-2 gap-5">
            {/* <InputWrapper><StyledInput placeholder="City" $hasError={!!errors.city} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />{errors.city && <ErrorText>{errors.city}</ErrorText>}</InputWrapper>
            <InputWrapper><StyledInput placeholder="Postal Code" $hasError={!!errors.postalCode} value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />{errors.postalCode && <ErrorText>{errors.postalCode}</ErrorText>}</InputWrapper> */}
          {/* </div> */} 
        </Section>
        <Section>
          <Title><CreditCard size={20} /> Payment Method</Title>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <PaymentOption $selected={paymentMethod === "cod"} onClick={() => setPaymentMethod("cod")}><DollarSign size={24} /> COD</PaymentOption>
            <PaymentOption $selected={paymentMethod === "upi"} onClick={() => setPaymentMethod("upi")}><Smartphone size={24} /> UPI</PaymentOption>
          </div>
          {paymentMethod === "upi" && (
            <InputWrapper className="mt-4"><StyledInput placeholder="UPI ID" $hasError={!!errors.paymentDetail} value={formData.paymentDetail} onChange={e => setFormData({...formData, paymentDetail: e.target.value})} />{errors.paymentDetail && <ErrorText>{errors.paymentDetail}</ErrorText>}</InputWrapper>
          )}
        </Section>
      </div>
      <OrderSummary>
        <h3 className="text-xs font-black uppercase text-zinc-500 mb-8 tracking-widest">Order Summary</h3>
        {enrichedItems.map((item, i) => (
          <SummaryItem key={i}>
            <img src={item.img || ""} alt="" />
            <div className="flex-1"><h4 className="font-bold text-sm">{item.name}</h4><p className="text-zinc-500 text-[10px]">QTY: {item.quantity} × ${item.price}</p></div>
          </SummaryItem>
        ))}
        <div className="flex justify-between text-xl font-black mt-10"><span>Total</span><span>${cart.totalValue.toLocaleString()}</span></div>
        <PrimaryButton 
  onClick={handlePlaceOrder} 
  disabled={isProcessing}
>
  {/* Hide text but keep its space to maintain button width/height */}
  <span style={{ opacity: isProcessing ? 0 : 1 }}>
    Complete Purchase
  </span>

  {isProcessing && <ButtonSpinner size={20} />}
</PrimaryButton>
        <div className="flex items-center justify-center gap-2 mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest"><ShieldCheck size={14} /> Secure Checkout</div>
      </OrderSummary>
    </CheckoutContainer>
  );
}