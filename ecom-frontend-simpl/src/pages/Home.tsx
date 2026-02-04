import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- STYLED COMPONENTS (Premium Aesthetic) ---
const Container = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

const SearchBarWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  align-items: center;

  input {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    border: 1px solid #E4E4E7;
    background: #F4F4F5;
    font-size: 15px;
    outline: none;
    transition: all 0.2s;
    &:focus { background: white; border-color: #000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
`;

const ProductLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ImageBox = styled.div`
  aspect-ratio: 4/5;
  background: #f1f1f1;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
    transition: transform 0.5s ease;
  }

  ${Card}:hover & img {
    transform: scale(1.05);
  }
`;

const OutOfStockOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #EF4444;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 10;
`;

const Info = styled.div`
  h3 { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
  p { font-size: 13px; color: #71717A; margin: 4px 0 12px 0; }
  .brand { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #A1A1AA; letter-spacing: 1px; }
`;

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrls: string[];
  description: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm === "") {
      fetchAllProducts();
    } else {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('https://product-service-jzzf.onrender.com/api/v1/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  const handleSearch = async (keyword: string) => {
    try {
      const res = await fetch(`https://product-service-jzzf.onrender.com/api/v1/products/search?keyword=${keyword}`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  const isOutOfStock = (productId: string) => {
    const dummyOut = ["697af8966f07a30785c340fc"]; 
    return dummyOut.includes(productId);
  };

  return (
    <Container>
      <SearchBarWrapper>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 20, top: 16, color: '#A1A1AA' }} />
          <input 
            style={{ paddingLeft: '50px' }}
            placeholder="Search by brand or model..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={{ background: 'black', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          Filter
        </button>
      </SearchBarWrapper>

      <ProductGrid>
        {products.map((product) => (
          <ProductLink key={product.id} to={`/product/${product.id}`}>
            <Card>
              {isOutOfStock(product.id) && <OutOfStockOverlay>Out of Stock</OutOfStockOverlay>}
              <ImageBox>
                <img src={product.imageUrls[0] || 'https://via.placeholder.com/400x500'} alt={product.name} />
              </ImageBox>
              <Info>
                <span className="brand">{product.brand}</span>
                <h3>{product.name}</h3>
                <p>{product.description.substring(0, 60)}...</p>
              </Info>
            </Card>
          </ProductLink>
        ))}
      </ProductGrid>
    </Container>
  );
}