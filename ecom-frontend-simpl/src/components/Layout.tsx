import { ReactNode, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ShoppingBag, User, LogOut } from 'lucide-react';

// --- STYLED COMPONENTS ---
const NavWrapper = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 72px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #efeff1;
  display: flex;
  align-items: center;
`;

const NavContainer = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1.5px;
  text-transform: uppercase;
  text-decoration: none;
  color: #000;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 40px;
  a {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-decoration: none;
    color: #71717a;
    transition: color 0.2s;
    &:hover { color: #000; }
  }
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  color: #18181b;
`;

const CartBadge = styled.div`
  position: relative;
  cursor: pointer;
  .count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: black;
    color: white;
    font-size: 9px;
    font-weight: 800;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
  }
`;

const MainContent = styled.main`
  flex-grow: 1;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 48px 40px;
`;

const UserGreet = styled.span`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #a1a1aa;
`;

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dynamic Auth State
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [cartCount, setCartCount] = useState(0);

  // Role Detection
  const isMerchant = role === 'MERCHANT';

  // Logic to determine where the Logo takes the user
  const logoDestination = isMerchant ? "/merchant" : "/";

  const fetchCartCount = async () => {
    const activeToken = localStorage.getItem('token');
    const activeRole = localStorage.getItem('role');

    // Merchants do not have a customer cart
    if (!activeToken || activeRole === 'MERCHANT') {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch('https://order-service-p792.onrender.com/api/cart/view', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const json = await res.json();
      if (json.success) {
        setCartCount(json.data.items.length);
      }
    } catch (e) {
      console.error("Cart count fetch failed", e);
    }
  };

  const syncAuth = () => {
    setToken(localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
    setUserName(localStorage.getItem('userName'));
    fetchCartCount();
  };

  useEffect(() => {
    syncAuth();
    
    // Listen for custom events (Auth changes or Cart additions)
    window.addEventListener("authChange", syncAuth);
    window.addEventListener("cartUpdated", fetchCartCount);
    
    return () => {
      window.removeEventListener("authChange", syncAuth);
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    syncAuth();
    navigate('/login');
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <NavWrapper>
        <NavContainer>
          <Logo to={logoDestination}>ETHEREAL</Logo>
          
          <NavLinks>
            {isMerchant ? (
              <>
                <Link to="/merchant">Home</Link>
                <Link to="/merchant/dashboard">Dashboard</Link>
                <Link to="/merchant/manage">Inventory</Link>
              </>
            ) : (
              <>
                <Link to="/">Shop</Link>
                <Link to="/orders">My Orders</Link>
              </>
            )}
          </NavLinks>

          <IconGroup>
            {userName && <UserGreet>Hi, {userName}</UserGreet>}
            
            {/* Cart Badge - Hidden for Merchants */}
            {!isMerchant && (
              <CartBadge onClick={() => navigate('/cart')}>
                <ShoppingBag size={20} strokeWidth={2.5} />
                {cartCount > 0 && <span className="count">{cartCount}</span>}
              </CartBadge>
            )}

            {token ? (
              <button 
                onClick={handleLogout} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <LogOut size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <User size={20} strokeWidth={2.5} />
              </button>
            )}
          </IconGroup>
        </NavContainer>
      </NavWrapper>

      <MainContent>{children}</MainContent>

      <footer style={{ padding: '60px 0', borderTop: '1px solid #efeff1', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '5px', color: '#d1d1d6', textTransform: 'uppercase' }}>
          Ethereal Concept Store — 2026
        </p>
      </footer>
    </div>
  );
}