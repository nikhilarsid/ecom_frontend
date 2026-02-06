import { useState, useEffect } from "react";
import styled from "styled-components";
import { Package, Plus, BarChart3, LayoutGrid } from "lucide-react";
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

  span {
    font-size: 10px;
    font-weight: 900;
    color: #a1a1aa;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  h2 {
    font-size: 32px;
    font-weight: 900;
    margin-top: 8px;
    letter-spacing: -1px;
  }
`;

export default function MerchantHome() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div>
      <MerchantHero>
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
          Seller Central
        </span>
        <h1 className="text-6xl font-black tracking-tighter mt-4 italic uppercase">
          Welcome back, {userName || "Partner"}
        </h1>

        <StatsGrid>
          <StatCard>
            <span>Live Products</span>
            <h2>{products.length}</h2>
          </StatCard>
          <StatCard>
            <span>Total Revenue</span>
            <h2>$0.00</h2>
          </StatCard>
          <StatCard>
            <span>Active Orders</span>
            <h2>0</h2>
          </StatCard>
        </StatsGrid>
      </MerchantHero>

      <section>
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-2xl font-black tracking-tight uppercase">
              Your Inventory
            </h3>
            <p className="text-zinc-400 text-xs font-bold mt-1 uppercase tracking-widest">
              Manage your listed products
            </p>
          </div>
          <button
            onClick={() => navigate("/merchant/manage")}
            className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={14} /> Add New Product
          </button>
        </div>

        {/* API PLACEHOLDER AREA */}
        {loading ? (
          <div className="py-32 border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <LayoutGrid className="text-zinc-200" size={32} />
            </div>
            <h4 className="font-black text-zinc-300 uppercase tracking-widest text-sm">
              Loading...
            </h4>
          </div>
        ) : products.length === 0 ? (
          <div className="py-32 border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <LayoutGrid className="text-zinc-200" size={32} />
            </div>
            <h4 className="font-black text-zinc-300 uppercase tracking-widest text-sm">
              No Products Yet
            </h4>
            <p className="text-zinc-400 text-xs mt-2 max-w-xs">
              Start by adding your first product to your inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={`${product.productId}-${JSON.stringify(product.attributes)}`}
                className="bg-white p-6 rounded-[2rem] border border-zinc-100 hover:shadow-lg transition-shadow flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="aspect-[4/3] bg-zinc-50 rounded-xl overflow-hidden mb-4 border border-zinc-100 p-4 flex items-center justify-center">
                  <img
                    src={product.imageUrl || "/placeholder-image.png"}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.png";
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-lg mb-1">{product.name}</h3>
                  <p className="text-zinc-500 text-sm mb-3 font-bold uppercase tracking-wider">
                    {product.brand}
                  </p>

                  {/* 🆕 Attributes (Color, Specs) Display */}
                  {product.attributes && Object.keys(product.attributes).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-zinc-200"
                        >
                          <span className="text-zinc-400 mr-1">{key}:</span>
                          {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100 mt-auto">
                  <div className="flex justify-between items-center">
                    <div>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Your Price</p>
                        <p className="text-zinc-900 font-black text-xl">
                        ${product.lowestPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Status</p>
                        <span className={`inline-flex items-center gap-1 font-bold text-xs ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}