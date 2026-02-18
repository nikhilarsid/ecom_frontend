import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Loader2,
  PackageOpen,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Truck,
  MapPin,
  Calendar,
  X,
  ImageOff, // Import ImageOff icon
} from "lucide-react";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const FeedbackBanner = styled.div<{ $type: "error" | "info" }>`
  background: ${(props) => (props.$type === "error" ? "#FEF2F2" : "#F9FAFB")};
  border: 1px solid
    ${(props) => (props.$type === "error" ? "#FEE2E2" : "#F3F4F6")};
  color: ${(props) => (props.$type === "error" ? "#991B1B" : "#4B5563")};
  padding: 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  text-align: center;
  color: #a1a1aa;
  svg {
    margin-bottom: 32px;
    color: #e4e4e7;
  }
  h2 {
    color: #18181b;
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 12px;
    letter-spacing: -1px;
  }
  .shop-btn {
    background: black;
    color: white;
    padding: 16px 40px;
    border-radius: 18px;
    text-decoration: none;
    font-weight: 900;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
  }
`;

const OrderCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 32px;
  border: 1px solid #efeff1;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    border-color: #000;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  }
`;

const OrderItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f1f1;
`;

const MiniProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  padding: 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f1f1;
    transform: translateX(4px);
  }

  /* Handle both img tag and fallback div */
  .product-thumb {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    object-fit: cover;
    mix-blend-mode: multiply;
  }

  .placeholder-thumb {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: #e4e4e7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a1a1aa;
  }

  div.info {
    display: flex;
    flex-direction: column;
  }
`;

// Modal Styles
const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
  transition: opacity 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 32px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f1f1f1;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #000;
    color: white;
  }
`;

const ItemDetailsContainer = styled.div`
  padding-top: 10px;
`;

const ItemHeader = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: flex-start;
`;

const ItemImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 20px;
  object-fit: cover;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const ItemMeta = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  svg {
    color: #000;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShippingTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TimelineItem = styled.div<{ $active?: boolean }>`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: ${(props) => (props.$active ? "#f0f0f0" : "#fafafa")};
  border-radius: 12px;
  border-left: 4px solid ${(props) => (props.$active ? "#000" : "#e4e4e7")};
`;

const TimelineDot = styled.div<{ $completed?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(props) => (props.$completed ? "#000" : "#e4e4e7")};
  flex-shrink: 0;
  margin-top: 4px;
`;

const TimelineContent = styled.div`
  flex: 1;

  h4 {
    font-weight: 900;
    font-size: 14px;
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    color: #666;
  }
`;

const PriceBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 16px;
  margin-top: 12px;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  &.total {
    font-weight: 900;
    font-size: 16px;
    border-top: 1px solid #e4e4e7;
    padding-top: 12px;
    margin-top: 12px;
  }
