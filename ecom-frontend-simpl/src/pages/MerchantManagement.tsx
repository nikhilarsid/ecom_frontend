import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Plus, 
  Trash2, 
  Database,
  Loader2,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';
import ProductService, { ProductListItem } from '../services/ProductService';

// --- SUB-COMPONENT: REAL-TIME ANALYTICS ---
function VariantAnalytics({ productId, variantId }: { productId: number; variantId: string }) {
  const [stats, setStats] = useState<{ numberOfOrdersSold: number; amountGenerated: number } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the email address saved during login
  const merchantEmail = localStorage.getItem("userName"); 

  useEffect(() => {
    const fetchStats = async () => {
      if (!merchantEmail || merchantEmail === "undefined") return;
      
      try {
        const token = localStorage.getItem("token");
        const url = `https://order-service-p792.onrender.com/api/orders/merchant/${merchantEmail}/stats?productId=${productId}&variantId=${variantId}`;
        
        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const json = await res.json();
          // Log to verify if the data is actually coming through
          console.log(`[STATS DEBUG] ID: ${productId} ->`, json.data);
          if (json.success) setStats(json.data);
        }
      } catch (e) {
        console.error("Stats fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [productId, variantId, merchantEmail]);

  if (loading) return <div className="h-6 w-24 bg-zinc-50 animate-pulse rounded mx-auto" />;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-black font-black">
        <PackageCheck size={14} className="text-zinc-400" />
        {/* Fallback to 0 if data is null */}
        {stats?.numberOfOrdersSold ?? 0}
      </div>
      <div className="flex items-center gap-2 text-green-600 font-black text-sm">
        <TrendingUp size={12} />
        ${(stats?.amountGenerated ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export default function MerchantManagement() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getMerchantListings();
      setProducts(data);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId: number, variantId?: string) => {
    if (!window.confirm("Remove this listing from Ethereal?")) return;
    try {
      await ProductService.deleteInventory(productId.toString(), variantId || "");
      fetchProducts();
    } catch (e) {
      alert("Failed to remove product.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex justify-between items-end mb-16">
        <div>
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">Operations</span>
          <h1 className="text-6xl font-black tracking-tighter mt-4 italic uppercase leading-none">Inventory Performance</h1>
        </div>
        
        <button 
          onClick={() => navigate("/merchant/dashboard")}
          className="bg-black text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Add New Listing
        </button>
      </header>

      <div className="bg-white border border-zinc-100 rounded-[3.5rem] overflow-hidden shadow-sm">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-6 p-12 border-b border-zinc-50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          <span className="col-span-2 text-left">Item Description</span>
          <span className="text-center">Listing ID</span>
          <span className="text-center border-l border-zinc-50">Current Price</span>
          <span className="text-center col-span-2 border-l border-zinc-50">Performance (Sold / Earned)</span>
        </div>

        {loading ? (
          <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-zinc-200" size={48} /></div>
        ) : products.length === 0 ? (
          <div className="py-48 flex flex-col items-center justify-center text-center">
            <Database size={64} className="text-zinc-100 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-300">Inventory Empty</h3>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {products.map(p => (
              <div key={`${p.productId}-${p.variantId}`} className="grid grid-cols-6 p-12 items-center hover:bg-zinc-50 transition-colors group">
                <div className="col-span-2 flex items-center gap-8">
                  <div className="w-24 h-24 bg-white rounded-[2rem] border border-zinc-100 flex items-center justify-center overflow-hidden">
                    <img src={p.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply p-3" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight leading-none mb-2">{p.name}</h4>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{p.brand}</span>
                  </div>
                </div>

                <div className="text-center text-[11px] font-bold text-zinc-300 font-mono">
                   #{p.productId}
                </div>

                <div className="text-center font-black text-2xl text-black">
                  ${p.lowestPrice.toFixed(2)}
                </div>

                {/* ANALYTICS COLUMNS */}
                <div className="col-span-2 flex items-center justify-between pl-12">
                  <VariantAnalytics productId={p.productId} variantId={p.variantId} />
                  
                  <button 
                    onClick={() => handleDeleteProduct(p.productId, p.variantId)}
                    className="p-5 rounded-2xl bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}