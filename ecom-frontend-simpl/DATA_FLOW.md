# Frontend Data Filtering & Cart Flow Documentation

## Overview

Yes, it IS possible to filter API responses on the frontend! This is the standard approach for transforming API data before display.

---

## 1. PRODUCT DETAIL PAGE (`IndividualProductDetails.tsx`)

### API Response from Backend

```
GET https://product-service-jzzf.onrender.com/api/v1/products/1?variantId=843d2caf-17bc-434d-900b-6427b2f45d80
```

**Response Structure:**

```json
{
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro Max",
    "brand": "Apple",
    "description": "...",
    "imageUrls": ["url1", "url2", ...],
    "specs": {
      "Color": "Black",
      "Storage": "256GB",
      "Memory": "8GB",
      ...
    },
    "sellers": [
      {
        "merchantId": "merchant@email.com",
        "merchantName": "Store Name",
        "price": 999.99,
        "stock": 50
      }
    ]
  }
}
```

### Filtering on Frontend

When user clicks "Add to Cart":

```typescript
// ✅ FILTER: Extract image and specs from product details
const imageUrl = product?.imageUrls?.[0] || null;
const productName = product?.name || "Product";
const specs = product?.specs || {};

// Store these locally for cart display
const cartItemData = {
  productId: 1,
  variantId: "843d2caf-...",
  merchantId: "merchant@email.com",
  quantity: 2,
  imageUrl: imageUrl, // ← Captured from API response
  productName: productName, // ← Captured from API response
  specs: specs, // ← Captured from API response
};
```

---

## 2. SEND TO CART API

### API Call

```
POST https://order-service-p792.onrender.com/api/cart/addItem
```

### Payload (Only Required Fields)

```json
{
  "productId": 1,
  "variantId": "843d2caf-17bc-434d-900b-6427b2f45d80",
  "merchantId": "merchant@email.com",
  "quantity": 2
}
```

### Store Locally (Optional Enhancement)

```typescript
// Save to localStorage for instant display (before API returns)
const cartDetails = JSON.parse(localStorage.getItem("cartDetails") || "{}");
cartDetails[`${productId}-${variantId}-${merchantId}`] = cartItemData;
localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
```

---

## 3. CART PAGE (`Cart.tsx`)

### Cart View API Response

```
GET https://order-service-p792.onrender.com/api/cart/view
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cartId": 0,
    "items": [
      {
        "merchantProductId": 1,
        "productName": "iPhone 15 Pro Max",
        "quantity": 2,
        "price": 999.99,
        "imageUrl": "...",
        "variantId": "843d2caf-...",
        "itemId": "cart-item-123"
      }
    ],
    "totalValue": 1999.98
  }
}
```

### Hydration (Enriching Cart Data)

If cart API doesn't return all details, we enrich it:

```typescript
const hydrateCartItems = async (items) => {
  const enriched = await Promise.all(
    items.map(async (item) => {
      // ✅ FETCH: Get full product details from product API
      const pRes = await fetch(
        `https://product-service-jzzf.onrender.com/api/v1/products/${item.merchantProductId}?variantId=${item.variantId}`,
      );
      const pData = await pRes.json();

      // ✅ ENRICH: Merge cart item with product details
      return {
        ...item,
        productName: pData.data.name,
        imageUrl: pData.data.imageUrls?.[0],
        specs: pData.data.specs,
      };
    }),
  );
  setEnrichedItems(enriched);
};
```

### Display in Cart

```tsx
{
  displayItems.map((item) => (
    <CartItem key={item.merchantProductId}>
      {/* Image */}
      <img src={item.imageUrl} alt="" />

      {/* Product Name */}
      <h3>{item.productName}</h3>

      {/* Specs (First 3) */}
      {Object.entries(item.specs)
        .slice(0, 3)
        .map(([key, val]) => (
          <span>
            {key}: {val}
          </span>
        ))}

      {/* Quantity */}
      <p>Quantity: {item.quantity}</p>

      {/* Price */}
      <p>${item.price * item.quantity}</p>
    </CartItem>
  ));
}
```

---

## 4. CHECKOUT PAGE (`Checkout.tsx`)

### Input

Cart passed from Cart page:

```typescript
const { cart } = location.state;
// cart.items already contains: imageUrl, productName, quantity, specs
// cart.totalValue = total price
```

### Display Order Summary

```tsx
{
  cart.items.map((item) => (
    <div>
      <h4>{item.productName}</h4>
      <p>QTY: {item.quantity}</p>
      <p>${item.price * item.quantity}</p>
    </div>
  ));
}
```

### Order Placement

```
POST https://order-service-p792.onrender.com/api/orders/add
```

---

## Summary: Data Transformation Pipeline

```
PRODUCT API RESPONSE
        ↓
    [FILTER] Extract: image, specs, name
        ↓
  CART API SEND (minimal payload)
        ↓
   CART API RESPONSE
        ↓
  [HYDRATE] Merge with product details
        ↓
    ENRICH CART ITEMS
        ↓
   DISPLAY IN CART
        ↓
   PASS TO CHECKOUT
        ↓
   DISPLAY IN ORDER SUMMARY
        ↓
   PLACE ORDER
```

---

## Key Points

✅ **YES, frontend filtering is possible and recommended**

- Extract needed fields from large API responses
- Reduce data sent between components
- Cache locally for better UX
- Enrich data from multiple API sources

✅ **Benefits:**

1. **API Optimization**: Send only required fields to cart API
2. **Display Optimization**: Enrich cart with product details on frontend
3. **User Experience**: Instant display without waiting for hydration
4. **Flexibility**: Transform data however you need

✅ **Current Implementation:**

- IndividualProductDetails: Filters and captures image + specs when adding to cart
- Cart: Hydrates items with product details on load
- Checkout: Receives enriched items and displays them
