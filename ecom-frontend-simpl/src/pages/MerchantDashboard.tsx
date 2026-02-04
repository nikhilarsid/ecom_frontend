import { useState } from 'react';
import styled from 'styled-components';
import { 
  BarChart3, 
  DollarSign, 
  PackageCheck, 
  TrendingUp, 
  AlertCircle,
  Database,
  ArrowUpRight
} from 'lucide-react';

// --- STYLED COMPONENTS ---
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
`;

const StatCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 32px;
  border: 1px solid #efeff1;
  position: relative;
  overflow: hidden;
  
  .label { font-size: 10px; font-weight: 900; color: #a1a1aa; letter-spacing: 2px; text-transform: uppercase; }
  .value { font-size: 42px; font-weight: 900; margin-top: 12px; letter-spacing: -2px; color: #d1d1d6; } // Grayed out for placeholder
  .icon { color: #f4f4f5; position: absolute; right: -10px; bottom: -10px; width: 100px; height: 100px; }
`;

const ApiPlaceholder = styled.div`
  background: #fafafa;
  border: 2px dashed #f1f1f1;
  border-radius: 40px;
  padding: 80px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Badge = styled.span`
  background: #000;
  color: #fff;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 20px;
`;

export default function MerchantDashboard() {
  const userName = localStorage.getItem('userName');

  return (
    <div className="max-w-7xl mx-auto px-6">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Badge>V1.0 Alpha</Badge>
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">Analytics Hub</span>
        </div>
        <h1 className="text-7xl font-black tracking-tighter italic uppercase leading-[0.9]">
          Insights for <br /> {userName || 'Merchant'}
        </h1>
      </header>

      {/* REVENUE & ORDER STATS (PLACEHOLDERS) */}
      <DashboardGrid>
        <StatCard>
          <DollarSign className="icon" />
          <p className="label">Total Money Earned</p>
          <h2 className="value">$ --,---</h2>
          <p className="text-[10px] font-bold text-zinc-300 mt-4 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={12} /> API Connection Pending
          </p>
        </StatCard>

        <StatCard>
          <PackageCheck className="icon" />
          <p className="label">Total Orders Sold</p>
          <h2 className="value">--</h2>
          <p className="text-[10px] font-bold text-zinc-300 mt-4 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={12} /> API Connection Pending
          </p>
        </StatCard>

        <StatCard>
          <TrendingUp className="icon" />
          <p className="label">Store Performance</p>
          <h2 className="value">-- %</h2>
          <p className="text-[10px] font-bold text-zinc-300 mt-4 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={12} /> API Connection Pending
          </p>
        </StatCard>
      </DashboardGrid>

      {/* PRODUCT QUANTITY BREAKDOWN (PLACEHOLDER) */}
      <section className="mt-12">
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Inventory Sales Breakdown</h3>
            <p className="text-zinc-400 text-xs font-bold mt-1 uppercase tracking-widest italic">Quantity sold per unique product</p>
          </div>
          <div className="flex gap-2">
             <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 cursor-not-allowed"><BarChart3 size={18} /></div>
          </div>
        </div>

        <ApiPlaceholder>
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 border border-zinc-50">
            <Database className="text-zinc-200" size={32} />
          </div>
          <h4 className="text-xl font-black tracking-tight uppercase mb-3">Product Sales API Offline</h4>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto font-medium leading-relaxed">
            We are currently awaiting the implementation of the <code className="bg-zinc-100 px-2 py-0.5 rounded text-black">GET /merchant/product-sales</code> endpoint to populate this breakdown.
          </p>
          
          <div className="mt-10 grid grid-cols-3 gap-8 w-full max-w-2xl border-t border-zinc-100 pt-10">
            <div className="opacity-20 flex flex-col items-center">
              <div className="w-full h-4 bg-zinc-200 rounded-full mb-2" />
              <div className="w-1/2 h-3 bg-zinc-100 rounded-full" />
            </div>
            <div className="opacity-20 flex flex-col items-center">
              <div className="w-full h-4 bg-zinc-200 rounded-full mb-2" />
              <div className="w-1/2 h-3 bg-zinc-100 rounded-full" />
            </div>
            <div className="opacity-20 flex flex-col items-center">
              <div className="w-full h-4 bg-zinc-200 rounded-full mb-2" />
              <div className="w-1/2 h-3 bg-zinc-100 rounded-full" />
            </div>
          </div>
        </ApiPlaceholder>
      </section>

      <footer className="mt-32 py-12 border-t border-zinc-50 flex justify-between items-center">
        <p className="text-zinc-300 text-[9px] font-black uppercase tracking-[0.5em]">System Status: Awaiting Integration</p>
        <button className="text-zinc-300 hover:text-black transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
          Documentation <ArrowUpRight size={14} />
        </button>
      </footer>
    </div>
  );
}