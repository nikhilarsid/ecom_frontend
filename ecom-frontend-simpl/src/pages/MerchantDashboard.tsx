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

interface InventoryItem extends ProductListItem {
  editing?: boolean;
  newPrice?: number;
  newStock?: number;
  // Ensure these match what the service provides
  usp?: string[];
  specs?: Record<string, string>;
  attributes?: Record<string, string>;
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
    const aVals = product.attributes
      ? Object.values(product.attributes)
      : [""];

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
      quantity: product.totalMerchants, // Using totalMerchants as Stock count based on service logic
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

  // 🆕 UPDATED: Handles both Add and Relist (Delete + Add)
  const handleSaveProduct = async () => {
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
          editingId.variantId
        );
      }

      // 2. Create New
      console.log("Creating new entry...");
      await ProductService.createProduct(payload);

      alert(
        editingId
          ? "Product details updated successfully!"
          : "Product added successfully!"
      );

      resetForm();
      fetchProducts();
    } catch (e) {
      console.error("Operation failed", e);
      alert("Failed to save product.");
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
      alert("Failed to delete offer");
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
      alert("Inventory updated successfully!");
      fetchProducts();
    } catch (e) {
      console.error("Update failed", e);
      alert("Failed to update inventory");
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 mb-8">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-widest">
            {editingId ? "Edit Product Details (Relist)" : "Add New Product"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="e.g. iPhone 15 Pro Max"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition-colors"
            />
            <input
              type="text"
              placeholder="e.g. Apple"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <textarea
            placeholder="e.g. The latest flagship smartphone with advanced features..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-zinc-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-black transition-colors"
            rows={3}
          />

          {/* USP Section */}
<div className="mb-6">
  <label className="block font-black text-sm uppercase tracking-widest text-zinc-600 mb-3">
    Unique Selling Points (USP)
  </label>
  {formData.usp.map((point, index) => (
    <div key={index} className="flex gap-2 mb-2">
      <input
        type="text"
        placeholder="e.g. 24-hour battery life"
        value={point}
        onChange={(e) => {
          const newUsps = [...formData.usp];
          newUsps[index] = e.target.value;
          setFormData({ ...formData, usp: newUsps });
        }}
        className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
      />
      <button
        onClick={() =>
          setFormData({
            ...formData,
            usp: formData.usp.filter((_, i) => i !== index),
          })
        }
        className="text-red-500 font-semibold hover:text-red-700"
      >
        Remove
      </button>
    </div>
  ))}
  <button
    onClick={() =>
      setFormData({
        ...formData,
        usp: [...formData.usp, ""],
      })
    }
    className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
  >
    + Add USP
  </button>
</div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block font-black text-sm uppercase tracking-widest text-zinc-600 mb-3">
              Categories
            </label>
            {formData.categories.map((cat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Electronics, Mobile Phones"
                  value={cat}
                  onChange={(e) => {
                    const newCats = [...formData.categories];
                    newCats[index] = e.target.value;
                    setFormData({ ...formData, categories: newCats });
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      categories: formData.categories.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  categories: [...formData.categories, ""],
                })
              }
              className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
            >
              + Add Category
            </button>
          </div>

          {/* Specs */}
          <div className="mb-6">
            <label className="block font-black text-sm uppercase tracking-widest text-zinc-600 mb-3">
              Specifications
            </label>
            {specKeys.map((key, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Screen Size"
                  value={key}
                  onChange={(e) => {
                    const newKeys = [...specKeys];
                    newKeys[index] = e.target.value;
                    setSpecKeys(newKeys);
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <input
                  type="text"
                  placeholder="e.g. 6.7 inches"
                  value={specValues[index]}
                  onChange={(e) => {
                    const newValues = [...specValues];
                    newValues[index] = e.target.value;
                    setSpecValues(newValues);
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={() => {
                    setSpecKeys(specKeys.filter((_, i) => i !== index));
                    setSpecValues(specValues.filter((_, i) => i !== index));
                  }}
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setSpecKeys([...specKeys, ""]);
                setSpecValues([...specValues, ""]);
              }}
              className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
            >
              + Add Spec
            </button>
          </div>

          {/* Attributes */}
          <div className="mb-6">
            <label className="block font-black text-sm uppercase tracking-widest text-zinc-600 mb-3">
              Attributes
            </label>
            {attrKeys.map((key, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Color"
                  value={key}
                  onChange={(e) => {
                    const newKeys = [...attrKeys];
                    newKeys[index] = e.target.value;
                    setAttrKeys(newKeys);
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <input
                  type="text"
                  placeholder="e.g. Black"
                  value={attrValues[index]}
                  onChange={(e) => {
                    const newValues = [...attrValues];
                    newValues[index] = e.target.value;
                    setAttrValues(newValues);
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={() => {
                    setAttrKeys(attrKeys.filter((_, i) => i !== index));
                    setAttrValues(attrValues.filter((_, i) => i !== index));
                  }}
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setAttrKeys([...attrKeys, ""]);
                setAttrValues([...attrValues, ""]);
              }}
              className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
            >
              + Add Attribute
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="number"
              placeholder="Price"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition-colors"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 0,
                })
              }
              className="border border-zinc-200 rounded-lg px-4 py-3 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Image URLs */}
          <div className="mb-6">
            <label className="block font-black text-sm uppercase tracking-widest text-zinc-600 mb-3">
              Image URLs
            </label>
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...formData.imageUrls];
                    newUrls[index] = e.target.value;
                    setFormData({ ...formData, imageUrls: newUrls });
                  }}
                  className="flex-1 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      imageUrls: formData.imageUrls.filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setFormData({
                  ...formData,
                  imageUrls: [...formData.imageUrls, ""],
                })
              }
              className="text-blue-600 font-semibold hover:text-blue-800 text-sm"
            >
              + Add Image URL
            </button>
          </div>

          <button
            onClick={handleSaveProduct}
            className="w-full bg-black text-white px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
          >
            {editingId ? "Save Changes (Relist)" : "Add Product"}
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
                    e.currentTarget.src = "/placeholder-image.png";
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