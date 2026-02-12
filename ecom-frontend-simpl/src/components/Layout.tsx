import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ShoppingBag, User, LogOut, Menu, X } from "lucide-react";

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
  padding: 0 16px;
  @media (min-width: 640px) {
    padding: 0 24px;
  }
  @media (min-width: 1024px) {
    padding: 0 40px;
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 18px;
  @media (min-width: 640px) {
    font-size: 24px;
  }
  font-weight: 900;
  letter-spacing: -1.5px;
  text-transform: uppercase;
  text-decoration: none;
  color: #000;
  white-space: nowrap;
`;

const NavLinks = styled.div<{ $isOpen?: boolean }>`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  @media (min-width: 1024px) {
    display: flex;
  }
  flex-direction: column;
  @media (min-width: 1024px) {
    flex-direction: row;
  }
  gap: 20px;
  @media (min-width: 1024px) {
    gap: 40px;
  }

  position: absolute;
  @media (min-width: 1024px) {
    position: static;
  }
  top: 72px;
  left: 0;
  right: 0;
  background: white;
  @media (min-width: 1024px) {
    background: transparent;
  }
  border-bottom: 1px solid #efeff1;
  @media (min-width: 1024px) {
    border-bottom: none;
  }
  padding: 16px;
  @media (min-width: 1024px) {
    padding: 0;
  }
  z-index: 50;

  a {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-decoration: none;
    color: #71717a;
    transition: color 0.2s;
    &:hover {
      color: #000;
    }
  }
`;

const HamburgerButton = styled.button`
  display: flex;
  @media (min-width: 1024px) {
    display: none;
  }
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #18181b;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (min-width: 640px) {
    gap: 24px;
  }
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
  padding: 32px 16px;
  @media (min-width: 640px) {
    padding: 48px 24px;
  }
  @media (min-width: 1024px) {
    padding: 48px 40px;
  }
`;

const UserGreet = styled.span`
  font-size: 9px;
  @media (min-width: 640px) {
    font-size: 10px;
  }
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #a1a1aa;
  white-space: nowrap;
`;

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic Auth State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role Detection
  const isMerchant = role === "MERCHANT";

  // Logic to determine where the Logo takes the user
  const logoDestination = isMerchant ? "/merchant" : "/";

  const fetchCartCount = async () => {
    const activeToken = localStorage.getItem("token");
    const activeRole = localStorage.getItem("role");

    // Merchants do not have a customer cart
    if (!activeToken || activeRole === "MERCHANT") {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(
        "https://order-service-p792.onrender.com/api/cart/view",
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        },
      );
      const json = await res.json();
      if (json.success) {
        // Change: sum the quantity of each item instead of using items.length
        const totalQuantity = json.data.items.reduce(
          (acc: number, item: any) => acc + item.quantity,
          0,
        );
        setCartCount(totalQuantity);
      }
    } catch (e) {
      console.error("Cart count fetch failed", e);
    }
  };

  const syncAuth = () => {
    setToken(localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    setUserName(localStorage.getItem("firstName"));
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
    navigate("/login");
    window.dispatchEvent(new Event("authChange"));
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      <NavWrapper>
        <NavContainer>
          <Logo to={logoDestination} onClick={closeMobileMenu}>
            ETHEREAL
          </Logo>

          <NavLinks $isOpen={mobileMenuOpen}>
            {isMerchant ? (
              <>
                <Link to="/merchant" onClick={closeMobileMenu}>
                  Home
                </Link>
                <Link to="/merchant/dashboard" onClick={closeMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/merchant/manage" onClick={closeMobileMenu}>
                  Inventory
                </Link>
              </>
            ) : (
              <>
                <Link to="/" onClick={closeMobileMenu}>
                  Shop
                </Link>
                <Link to="/orders" onClick={closeMobileMenu}>
                  My Orders
                </Link>
              </>
            )}
          </NavLinks>

          <IconGroup>
            {userName && <UserGreet>Hi, {userName}</UserGreet>}

            {/* Cart Badge - Hidden for Merchants */}
            {!isMerchant && (
              <CartBadge
                onClick={() => {
                  navigate("/cart");
                  closeMobileMenu();
                }}
              >
                <ShoppingBag size={20} strokeWidth={2.5} />
                {cartCount > 0 && <span className="count">{cartCount}</span>}
              </CartBadge>
            )}

            {token ? (
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <LogOut size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  closeMobileMenu();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <User size={20} strokeWidth={2.5} />
              </button>
            )}

            <HamburgerButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </HamburgerButton>
          </IconGroup>
        </NavContainer>
      </NavWrapper>

      <MainContent>{children}</MainContent>

      <footer
        style={{
          padding: "60px 0",
          borderTop: "1px solid #efeff1",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "5px",
            color: "#d1d1d6",
            textTransform: "uppercase",
          }}
        >
          Ethereal Concept Store — 2026
        </p>
      </footer>
    </div>
  );
}
