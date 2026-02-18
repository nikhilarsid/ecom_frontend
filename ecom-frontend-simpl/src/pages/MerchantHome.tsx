import { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Loader2, DollarSign, ShoppingBag, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductService, { ProductListItem } from "../services/ProductService";

const MerchantHero = styled.section`
  padding: 60px 0;
  border-bottom: 1px solid #efeff1;
  margin-bottom: 48px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
`;

const StatCard = styled.div`
  background: #fafafa;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #f1f1f1;
  position: relative;
  overflow: hidden;

  span {
    font-size: 10px;
    font-weight: 900;
    color: #a1a1aa;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
    margin-bottom: 8px;
  }
  h2 {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -1px;
    color: #000;
  }
`;

export default function MerchantHome() {
  const navigate = useNavigate();
  const nameDefault = "User";
  const userName = localStorage.getItem("userName") || nameDefault;
  // Ensure merchantId is assigned the email address stored in localStorage
  const merchantId = localStorage.getItem("userName"); 

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchMerchantStats = async () => {
    if (!merchantId) return;
    
    console.log(`[DEBUG] Requesting stats for Merchant Email: ${merchantId}`);

    try {
      // Fetch Total Revenue
      const revRes = await fetch(
        `http://10.65.1.75:8062/api/orders/merchant/${merchantId}/total-revenue`,
        { headers: getHeaders() }
      );
      if (revRes.ok) {
        const revJson = await revRes.json();
        console.log("[DEBUG] Revenue API Response:", revJson);
        // Use null-coalescing to ensure null data becomes 0
        setTotalRevenue(revJson.data ?? 0); 
      }

      // Fetch Total Orders
      const ordRes = await fetch(
        `http://10.65.1.75:8062/api/orders/merchant/${merchantId}/total-orders`,
        { headers: getHeaders() }
      );
      if (ordRes.ok) {
        const ordJson = await ordRes.json();
        console.log("[DEBUG] Orders API Response:", ordJson);
        setTotalOrders(ordJson.data ?? 0);
      }
    } catch (e) {
      console.error("Failed to fetch merchant stats", e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getMerchantListings();
      setProducts(data);
    } catch (e) {
      console.error("Product fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMerchantStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <MerchantHero>
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Seller Central
        </span>
        <h1 className="text-6xl font-black tracking-tighter mt-4 italic leading-none">
          
          Welcome, { localStorage.getItem("firstName") || "Partner"}
        </h1>

        <StatsGrid>
          <StatCard>
            <span>Live Inventory</span>
            <h2>{products.length} Items</h2>
            <Package className="absolute right-6 bottom-6 text-zinc-100/50" size={48} />
          </StatCard>

          <StatCard>
            <span>Total Revenue</span>
            {/* Displaying raw number if toLocaleString fails for any reason */}
            <h2>
               ${(totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <DollarSign className="absolute right-6 bottom-6 text-zinc-100/50" size={48} />
          </StatCard>

          <StatCard>
            <span>Total Orders</span>
            <h2>{totalOrders || 0}</h2>
            <ShoppingBag className="absolute right-6 bottom-6 text-zinc-100/50" size={48} />
          </StatCard>
        </StatsGrid>
      </MerchantHero>

      <section className="pb-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Current Listings</h3>
            <p className="text-zinc-400 text-sm font-medium">Manage your active products</p>
          </div>
          {/* <button 
            onClick={() => navigate("/merchant/manage")} 
            className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={16} /> Add New Product
          </button> */}
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={`${product.productId}-${product.variantId}`} className="bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:border-black transition-all">
                <div className="aspect-[4/3] bg-zinc-50 rounded-2xl mb-6 p-6 flex items-center justify-center">
                  <img src={product.imageUrl || "/placeholder-image.png"} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <h3 className="font-black text-xl leading-tight">{product.name}</h3>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">{product.brand}</p>
                <div className="pt-6 border-t border-zinc-50 flex justify-between items-center mt-auto">
                  <span className="text-2xl font-black">${product.lowestPrice.toFixed(2)}</span>
                  <span className={`text-[10px] font-black ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {product.inStock ? "● ACTIVE" : "○ OUT OF STOCK"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}