import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  X, 
  Database,
  Loader2,
  AlertCircle,
  Construction
} from 'lucide-react';

// --- STYLED COMPONENTS ---
const FeedbackBanner = styled.div`
  background: #000;
  color: #fff;
  padding: 16px 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 650px;
  border-radius: 48px;
  padding: 56px;
  position: relative;
  box-shadow: 0 40px 80px rgba(0,0,0,0.15);
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  .full { grid-column: span 2; }
  
  label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin-bottom: 8px; display: block; }
  
  input, textarea {
    width: 100%;
    padding: 18px;
    background: #f8f8fa;
    border: 1px solid #f1f1f1;
    border-radius: 20px;
    font-weight: 600;
    outline: none;
    transition: all 0.2s;
    &:focus { border-color: #000; background: #fff; }
  }
`;

export default function MerchantManagement() {
  const [products, setProducts] = useState<any[]>([]); // Set to empty to show "Under Progress" state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- API HANDLERS ---

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API ENDPOINT: POST https://product-service-jzzf.onrender.com/api/v1/products
    console.log("Calling Add Product API...");
    setTimeout(() => {
      alert("ADD API: INTEGRATION UNDER PROGRESS");
      setLoading(false);
      setIsModalOpen(false);
    }, 1000);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // API ENDPOINT: PUT https://product-service-jzzf.onrender.com/api/v1/products/{id}
    console.log(`Calling Edit API for ID: ${currentProduct.id}`);
    setTimeout(() => {
      alert("EDIT API: INTEGRATION UNDER PROGRESS");
      setLoading(false);
      setIsModalOpen(false);
    }, 1000);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    // API ENDPOINT: DELETE https://product-service-jzzf.onrender.com/api/v1/products/{id}
    console.log(`Calling Delete API for ID: ${productId}`);
    alert("DELETE API: INTEGRATION UNDER PROGRESS");
  };

  const openEditModal = (product: any) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <header className="mb-12">
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">Operations</span>
        <h1 className="text-6xl font-black tracking-tighter mt-4 italic uppercase">Inventory Management</h1>
      </header>

      <FeedbackBanner>
        <Construction size={18} />
        Merchant Inventory APIs are currently under progress by the backend team
      </FeedbackBanner>

      <div className="flex justify-between items-center mb-10">
        <div className="relative w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
          <input className="w-full pl-14 pr-6 py-4 rounded-2xl bg-zinc-50 border-none outline-none font-bold text-sm" placeholder="Search SKU..." />
        </div>
        
        <button 
          onClick={() => { setIsEditing(false); setIsModalOpen(true); }}
          className="bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={16} /> Add Listing
        </button>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white border border-zinc-100 rounded-[3rem] overflow-hidden">
        <div className="grid grid-cols-5 p-10 border-b border-zinc-50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          <span className="col-span-2">Item Description</span>
          <span className="text-center">Stock</span>
          <span className="text-center">Price</span>
          <span className="text-right">Actions</span>
        </div>

        {products.length === 0 ? (
          <div className="py-48 flex flex-col items-center justify-center text-center">
            <Database size={64} className="text-zinc-100 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-300">No Data Available</h3>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Awaiting API Synchronization</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {products.map(p => (
              <div key={p.id} className="grid grid-cols-5 p-10 items-center hover:bg-zinc-50 transition-colors group">
                <div className="col-span-2 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-3xl border border-zinc-100 flex items-center justify-center">
                    <ImageIcon className="text-zinc-200" size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight">{p.name}</h4>
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">SKU: {p.sku}</span>
                  </div>
                </div>
                <div className="text-center font-black text-zinc-500">{p.stock} units</div>
                <div className="text-center font-black text-xl">${p.price}</div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => openEditModal(p)} className="p-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-black hover:text-white transition-all"><Edit3 size={18}/></button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DYNAMIC MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-zinc-300 hover:text-black transition-colors">
              <X size={28} />
            </button>

            <header className="mb-12">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                {isEditing ? 'Update Listing' : 'New Listing'}
              </h2>
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-4">Product Service Interface</p>
            </header>

            <FormGrid onSubmit={isEditing ? handleEditProduct : handleAddProduct}>
              <div className="full">
                <label>Product Name</label>
                <input required defaultValue={isEditing ? currentProduct.name : ''} placeholder="e.g. Marble Pedestal Table" />
              </div>
              <div>
                <label>SKU / Merchant ID</label>
                <input required defaultValue={isEditing ? currentProduct.sku : ''} placeholder="e.g. ETH-992" />
              </div>
              <div>
                <label>Price ($)</label>
                <input type="number" required defaultValue={isEditing ? currentProduct.price : ''} placeholder="0.00" />
              </div>
              <div className="full">
                <label>Description</label>
                <textarea rows={4} required defaultValue={isEditing ? currentProduct.description : ''} placeholder="Technical specifications and aesthetic details..." />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="full bg-black text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-4 hover:opacity-90 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Records' : 'Deploy to Shop')}
              </button>
            </FormGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}