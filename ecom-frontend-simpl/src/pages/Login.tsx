import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Loader2, ArrowRight } from 'lucide-react';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 80px auto;
  padding: 40px;
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f1f1;
  box-shadow: 0 20px 40px rgba(0,0,0,0.02);
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #e4e4e7;
  background: #fafafa;
  outline: none;
  &:focus { border-color: #000; background: white; }
`;

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://auth-service-qivh.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userName', data.firstName);
        
        // Redirect based on role
        data.role === 'MERCHANT' ? navigate('/merchant/dashboard') : navigate('/');
        window.dispatchEvent(new Event("authChange"));
      } else {
        alert("Login failed. Check credentials.");
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <AuthContainer>
      <h1 className="text-3xl font-black tracking-tighter mb-2 italic">WELCOME BACK</h1>
      <p className="text-zinc-400 text-sm mb-8 font-medium">Enter your details to access Ethereal.</p>
      
      <form onSubmit={handleLogin}>
        <Input 
          type="email" 
          placeholder="Email Address" 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <Input 
          type="password" 
          placeholder="Password" 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button 
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-all mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Login <ArrowRight size={16}/></>}
        </button>
      </form>
      
      <p className="text-center mt-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
        New here? <Link to="/register" className="text-black border-b border-black">Create Account</Link>
      </p>
    </AuthContainer>
  );
}