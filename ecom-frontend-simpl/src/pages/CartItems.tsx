import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Trash2, Minus, Plus } from "lucide-react";

// Reuse the styled components from your main file or define them here
const CartItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 0;
  border-bottom: 1px solid #efeff1;
  transition: opacity 0.2s;
`;

// Destructure props correctly inside curly braces { }
export default function CartItems({ 
  item, 
  onDelete, 
  onIncrease, 
  onDecrease, 
  adjusting, 
  deleting 
}: any) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:8063/api/v1/products/${item.productId}?variantId=${item.variantId}`
        );
        const json = await res.json();
        setDetails(json.data);
      } catch (e) {
        console.error("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [item.productId, item.variantId]);

  if (loading) return <div className="h-32 bg-zinc-50 animate-pulse rounded-3xl mb-4" />;

  return (
    <CartItem to={`/product/${item.productId}?variantId=${item.variantId}`}>
      <div className="w-32 h-32 bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 p-2 flex items-center justify-center">
        <img src={details?.imageUrls?.[0]} className="w-full h-full object-cover mix-blend-multiply" alt="" />
      </div>
      <div className="flex-1 px-4">
        <h3 className="font-black text-2xl tracking-tight leading-none mb-2">
          {details?.name || "Product"}
        </h3>
        <div className="flex items-center gap-3">
            <button onClick={(e) => onDecrease(e, item)} disabled={adjusting !== null} className="p-2 bg-zinc-100 rounded-md">
               <Minus size={16} />
            </button>
            <span className="text-zinc-400 font-bold text-xs uppercase">{item.quantity}</span>
            <button onClick={(e) => onIncrease(e, item)} disabled={adjusting !== null} className="p-2 bg-zinc-100 rounded-md">
               <Plus size={16} />
            </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-2xl">${(item.price * item.quantity).toLocaleString()}</p>
        <button onClick={(e) => onDelete(e, item.itemId, item.quantity)} disabled={deleting === Number(item.itemId)} className="text-zinc-300 hover:text-red-500">
           <Trash2 size={20} />
        </button>
      </div>
    </CartItem>
  );
}