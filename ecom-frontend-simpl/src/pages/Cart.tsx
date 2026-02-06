import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";

// --- ANIMATIONS ---
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

// --- STYLED COMPONENTS ---
const CartContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FeedbackBanner = styled.div<{ $type: "error" | "info" }>`
  background: ${(props) => (props.$type === "error" ? "#FEF2F2" : "#F9FAFB")};
  border: 1px solid
    ${(props) => (props.$type === "error" ? "#FEE2E2" : "#F3F4F6")};
  color: ${(props) => (props.$type === "error" ? "#991B1B" : "#4B5563")};
  padding: 32px;
  border-radius: 32px;
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 0;
  border-bottom: 1px solid #efeff1;
  transition: opacity 0.2s;
`;

const SpecTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #71717a;
  background: #f4f4f5;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 6px;
  text-transform: uppercase;
`;

const SummaryBox = styled.div`
  background: #000;
  color: #fff;
  padding: 40px;
  border-radius: 32px;
  margin-top: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
`;

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [enrichedItems, setEnrichedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setError("Active session not found. Please login to manage your cart.");
      setLoading(false);
      return;
    }

    if (role === "MERCHANT") {
      setError("Merchants do not have access to a customer shopping cart.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://order-service-p792.onrender.com/api/cart/view",
        {
          headers: getHeaders(),
        },
      );

      if (res.status === 403) {
        setError(
          "Your session has expired or you are unauthorized. Please re-authenticate.",
        );
        return;
      }

      const json = await res.json();
      if (json.success) {
        setCart(json.data);

        // --- ✅ FIX: Use LocalStorage Cache First ---
        const cartDetails = JSON.parse(
          localStorage.getItem("cartDetails") || "{}",
        );
        const items = json.data.items || [];

        const mergedItems = await Promise.all(
          items.map(async (item: any) => {
            // 1. Try LocalStorage
            const cacheKey = `${item.productId}-${item.variantId}-${item.merchantId}`;
            const cached = cartDetails[cacheKey];

            if (cached) {
              return { ...item, ...cached };
            }

            // 2. If missing, try simple fetch (Optional - removes 403 risk if disabled)
            // We disable the fetch fallback here to guarantee no 403 errors.
            // If it's not in cache, it just shows "Product" placeholder.
            return {
              ...item,
              productName: "Product",
              imageUrl: null,
              specs: {},
            };
          }),
        );

        setEnrichedItems(mergedItems);
      } else {
        setError("Your cart could not be synchronized with the server.");
      }
    } catch (e) {
      setError("Network timeout. Unable to reach the Ethereal Order Service.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, quantity: number) => {
    setDeleting(Number(itemId));
    try {
      const res = await fetch(
        `https://order-service-p792.onrender.com/api/cart/deleteItem/${itemId}?quantity=${quantity}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      const json = await res.json();

      if (json.success) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert("Failed to remove item: " + json.message);
      }
    } catch (e) {
      alert("Network error. Could not remove item.");
    } finally {
      setDeleting(null);
    }
  };

  // Quantity adjustment state
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const handleIncrease = async (item: any) => {
    const id = item.itemId || item.merchantProductId || item.productId;
    setAdjustingId(String(id));
    try {
      const body = {
        productId: item.productId || item.merchantProductId,
        variantId: item.variantId,
        merchantId: item.merchantId,
        quantity: 1,
      };

      const res = await fetch(
        "https://order-service-p792.onrender.com/api/cart/addItem",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(body),
        },
      );

      const json = await res.json();
      if (json.success) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert("Failed to add item: " + json.message);
      }
    } catch (e) {
      alert("Network error. Could not update quantity.");
    } finally {
      setAdjustingId(null);
    }
  };

  const handleDecrease = async (item: any) => {
    const id = item.itemId || item.merchantProductId || item.productId;
    setAdjustingId(String(id));
    try {
      const res = await fetch(
        `https://order-service-p792.onrender.com/api/cart/deleteItem/${id}?quantity=1`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      const json = await res.json();
      if (json.success) {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        alert("Failed to decrease quantity: " + json.message);
      }
    } catch (e) {
      alert("Network error. Could not update quantity.");
    } finally {
      setAdjustingId(null);
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Spinner size={48} strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
          Syncing Cart State
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <CartContainer>
        <FeedbackBanner $type="error">
          <AlertCircle size={40} strokeWidth={1.5} />
          <div className="space-y-2">
            <h2 className="font-black text-lg uppercase tracking-tight">
              Access Restricted
            </h2>
            <p className="text-sm opacity-70 font-medium max-w-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-black text-white px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Re-Authenticate
          </button>
        </FeedbackBanner>
      </CartContainer>
    );
  }

  const displayItems =
    enrichedItems.length > 0 ? enrichedItems : cart?.items || [];

  if (!cart || displayItems.length === 0) {
    return (
      <div className="text-center py-32">
        <ShoppingBag
          size={80}
          strokeWidth={1}
          className="mx-auto text-zinc-100 mb-8"
        />
        <h2 className="text-4xl font-black mb-4 tracking-tighter italic">
          YOUR CART IS EMPTY
        </h2>
        <p className="text-zinc-400 font-medium mb-12 max-w-xs mx-auto">
          It looks like you haven't discovered your next Ethereal piece yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform"
        >
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <CartContainer>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
            Your Cart
          </h1>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.4em] mt-4">
            Review Your Selection
          </p>
        </div>
        <div className="bg-zinc-100 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
          {displayItems.length} Items
        </div>
      </div>

      <div className="space-y-2">
        {displayItems.map((item: any) => (
          <CartItem key={`${item.merchantProductId}-${item.itemId}`}>
            <div className="w-32 h-32 bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 p-2 relative flex items-center justify-center">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  className="w-full h-full object-cover mix-blend-multiply"
                  alt={item.productName}
                />
              ) : (
                <div className="text-zinc-300 text-center">
                  <span className="text-[10px] font-bold">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1 px-4">
              <span className="text-zinc-300 text-[9px] font-black uppercase tracking-widest mb-1 block">
                Ref: {item.merchantProductId}
              </span>

              <h3 className="font-black text-2xl tracking-tight leading-none mb-2">
                {item.productName || "Product"}
              </h3>

              {item.specs && Object.keys(item.specs).length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {Object.entries(item.specs)
                    .slice(0, 3)
                    .map(([key, val]) => (
                      <SpecTag key={key}>
                        {key}: {String(val)}
                      </SpecTag>
                    ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDecrease(item)}
                  disabled={
                    adjustingId ===
                    String(item.itemId || item.merchantProductId)
                  }
                  className="p-2 bg-zinc-100 rounded-md hover:bg-zinc-200 disabled:opacity-50"
                  title="Decrease quantity"
                >
                  {adjustingId ===
                  String(item.itemId || item.merchantProductId) ? (
                    <Spinner size={14} />
                  ) : (
                    <Minus size={16} />
                  )}
                </button>

                <span className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleIncrease(item)}
                  disabled={
                    adjustingId ===
                    String(item.itemId || item.merchantProductId)
                  }
                  className="p-2 bg-zinc-100 rounded-md hover:bg-zinc-200 disabled:opacity-50"
                  title="Increase quantity"
                >
                  {adjustingId ===
                  String(item.itemId || item.merchantProductId) ? (
                    <Spinner size={14} />
                  ) : (
                    <Plus size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-2xl tracking-tighter mb-4">
                ${(item.price * item.quantity).toLocaleString()}
              </p>
              <button
                onClick={() =>
                  handleDeleteItem(item.merchantProductId, item.quantity)
                }
                disabled={deleting === Number(item.merchantProductId)}
                className="text-zinc-300 hover:text-red-500 transition-colors p-2 disabled:opacity-50"
              >
                {deleting === Number(item.merchantProductId) ? (
                  <Spinner size={20} />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </CartItem>
        ))}
      </div>

      <SummaryBox>
        <div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            Estimated Total
          </p>
          <h2 className="text-5xl font-black tracking-tighter">
            ${cart.totalValue.toLocaleString()}
          </h2>
        </div>
        <button
          onClick={() =>
            navigate("/checkout", {
              state: { cart: { ...cart, items: displayItems } },
            })
          }
          className="bg-white text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-3"
        >
          Checkout <ShoppingCart size={18} />
        </button>
      </SummaryBox>

      <Link
        to="/"
        className="flex items-center justify-center gap-3 text-zinc-300 font-black text-[10px] uppercase tracking-widest mt-12 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} /> Continue Exploring
      </Link>
    </CartContainer>
  );
}
