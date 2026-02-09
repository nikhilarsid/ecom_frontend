import styled from "styled-components";
import { LogIn, UserPlus, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  padding: 32px;
  position: relative;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleAuth = (path: string) => {
    // Save current location so Login page knows where to send the user back
    navigate(path, { state: { from: location.pathname + location.search } });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
          <X size={20} />
        </button>
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn className="text-black" size={28} />
        </div>
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sign in Required</h2>
        <p className="text-zinc-500 text-sm mb-8">Join Ethereal to add items to your cart, leave reviews, and track your orders.</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleAuth('/login')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
          >
            <LogIn size={18} /> Sign In
          </button>
          <button 
            onClick={() => handleAuth('/register')}
            className="w-full bg-zinc-100 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
          >
            <UserPlus size={18} /> Create Account
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}