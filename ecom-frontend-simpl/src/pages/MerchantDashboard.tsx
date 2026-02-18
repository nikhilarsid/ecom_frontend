import { useState, useEffect } from "react";
import ProductService, {
  ProductListItem,
  CreateProductPayload,
} from "../services/ProductService";
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  FileEdit, // Icon for Edit Details
} from "lucide-react";
import { showToast } from "../utils/toast";

interface InventoryItem extends ProductListItem {
  editing?: boolean;
  newPrice?: number;
  newStock?: number;
  specs?: Record<string, string>;
}

export default function MerchantDashboard() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // 🆕 NEW: Tracks if we are "Relisting" (Editing details)
  const [editingId, setEditingId] = useState<{
    id: number;
    variantId: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "",
    brand: "",
    description: "",
    categories: [""],
    usp: [""],
    specs: {},
    attributes: {},
    price: 0,
    quantity: 0,
    imageUrls: [""],
  });

  const [specKeys, setSpecKeys] = useState<string[]>([""]);
  const [specValues, setSpecValues] = useState<string[]>([""]);
  const [attrKeys, setAttrKeys] = useState<string[]>([""]);
  const [attrValues, setAttrValues] = useState<string[]>([""]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getMerchantListings();
      setProducts(data);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NEW: Helper to reset form completely
  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      description: "",
      categories: [""],
      usp: [""],
      specs: {},
      attributes: {},
      price: 0,

      quantity: 0,
      imageUrls: [""],
    });
    setSpecKeys([""]);
    setSpecValues([""]);
    setAttrKeys([""]);
    setAttrValues([""]);
    setEditingId(null);
    setShowForm(false);
  };

  // 🆕 NEW: Open the form pre-filled with product data
  const handleOpenRelistForm = (product: InventoryItem) => {
    // Safely extract maps to arrays, handling nulls
    const sKeys = product.specs ? Object.keys(product.specs) : [""];
    const sVals = product.specs ? Object.values(product.specs) : [""];

    const aKeys = product.attributes ? Object.keys(product.attributes) : [""];
    const aVals = product.attributes ? Object.values(product.attributes) : [""];

    // Populate Form Data
    setFormData({
      name: product.name,
      brand: product.brand,
      description: product.description || "",
      categories: product.categories || [""],
      specs: product.specs || {},
      attributes: product.attributes || {},
      usp: product.usp || [""],
      price: product.lowestPrice,
      quantity: product.totalMerchants, 
      imageUrls: product.imageUrl ? [product.imageUrl] : [""],
    });

    // Set Dynamic Fields
    setSpecKeys(sKeys.length > 0 ? sKeys : [""]);
    setSpecValues(sVals.length > 0 ? (sVals as string[]) : [""]);
    setAttrKeys(aKeys.length > 0 ? aKeys : [""]);
    setAttrValues(aVals.length > 0 ? (aVals as string[]) : [""]);

    // Set ID for deletion step
    setEditingId({
      id: product.productId,
      variantId: product.variantId || "",
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
// ---------------------------------------------------------
  // CONSTANTS & REGEX DEFINITIONS
  // ---------------------------------------------------------
  const safeTextRegex = /^[a-zA-Z0-9\s\-_(),.&']+$/; // Allow letters, numbers, common punctuation
  const priceRegex = /^\d+(\.\d{1,2})?$/; // Integers or up to 2 decimal places
  const imageUrlRegex = /^https?:\/\/.+/i;
  // ---------------------------------------------------------
  // HANDLER
  // ---------------------------------------------------------
  const handleSaveProduct = async () => {
    const errors: Record<string, string> = {};

    // 1. PRODUCT NAME
    // Necessity: Required, distinct, max 150 chars.
    if (!formData.name.trim()) {
      errors.name = "Product name is required.";
    } else if (!safeTextRegex.test(formData.name)) {
      errors.name = "Product name contains invalid characters. Only letters, numbers, and basic punctuation are allowed.";
    } else if (formData.name.length < 3) {
      errors.name = "Product name is too short. Please enter at least 3 characters.";
    } else if (formData.name.length > 150) {
      errors.name = "Product name exceeds the maximum limit of 150 characters.";
    }

    // 2. BRAND
    // Necessity: Required, max 50 chars.
    if (!formData.brand.trim()) {
      errors.brand = "Brand name is required.";
    } else if (!safeTextRegex.test(formData.brand)) {
      errors.brand = "Brand name contains invalid characters.";
    } else if (formData.brand.length > 50) {
      errors.brand = "Brand name exceeds the maximum limit of 50 characters.";
    }

    // 3. DESCRIPTION
    // Necessity: Required, detailed (min 20 chars), max 500 chars.
    if (!safeTextRegex.test(formData.description || '')){
      errors.description = "Invalid charecters";
    }
    else if (!formData.description?.trim()) {
      errors.description = "Product description is required.";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description is too short. Please provide at least 20 characters to describe the item.";
    } else if (formData.description.length > 500) {
      errors.description = "Description is too long. Please summarize within 500 characters.";
    }

    // 4. PRICE
    // Necessity: Required, positive number, valid currency format.
    if (formData.price === undefined || formData.price === null ) {
      errors.price = "Price is required.";
    } else if (!priceRegex.test(String(formData.price))) {
      errors.price = "Invalid price format. Please enter a valid amount (e.g., 10.99).";
    } else if (Number(formData.price) <= 0) {
      errors.price = "Price must be a positive value greater than zero.";
    } else if (Number(formData.price) > 1000000) {
      errors.price = "Price exceeds the maximum allowable limit.";
    }

    // 5. QUANTITY
    // Necessity: Required, integer, at least 1.
    if (formData.quantity === undefined || formData.quantity === null || String(formData.quantity) === "") {
      errors.quantity = "Stock quantity is required.";
    } else if (!Number.isInteger(Number(formData.quantity))) {
      errors.quantity = "Quantity must be a whole number (no decimals).";
    } else if (Number(formData.quantity) < 1) {
      errors.quantity = "Quantity must be at least 1.";
    } else if (Number(formData.quantity) > 100000) {
      errors.quantity = "Quantity exceeds the maximum allowable stock limit.";
    }

   // ---------------------------------------------------------
    // REGEX DEFINITIONS
    // ---------------------------------------------------------
    // Allows Letters (a-z), Numbers (0-9), and Spaces. 
    // REJECTS: Special characters, punctuation, symbols (e.g. - , . @ #).
    const strictTextRegex = /^[a-zA-Z0-9\s]+$/; 
    
    // ---------------------------------------------------------
    // 6. USPs (Unique Selling Points)
    // ---------------------------------------------------------
    const validUsps = formData.usp.filter(u => u.trim());
    
    if (validUsps.length === 0) {
      errors.usp = "At least one USP is required.";
    }

    formData.usp.forEach((u, i) => {
      // Skip empty fields in the loop (handled by filter above), but validate if typed
      if (u.trim()) {
        if (!strictTextRegex.test(u)) {
          errors[`usp${i}`] = "Invalid format. Only letters and numbers are allowed (no special characters).";
        } else if (u.length > 200) {
          errors[`usp${i}`] = "Max 200 characters allowed.";
        }
      }
    });

    // ---------------------------------------------------------
    // 7. CATEGORIES
    // ---------------------------------------------------------
    const validCategories = formData.categories.filter(c => c.trim());
    
    if (validCategories.length === 0) {
      errors.categories = "At least one category is required.";
    }

    formData.categories.forEach((c, i) => {
      if (c.trim()) {
        if (!strictTextRegex.test(c)) {
          errors[`cat${i}`] = "Invalid format. Only letters and numbers are allowed.";
        } else if (c.length > 100) {
          errors[`cat${i}`] = "Max 100 characters allowed.";
        }
      }
    });

    // ---------------------------------------------------------
    // 8. SPECIFICATIONS
    // ---------------------------------------------------------
    specKeys.forEach((k, i) => {
      const val = specValues[i];

      // 1. Validation: If row is partially filled, demand the other half
      if (!k.trim() && val?.trim()) {
        errors[`specKey${i}`] = "Spec name required.";
      }
      if (k.trim() && !val?.trim()) {
        errors[`specVal${i}`] = "Spec value required.";
      }

      // 2. Validation: Strict Character Check (Only if text exists)
      if (k.trim() && !strictTextRegex.test(k)) {
        errors[`specKey${i}`] = "Invalid characters (letters & numbers only).";
      }
      if (val?.trim() && !strictTextRegex.test(val)) {
        errors[`specVal${i}`] = "Invalid characters (letters & numbers only).";
      }
    });

    // ---------------------------------------------------------
    // 9. ATTRIBUTES
    // ---------------------------------------------------------
    attrKeys.forEach((k, i) => {
      const val = attrValues[i];

      // 1. Validation: Completeness
      if (!k.trim() && val?.trim()) {
        errors[`attrKey${i}`] = "Attribute name required.";
      }
      if (k.trim() && !val?.trim()) {
        errors[`attrVal${i}`] = "Attribute value required.";
      }

      // 2. Validation: Strict Character Check
      if (k.trim() && !strictTextRegex.test(k)) {
        errors[`attrKey${i}`] = "Invalid characters (letters & numbers only).";
      }
      if (val?.trim() && !strictTextRegex.test(val)) {
        errors[`attrVal${i}`] = "Invalid characters (letters & numbers only).";
      }
    });

    // ---------------------------------------------------------
    // 10. IMAGES
    // ---------------------------------------------------------
    const nonEmptyImages = formData.imageUrls.filter(url => url.trim());
    
    if (nonEmptyImages.length === 0) {
      errors.images = "At least one image is required.";
    }

    formData.imageUrls.forEach((url, i) => {
      if (url.trim()) {
         if (!imageUrlRegex.test(url.trim())) {
          errors[`image${i}`] = "Invalid URL. Must be a direct link ending in jpg, png, or webp.";
        }
      }
    });

    // ---------------------------------------------------------
    // FINAL CHECK
    // ---------------------------------------------------------
    setFieldErrors(errors);

    // If "errors" object has keys, validation failed
    if (Object.keys(errors).length > 0) {
      return; 
    }

    // Proceed to Save Logic...
    console.log("Validation passed. Saving...");

    try {
      // Build specs/attributes maps
      const specs: Record<string, string> = {};
      specKeys.forEach((key, index) => {
        if (key && specValues[index]) specs[key] = specValues[index];
      });

      const attributes: Record<string, string> = {};
      attrKeys.forEach((key, index) => {
        if (key && attrValues[index]) attributes[key] = attrValues[index];
      });

      const payload: CreateProductPayload = {
        ...formData,
        categories: formData.categories.filter((c) => c),
        specs,
        attributes,
        imageUrls: formData.imageUrls.filter((url) => url),
      };

      // 1. If Relisting, Delete Old First
      if (editingId) {
        console.log("Relisting: Deleting old variant...");
        await ProductService.deleteInventory(
          editingId.id.toString(),
          editingId.variantId,
        );
      }

      // 2. Create New
      console.log("Creating new entry...");
      await ProductService.createProduct(payload);

      showToast.success(
        editingId
          ? "Product details updated successfully!"
          : "Product added successfully!",
      );

      resetForm();
      fetchProducts();
    } catch (e) {
      console.error("Operation failed", e);
      showToast.error("Failed to save product.");
    }
  };

  const handleDelete = async (productId: number, variantId?: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await ProductService.deleteInventory(
        productId.toString(),
        variantId || productId.toString(),
      );
      // alert("Offer removed successfully!"); // Optional
      fetchProducts();
    } catch (e) {
      console.error("Delete failed", e);
      showToast.error("Failed to delete offer");
    }
  };

  // --- Quick Edit Logic ---

  const handleEditPrice = async (
    productId: number,
    variantId: string,
    price: number,
    stock: number,
  ) => {
    try {
      await ProductService.updateInventory(
        productId.toString(),
        variantId,
        price,
        stock,
      );
      showToast.error("Inventory updated successfully!");
      fetchProducts();
    } catch (e) {
      console.error("Update failed", e);
      showToast.error("Failed to update inventory");
    }
  };

  const startEditing = (index: number) => {
    const newProducts = [...products];
    newProducts[index].editing = true;
    newProducts[index].newPrice = newProducts[index].lowestPrice;
    // ✅ FIXED: Pre-fill with current stock (totalMerchants) instead of 0
    newProducts[index].newStock = newProducts[index].totalMerchants;
    setProducts(newProducts);
  };

  const saveEdit = (index: number) => {
    const product = products[index];
    if (product.newPrice !== undefined && product.newStock !== undefined) {
      handleEditPrice(
        product.productId,
        product.variantId || product.productId.toString(),
        product.newPrice,
        product.newStock,
      );
    }
    const newProducts = [...products];
    newProducts[index].editing = false;
    setProducts(newProducts);
  };

  const cancelEdit = (index: number) => {
    const newProducts = [...products];
    newProducts[index].editing = false;
    setProducts(newProducts);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

      <button
        onClick={() => {
          if (showForm) resetForm();
          else setShowForm(true);
        }}
        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 mb-8 flex items-center gap-2"
      >
        {showForm ? <X size={20} /> : <Plus size={20} />}
        {showForm ? "Cancel" : "Add New Product"}
      </button>

      {showForm && (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 mb-8 space-y-6">

    <h2 className="text-2xl font-black uppercase tracking-widest">
      {editingId ? "Edit Product Details (Relist)" : "Add New Product"}
    </h2>

    {/* NAME + BRAND */}
    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setFieldErrors(prev => ({ ...prev, name: "" }));
          }}
          className={`w-full border rounded-lg px-4 py-3 ${
            fieldErrors.name ? "border-red-500" : "border-zinc-200"
          }`}
        />
        {fieldErrors.name && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Brand"
          value={formData.brand}
          onChange={(e) => {
            setFormData({ ...formData, brand: e.target.value });
            setFieldErrors(prev => ({ ...prev, brand: "" }));
          }}
          className={`w-full border rounded-lg px-4 py-3 ${
            fieldErrors.brand ? "border-red-500" : "border-zinc-200"
          }`}
        />
        {fieldErrors.brand && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.brand}</p>
        )}
      </div>

    </div>

    {/* DESCRIPTION */}
    <div>
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value });
          setFieldErrors(prev => ({ ...prev, description: "" }));
        }}
        className={`w-full border rounded-lg px-4 py-3 ${
          fieldErrors.description ? "border-red-500" : "border-zinc-200"
        }`}
      />
      {fieldErrors.description && (
        <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
      )}
    </div>

    {/* PRICE + QUANTITY */}
    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <input
          type="number"
          placeholder="Price"
          value={formData.price || ""}
          onChange={(e) => {
            setFormData({ ...formData, price: parseFloat(e.target.value) || 0 });
            setFieldErrors(prev => ({ ...prev, price: "" }));
          }}
          className={`w-full border rounded-lg px-4 py-3 ${
            fieldErrors.price ? "border-red-500" : "border-zinc-200"
          }`}
        />
        {fieldErrors.price && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
        )}
      </div>

      <div>
        <input
          type="number"
          placeholder="Quantity"
          value={formData.quantity || ""}
          onChange={(e) => {
            setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 });
            setFieldErrors(prev => ({ ...prev, quantity: "" }));
          }}
          className={`w-full border rounded-lg px-4 py-3 ${
            fieldErrors.quantity ? "border-red-500" : "border-zinc-200"
          }`}
        />
        {fieldErrors.quantity && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</p>
        )}
      </div>

    </div>

    {/* USP */}
    <div className="mb-6">
      <label className="font-bold text-sm block mb-1">USP</label>
      
      {/* Global USP Error (e.g. "At least one required") */}
      {fieldErrors.usp && (
        <p className="text-red-500 text-xs mb-2">{fieldErrors.usp}</p>
      )}

      {formData.usp.map((u, i) => (
        <div key={i} className="flex gap-2 mt-2 items-start">
          <div className="flex-1">
            <input
              value={u}
              onChange={(e) => {
                const copy = [...formData.usp];
                copy[i] = e.target.value;
                setFormData({ ...formData, usp: copy });
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                fieldErrors[`usp${i}`] ? "border-red-500 focus:outline-red-500" : "border-gray-300"
              }`}
              placeholder="Unique Selling Point"
            />
            {/* PER-ITEM ERROR */}
            {fieldErrors[`usp${i}`] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[`usp${i}`]}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                usp: formData.usp.filter((_, idx) => idx !== i),
              })
            }
            className="text-red-500 mt-2 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setFormData({ ...formData, usp: [...formData.usp, ""] })}
        className="text-blue-600 text-sm mt-2 hover:underline"
      >
        + Add USP
      </button>
    </div>
{/* ----------------- ATTRIBUTES SECTION ----------------- */}
    <div className="mb-6">
      <label className="font-bold text-sm block mb-1">Attributes</label>

      {attrKeys.map((key, i) => (
        <div key={i} className="flex gap-2 mt-2 items-start">
          
          {/* Attribute Key Input Wrapper */}
          <div className="flex-1">
            <input
              placeholder="Key (e.g. Material)"
              value={key}
              onChange={(e) => {
                const copy = [...attrKeys];
                copy[i] = e.target.value;
                setAttrKeys(copy);
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                fieldErrors[`attrKey${i}`] ? "border-red-500 focus:outline-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors[`attrKey${i}`] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[`attrKey${i}`]}</p>
            )}
          </div>

          {/* Attribute Value Input Wrapper */}
          <div className="flex-1">
            <input
              placeholder="Value (e.g. Cotton)"
              value={attrValues[i]}
              onChange={(e) => {
                const copy = [...attrValues];
                copy[i] = e.target.value;
                setAttrValues(copy);
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                fieldErrors[`attrVal${i}`] ? "border-red-500 focus:outline-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors[`attrVal${i}`] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[`attrVal${i}`]}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setAttrKeys(attrKeys.filter((_, idx) => idx !== i));
              setAttrValues(attrValues.filter((_, idx) => idx !== i));
            }}
            className="text-red-500 mt-2 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          setAttrKeys([...attrKeys, ""]);
          setAttrValues([...attrValues, ""]);
        }}
        className="text-blue-600 text-sm mt-2 hover:underline"
      >
        + Add Attribute
      </button>
    </div>

    {/* ----------------- CATEGORIES SECTION ----------------- */}
    <div className="mb-6">
      <label className="font-bold text-sm block mb-1">Categories</label>

      {/* Global Category Error */}
      {fieldErrors.categories && (
        <p className="text-red-500 text-xs mb-2">{fieldErrors.categories}</p>
      )}

      {formData.categories.map((c, i) => (
        <div key={i} className="flex gap-2 mt-2 items-start">
          <div className="flex-1">
            <input
              value={c}
              onChange={(e) => {
                const copy = [...formData.categories];
                copy[i] = e.target.value;
                setFormData({ ...formData, categories: copy });
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                fieldErrors[`cat${i}`] ? "border-red-500 focus:outline-red-500" : "border-gray-300"
              }`}
              placeholder="Category Name"
            />
            {/* PER-ITEM ERROR */}
            {fieldErrors[`cat${i}`] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[`cat${i}`]}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                categories: formData.categories.filter((_, idx) => idx !== i),
              })
            }
            className="text-red-500 mt-2 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setFormData({
            ...formData,
            categories: [...formData.categories, ""],
          })
        }
        className="text-blue-600 text-sm mt-2 hover:underline"
      >
        + Add Category
      </button>
    </div>

    {/* IMAGES */}
    <div className="mb-6">
      <label className="font-bold text-sm block mb-1">Images</label>

      {/* Global Image Error */}
      {fieldErrors.images && (
        <p className="text-red-500 text-xs mb-2">{fieldErrors.images}</p>
      )}

      {formData.imageUrls.map((url, i) => (
        <div key={i} className="flex gap-2 mt-2 items-start">
          <div className="flex-1">
            <input
              value={url}
              onChange={(e) => {
                const copy = [...formData.imageUrls];
                copy[i] = e.target.value;
                setFormData({ ...formData, imageUrls: copy });
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                fieldErrors[`image${i}`] ? "border-red-500 focus:outline-red-500" : "border-gray-300"
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {/* PER-ITEM ERROR */}
            {fieldErrors[`image${i}`] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[`image${i}`]}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                imageUrls: formData.imageUrls.filter((_, idx) => idx !== i),
              })
            }
            className="text-red-500 mt-2 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setFormData({
            ...formData,
            imageUrls: [...formData.imageUrls, ""],
          })
        }
        className="text-blue-600 text-sm mt-2 hover:underline"
      >
        + Add Image URL
      </button>
    </div>

    {/* SUBMIT */}
    <button
      onClick={handleSaveProduct}
      className="w-full bg-black text-white py-3 rounded-lg font-bold"
    >
      {editingId ? "Save Changes" : "Add Product"}
    </button>

  </div>
)}


      <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-black" />
            <p className="text-zinc-500 font-semibold">
              Loading your inventory...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={`${product.productId}-${JSON.stringify(product.attributes)}`}
              className="bg-white p-6 rounded-[2rem] border border-zinc-100 hover:shadow-lg transition-shadow relative"
            >
              {/* Image Section */}
              <div className="aspect-[4/3] bg-zinc-50 rounded-xl overflow-hidden mb-4 border border-zinc-100 p-4 flex items-center justify-center">
                <img
                  src={product.imageUrl || "/placeholder-image.png"}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
  if (e.currentTarget.src !== window.location.origin + "/placeholder-image.png") {
    e.currentTarget.src = "/placeholder-image.png";
  }
}}
                />
              </div>

              <h3 className="font-black text-lg mb-2">{product.name}</h3>
              <p className="text-zinc-500 text-sm mb-2">{product.brand}</p>

              {!product.editing && (
                <>
                  <p className="text-zinc-700 font-bold mb-1">
                    ${product.lowestPrice.toFixed(2)}
                  </p>
                  <p className="text-zinc-400 text-xs mb-4">
                    Stock: {product.totalMerchants}
                  </p>
                </>
              )}

              {product.editing ? (
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="New Price"
                    value={product.newPrice}
                    onChange={(e) => {
                      const newProducts = [...products];
                      newProducts[index].newPrice =
                        parseFloat(e.target.value) || 0;
                      setProducts(newProducts);
                    }}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="New Stock"
                    value={product.newStock}
                    onChange={(e) => {
                      const newProducts = [...products];
                      newProducts[index].newStock =
                        parseInt(e.target.value) || 0;
                      setProducts(newProducts);
                    }}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(index)}
                      className="bg-black text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-1 justify-center"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit(index)}
                      className="bg-zinc-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-1 justify-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenRelistForm(product)}
                    className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors w-full"
                  >
                    <FileEdit size={14} /> Edit Details
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(index)}
                      className="bg-black text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-1 justify-center"
                    >
                      <Edit3 size={12} /> Quick Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(product.productId, product.variantId)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-1 justify-center"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
