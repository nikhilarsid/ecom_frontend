import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { User, Store, Loader2, AlertCircle } from "lucide-react";

// Use $active (Transient Prop) to fix the DOM warning
const RoleCard = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: 24px;
  border-radius: 24px;
  border: 2px solid ${(props) => (props.$active ? "#000" : "#f1f1f1")};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: ${(props) => (props.$active ? "#fafafa" : "white")};

  svg {
    color: ${(props) => (props.$active ? "#000" : "#d1d1d6")};
    margin-bottom: 12px;
  }
  span {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 2px;
    color: ${(props) => (props.$active ? "#000" : "#a1a1aa")};
  }
`;

export default function Register() {
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    businessName: "",
    gstNumber: "",
  });

  const navigate = useNavigate();

  // Validation helper function
  const validateForm = (): string | null => {
    const errors: string[] = [];

    // First Name validation
    const firstName = formData.firstName.trim();
    if (!firstName) {
      errors.push("First name is required.");
    } else if (firstName.length < 2) {
      errors.push("First name must be at least 2 characters.");
    } else if (firstName.length > 50) {
      errors.push("First name must be at most 50 characters.");
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
      errors.push(
        "First name can only contain letters, spaces, hyphens, and apostrophes.",
      );
    }

    // Last Name validation
    const lastName = formData.lastName.trim();
    if (!lastName) {
      errors.push("Last name is required.");
    } else if (lastName.length < 2) {
      errors.push("Last name must be at least 2 characters.");
    } else if (lastName.length > 50) {
      errors.push("Last name must be at most 50 characters.");
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
      errors.push(
        "Last name can only contain letters, spaces, hyphens, and apostrophes.",
      );
    }

    // Email validation
    const email = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push("Email is required.");
    } else if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address.");
    } else if (email.length > 100) {
      errors.push("Email must be at most 100 characters.");
    }

    // Password validation (minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
    const password = formData.password;
    if (!password) {
      errors.push("Password is required.");
    } else if (password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    } else if (password.length > 128) {
      errors.push("Password must be at most 128 characters.");
    } else if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least 1 uppercase letter.");
    } else if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least 1 lowercase letter.");
    } else if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least 1 number.");
    }

    // Phone Number validation (10-15 digits)
    const phoneNumber = formData.phoneNumber.replace(/\D/g, "");
    if (!phoneNumber) {
      errors.push("Phone number is required.");
    } else if (phoneNumber.length < 10) {
      errors.push("Phone number must be at least 10 digits.");
    } else if (phoneNumber.length > 15) {
      errors.push("Phone number must be at most 15 digits.");
    }

    // Address validation
    const address = formData.address.trim();
    if (!address) {
      errors.push("Address is required.");
    } else if (address.length < 5) {
      errors.push("Address must be at least 5 characters.");
    } else if (address.length > 200) {
      errors.push("Address must be at most 200 characters.");
    }

    // Merchant-specific validations
    if (role === "MERCHANT") {
      const businessName = formData.businessName.trim();
      if (!businessName) {
        errors.push("Business name is required.");
      } else if (businessName.length < 2) {
        errors.push("Business name must be at least 2 characters.");
      } else if (businessName.length > 100) {
        errors.push("Business name must be at most 100 characters.");
      }

      const gstNumber = formData.gstNumber.trim().toUpperCase();
      // GST format: 15 alphanumeric characters
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstNumber) {
        errors.push("GST number is required.");
      } else if (gstNumber.length !== 15) {
        errors.push("GST number must be exactly 15 characters.");
      } else if (!gstRegex.test(gstNumber)) {
        errors.push("GST number format is invalid (e.g., 27AAFCT5055K1Z5).");
      }
    }

    return errors.length > 0 ? errors.join("\n") : null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Construct payload exactly as backend expects
    const payload: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: role,
      phoneNumber: formData.phoneNumber.replace(/\D/g, ""),
      address: formData.address.trim(), // Backend expects an array
    };

    if (role === "MERCHANT") {
      payload.businessName = formData.businessName.trim();
      payload.gstNumber = formData.gstNumber.trim().toUpperCase();
    }

    console.log("Registering with payload:", payload);

    try {
      const res = await fetch(
        "http://10.65.1.75:8060/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (res.ok && data.token) {
        const initial = "0";
        localStorage.setItem("token", data.token);
        localStorage.setItem("addresses",data.addresses);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.firstName);
         localStorage.setItem("cartCount", initial);
         
        window.dispatchEvent(new Event("authChange"));
        navigate(role === "MERCHANT" ? "/merchant/dashboard" : "/");
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
      <h1 className="text-4xl font-black tracking-tighter mb-8 italic text-center">
        JOIN ETHEREAL
      </h1>

      <div className="flex gap-4 mb-10">
        <RoleCard
          $active={role === "CUSTOMER"}
          onClick={() => setRole("CUSTOMER")}
        >
          <User size={32} className="mx-auto" />
          <span>CUSTOMER</span>
        </RoleCard>
        <RoleCard
          $active={role === "MERCHANT"}
          onClick={() => setRole("MERCHANT")}
        >
          <Store size={32} className="mx-auto" />
          <span>MERCHANT</span>
        </RoleCard>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form
        onSubmit={handleRegister}
        className="grid grid-cols-2 gap-4 bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm"
      >
        <input
          className="p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          placeholder="First Name"
          maxLength={50}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
        />
        <input
          className="p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          placeholder="Last Name"
          maxLength={50}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          required
        />
        <input
          className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          type="email"
          placeholder="Email"
          maxLength={100}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          type="password"
          placeholder="Password"
          maxLength={128}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <input
          className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          placeholder="Phone Number"
          maxLength={15}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          required
        />
        <input
          className="col-span-2 p-4 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5"
          placeholder="Address (Full City/State)"
          maxLength={200}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />

        {role === "MERCHANT" && (
          <>
            <input
              className="p-4 rounded-xl bg-zinc-50 border-none outline-none"
              placeholder="Business Name"
              maxLength={100}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              required
            />
            <input
              className="p-4 rounded-xl bg-zinc-50 border-none outline-none"
              placeholder="GST Number (15 chars)"
              maxLength={15}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gstNumber: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </>
        )}

        <button
          disabled={loading}
          className="col-span-2 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] mt-4 flex justify-center items-center gap-2 hover:opacity-90 transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}
