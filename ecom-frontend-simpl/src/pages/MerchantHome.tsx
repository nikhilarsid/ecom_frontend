import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Package, Plus, BarChart3, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  
  span { font-size: 10px; font-weight: 900; color: #a1a1aa; letter-spacing: 2px; text-transform: uppercase; }
  h2 { font-size: 32px; font-weight: 900; margin-top: 8px; letter-spacing: -1px; }
`;

export default function MerchantHome() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  return (
    <div>
      <MerchantHero>
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">Seller Central</span>
        <h1 className="text-6xl font-black tracking-tighter mt-4 italic uppercase">
          Welcome back, {userName || 'Partner'}
        </h1>
        
        <StatsGrid>
          <StatCard>
            <span>Live Products</span>
            <h2>--</h2>
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
            <h3 className="text-2xl font-black tracking-tight uppercase">Your Inventory</h3>
            <p className="text-zinc-400 text-xs font-bold mt-1 uppercase tracking-widest">Manage your listed products</p>
          </div>
          <button 
            onClick={() => navigate('/merchant/manage')}
            className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus size={14} /> Add New Product
          </button>
        </div>

        {/* API PLACEHOLDER AREA */}
        <div className="py-32 border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
            <LayoutGrid className="text-zinc-200" size={32} />
          </div>
          <h4 className="font-black text-zinc-300 uppercase tracking-widest text-sm">Inventory API Pending</h4>
          <p className="text-zinc-400 text-xs mt-2 max-w-xs">
            Integration with `list-products-of-merchant` service is currently in development.
          </p>
        </div>
      </section>
    </div>
  );
}