`;

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderDetails, setOrderDetails] = useState<Record<string, any[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandingId, setExpandingId] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const navigate = useNavigate();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Active session not found.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://10.65.1.75:8062/api/orders/view",
        { headers: getHeaders() },
      );

      if (res.status === 403) {
        setError("Your session has expired.");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch (e) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (rawOrderId: string | number) => {
    const orderId = String(rawOrderId);

    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    if (orderDetails[orderId]) {
      setExpandedOrder(orderId);
      return;
    }

    setExpandingId(orderId);

    try {
      // 1. Get items from the existing order list in state
      const targetOrder = orders.find((o) => String(o.orderId) === orderId);
      let items = targetOrder?.items || [];

      if (!Array.isArray(items)) {
        // @ts-ignore
        items = items?.items ? items.items : items ? [items] : [];
      }

      const hydratedItems = await Promise.all(
        items.map(async (item: any) => {
          // ✅ FIX: Use the Order Item Table ID (itemId), not Product ID
          const itemId = item.itemId;

          try {
            if (itemId) {
              // ✅ FIX: Fetch from Order Service using the correct Item ID
              const res = await fetch(
                `http://10.65.1.75:8062/api/orders/viewItem/${itemId}`,
                { headers: getHeaders() },
              );
              const json = await res.json();

              if (json.success) {
                return {
                  ...item,
                  // ✅ FIX: Map the data from Order Service response
                  // Order Service returns 'imageUrl' directly as a string (from your DB table)
                  imageUrl: json.data.imageUrl,
                  merchantName: json.data.merchantName,
                  price: json.data.price,
                  // Ensure productName is available for display in modal/list
                  productName:
                    json.data.productName ||
                    json.data.name ||
                    item.productName ||
                    item.name,
                };
              }
            }
          } catch (e) {
            console.warn("Item details fetch failed", itemId);
          }
          return item;
        }),
      );

      setOrderDetails((prev) => ({ ...prev, [orderId]: hydratedItems }));
      setExpandedOrder(orderId);
    } catch (e) {
      console.error("API Error", e);
    } finally {
      setExpandingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const generateShippingStatus = (orderId: number) => {
    // Generate static timeline dates for demo
    return [
      {
        stage: "Order Confirmed",
        description: "Your order has been confirmed",
        completed: true,
        date: new Date().toLocaleDateString(),
      },
      {
        stage: "Processing",
        description: "Your order is being prepared for shipment",
        completed: true,
        date: new Date(Date.now() + 86400000).toLocaleDateString(),
      },
      {
        stage: "Shipped",
        description: "Package has been handed to courier",
        completed: true,
        date: new Date(Date.now() + 172800000).toLocaleDateString(),
      },
      {
        stage: "In Transit",
        description: "Your package is on its way to you",
        completed: true,
        date: new Date(Date.now() + 259200000).toLocaleDateString(),
      },
      {
        stage: "Out for Delivery",
        description: "Package is out for delivery today",
        completed: false,
        date: new Date(Date.now() + 345600000).toLocaleDateString(),
      },
      {
        stage: "Delivered",
        description: "Package delivered to your address",
        completed: false,
        date:
          "Expected: " + new Date(Date.now() + 432000000).toLocaleDateString(),
      },
    ];
  };

  const handleItemClick = (item: any, orderId: string) => {
    setSelectedItem(item);
    setSelectedOrderId(orderId);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedOrderId(null);
  };

  // ✅ ERROR SAFE IMAGE COMPONENT
  const SafeImage = ({ src, alt }: { src?: string; alt: string }) => {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
      return (
        <div className="placeholder-thumb">
          <ImageOff size={16} />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className="product-thumb"
        onError={(e) => {
          // Prevent infinite loop by setting error state and clearing handler
          e.currentTarget.onerror = null;
          setHasError(true);
        }}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
            History
          </h1>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-4">
            Secure Order Archive
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <Spinner size={48} />
        </div>
      ) : error ? (
        <FeedbackBanner $type="error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black"
          >
            RE-AUTHENTICATE
          </button>
        </FeedbackBanner>
      ) : orders.length === 0 ? (
        <EmptyState>
          <PackageOpen size={80} strokeWidth={1} />
          <h2>ARCHIVE EMPTY</h2>
          <Link to="/" className="shop-btn">
            Explore Collection <ArrowRight size={16} />
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === String(order.orderId);
            const isExpanding = expandingId === String(order.orderId);

            return (
              <OrderCard
                key={order.orderId}
                onClick={() => fetchOrderItems(order.orderId)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    
                    <span className="text-[9px] font-bold bg-zinc-50 text-zinc-500 px-2 py-0.5 rounded border border-zinc-100 uppercase">
                      {order.firstName} {order.lastName}
                    </span>
                    <h3 className="text-3xl font-black tracking-tight leading-none">
                      ${order.totalAmount.toLocaleString()}
                    </h3>
                    <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold uppercase leading-tight tracking-tight">
                          {order.address}
                        </p>
                      </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ${order.paymentStatus || 'PENDING'}
                    </span>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-200 pr-3">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                        {isExpanding
                          ? "Loading..."
                          : isExpanded
                            ? "Hide Items"
                            : "View Items"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="bg-zinc-100 text-black border border-zinc-200 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
                      {order.status}
                    </div>
                    {isExpanding ? (
                      <Spinner size={20} className="text-zinc-400" />
                    ) : isExpanded ? (
                      <ChevronUp size={20} className="text-zinc-400" />
                    ) : (
                      <ChevronDown size={20} className="text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Items Section */}
                {isExpanded && orderDetails[String(order.orderId)] && (
                  <OrderItemsGrid onClick={(e) => e.stopPropagation()}>
                    {orderDetails[String(order.orderId)].map((item: any) => (
                      <MiniProduct
                        key={item.id || item.itemId || Math.random()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item, String(order.orderId));
                        }}
                      >
                        {/* ✅ Use Safe Image Component */}
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.productName || "Product"}
                        />

                        <div className="info">
                          <span className="text-[10px] font-bold text-zinc-900 leading-tight">
                            {item.productName || "Product"}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 mt-1">
                            Qty: {item.quantity} · ${item.price}
                          </span>
                        </div>
                      </MiniProduct>
                    ))}
                  </OrderItemsGrid>
                )}
              </OrderCard>
            );
          })}
        </div>
      )}

      <div className="mt-20 pt-10 border-t border-zinc-50 text-center">
        <p className="text-zinc-300 text-[9px] font-black uppercase tracking-[0.5em]">
          End of Archive
        </p>
      </div>

      {/* Item Details Modal */}
      <Modal $isOpen={!!selectedItem} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={closeModal}>
            <X size={20} />
          </CloseButton>

          {selectedItem && (
            <ItemDetailsContainer>
              <ItemHeader>
                {/* Safe Image for Modal Header */}
                <div
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 20,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <SafeImage
                    src={selectedItem.imageUrl}
                    alt={selectedItem.productName}
                  />
                </div>

                <ItemInfo>
                  <ItemTitle>{selectedItem.productName || "Product"}</ItemTitle>
                  <ItemMeta>
                    <MetaItem>
                      <span className="font-bold">Quantity:</span>{" "}
                      {selectedItem.quantity} units
                    </MetaItem>
                    <MetaItem>
                      <span className="font-bold">Price:</span> $
                      {selectedItem.price}
                    </MetaItem>
                  </ItemMeta>
                </ItemInfo>
              </ItemHeader>

              <Section>
                <SectionTitle>
                  <Truck size={18} /> Shipping & Delivery
                </SectionTitle>
                <ShippingTimeline>
                  {generateShippingStatus(parseInt(selectedOrderId || "0")).map(
                    (status, idx) => (
                      <TimelineItem key={idx} $active={idx === 3}>
                        <TimelineDot $completed={status.completed} />
                        <TimelineContent>
                          <h4>{status.stage}</h4>
                          <p>{status.description}</p>
                          <p
                            style={{
                              marginTop: "4px",
                              fontSize: "11px",
                              color: "#999",
                            }}
                          >
                            {status.date}
                          </p>
                        </TimelineContent>
                      </TimelineItem>
                    ),
                  )}
                </ShippingTimeline>
              </Section>

              <Section>
                <SectionTitle>
                  <Calendar size={18} /> Order Details
                </SectionTitle>
                <PriceBreakdown>
                  <PriceRow>
                    <span>Product Price</span>
                    <span>${selectedItem.price}</span>
                  </PriceRow>
                  <PriceRow>
                    <span>Quantity</span>
                    <span>x {selectedItem.quantity}</span>
                  </PriceRow>
                  <PriceRow>
                    <span>Shipping</span>
                    <span>Free</span>
                  </PriceRow>
                  <PriceRow className="total">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        selectedItem.price * selectedItem.quantity
                      ).toLocaleString()}
                    </span>
                  </PriceRow>
                </PriceBreakdown>
              </Section>

              <Section>
                <SectionTitle>
                  <Truck size={18} /> Tracking Information
                </SectionTitle>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: "16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  <p>
                    <strong>Tracking ID:</strong> TRK{selectedItem.orderId}$
                    {selectedItem.id}
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    <strong>Carrier:</strong> Standard Logistics
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    <strong>Est. Delivery:</strong> 5-7 business days
                  </p>
                </div>
              </Section>
            </ItemDetailsContainer>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
