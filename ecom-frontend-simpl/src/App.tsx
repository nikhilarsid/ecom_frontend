import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
// Note: We keep the CSS import so styles work if the library is fixed
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
        {/* REMOVED ToastContainer from here. 
          React 19 currently has a conflict with the Lt component in react-toastify.
        */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<IndividualProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route path="/merchant">
            <Route
              index
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantHome />
                </ProtectedRoute>
              }
            />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="manage"
              element={
                <ProtectedRoute allowedRole="MERCHANT">
                  <MerchantManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;