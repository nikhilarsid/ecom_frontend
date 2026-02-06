import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page Imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IndividualProductDetails from "./pages/IndividualProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";

// Merchant Pages
import MerchantHome from "./pages/MerchantHome";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantManagement from "./pages/MerchantManagement";

// --- PROTECTED ROUTE COMPONENT ---
// Ensures only authorized users can access specific business or customer logic
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: string;
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  // If a role is specified and the user doesn't match, send them to their respective home
  if (allowedRole && role !== allowedRole) {
    return role === "MERCHANT" ? (
      <Navigate to="/merchant" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Layout>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* --- PUBLIC ACCESSIBLE ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<IndividualProductDetails />} />

          {/* AUTHENTICATION */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- CUSTOMER EXCLUSIVE ROUTES --- */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* --- MERCHANT SECTOR (Seller Central Logic) --- */}
          <Route path="/merchant">
            {/* Merchant landing page - showing their own inventory only */}
            <Route
              index
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantHome />
                </ProtectedRoute>
              }
            />

            {/* Sales analytics and business stats */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantDashboard />
                </ProtectedRoute>
              }
            />

            {/* Inventory Management: Add, Update, and Delete Products */}
            <Route
              path="manage"
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* CATCH-ALL REDIRECT */}
          {/* Handles broken links by returning users to their appropriate base page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
