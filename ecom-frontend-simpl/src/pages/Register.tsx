import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User, Store, Loader2, AlertCircle } from 'lucide-react';

// Use $active (Transient Prop) to fix the DOM warning
const RoleCard = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: 24px;
  border-radius: 24px;
  border: 2px solid ${props => props.$active ? '#000' : '#f1f1f1'};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: ${props => props.$active ? '#fafafa' : 'white'};
  
  svg { color: ${props => props.$active ? '#000' : '#d1d1d6'}; margin-bottom: 12px; }
  span { font-size: 10px; font-weight: 900; letter-spacing: 2px; color: ${props => props.$active ? '#000' : '#a1a1aa'}; }
`;

export default function Register() {
  const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    businessName: '',
    gstNumber: ''
  });
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Construct payload exactly as backend expects
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: role,
      phoneNumber: formData.phoneNumber,
      address: [formData.address] // Backend expects an array
    };

    if (role === 'MERCHANT') {
      payload.businessName = formData.businessName;
      payload.gstNumber = formData.gstNumber;
    }

    console.log("Registering with payload:", payload);

    try {
      const res = await fetch('https://auth-service-qivh.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userName', data.firstName);
        window.dispatchEvent(new Event("authChange"));
        navigate(role === 'MERCHANT' ? '/merchant/dashboard' : '/');
      } else {
        setError(data.message || "Registration failed. Check if email exists.");
      }
    } catch (err) {
      setError("Service unreachable. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-4xl font-black tracking-tighter mb-8 italic text-center">JOIN ETHEREAL</h1>
      
      <div className="flex gap-4 mb-10">
        <RoleCard $active={role === 'CUSTOMER'} onClick={() => setRole('CUSTOMER')}>
          <User size={32} className="mx-auto" />
          <span>CUSTOMER</span>
        </RoleCard>
        <RoleCard $active={role === 'MERCHANT'} onClick={() => setRole('MERCHANT')}>
          <Store size={32} className="mx-auto" />
          <span>MERCHANT</span>
        </RoleCard>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4 bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
        <input className="p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" placeholder="First Name" onChange={e => setFormData({...formData, firstName: e.target.value})} required />
        <input className="p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" placeholder="Last Name" onChange={e => setFormData({...formData, lastName: e.target.value})} required />
        <input className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <input className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" placeholder="Phone Number" onChange={e => setFormData({...formData, phoneNumber: e.target.value})} required />
        <input className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5" placeholder="Address (Full City/State)" onChange={e => setFormData({...formData, address: e.target.value})} required />
        
        {role === 'MERCHANT' && (
          <>
            <input className="p-4 rounded-xl bg-zinc-50 border-none outline-none" placeholder="Business Name" onChange={e => setFormData({...formData, businessName: e.target.value})} required />
            <input className="p-4 rounded-xl bg-zinc-50 border-none outline-none" placeholder="GST Number" onChange={e => setFormData({...formData, gstNumber: e.target.value})} required />
          </>
        )}

        <button disabled={loading} className="col-span-2 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] mt-4 flex justify-center items-center gap-2 hover:opacity-90 transition-all">
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
        </button>
      </form>
    </div>
  );
}