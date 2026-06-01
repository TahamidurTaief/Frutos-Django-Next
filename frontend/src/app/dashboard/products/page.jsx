"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Eye, Pencil, Trash2, X, Upload, Loader2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useModel } from "@/app/dashboard/_lib/useModel";
import SearchableSelect from "@/app/dashboard/_components/SearchableSelect";
import { productsService, brandsService, colorsService, sizesService, subcategoriesService, categoriesService, shopsService } from "@/app/dashboard/_lib/services";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";

const PAGE_SIZE = 20;

const columns = [
  { key: "thumbnail_url", label: "", sortable: false, render: (v) => v ? (
    <img src={v} alt="" className="w-8 h-8 rounded object-cover" />
  ) : (
    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-gray-400" /></div>
  )},
  { key: "name", label: "Name" },
  { key: "price", label: "Price", render: (v) => `৳${Number(v).toLocaleString()}` },
  { key: "discount_price", label: "Sale Price", render: (v) => v ? `৳${Number(v).toLocaleString()}` : "—" },
  { key: "stock", label: "Stock" },
  { key: "shop", label: "Shop", render: (v) => v?.name || "—" },
  { key: "category", label: "Category", render: (v) => v?.name || "—" },
  { key: "is_active", label: "Status", render: (v) => v ? "active" : "inactive", type: "status" },
];

// ── Product Form Component ──────────────────────────────────────
function ProductForm({ initialValues, onSubmit, submitLabel = "Save", categories, brands, colors: propColors, sizes: propSizes, subcategories, shops }) {
  const [form, setForm] = useState({
    name: "", slug: "", description: "",
    price: "", discount_price: "", wholesale_price: "", minimum_purchase: "", affiliate_commission_rate: "",
    stock: "", is_active: "true",
    weight: "", length: "", width: "", height: "",
    shop: "", brand: "", category: "", shipping_category: "",
    colors: [], sizes: [],
    ...initialValues,
    // Normalize nested objects to IDs
    shop: initialValues?.shop?.id || initialValues?.shop || "",
    brand: initialValues?.brand?.id || initialValues?.brand || "",
    category: initialValues?.category?.id || initialValues?.category || initialValues?.sub_category?.category || "",
    shipping_category: initialValues?.shipping_category?.id || initialValues?.shipping_category || "",
    colors: initialValues?.colors?.map(c => c.id || c) || [],
    sizes: initialValues?.sizes?.map(s => s.id || s) || [],
    is_active: String(initialValues?.is_active ?? true),
  });
  const [specs, setSpecs] = useState(initialValues?.specifications || []);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialValues?.thumbnail_url || "");
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false); // track explicit removal
  const [additionalImages, setAdditionalImages] = useState([]);
  // Existing images from the server (edit mode)
  const [existingImages, setExistingImages] = useState(initialValues?.additional_images || []);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPhysical, setShowPhysical] = useState(false);

  // Local colors/sizes lists (prop + inline-created)
  const [localColors, setLocalColors] = useState([]);
  const [localSizes, setLocalSizes] = useState([]);
  const colors = [...propColors, ...localColors];
  const sizes = [...propSizes, ...localSizes];

  // Quick-add color state
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [addingColor, setAddingColor] = useState(false);

  // Quick-add size state
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const [addingSize, setAddingSize] = useState(false);

  const handleAddColor = async () => {
    if (!newColorName.trim()) return;
    setAddingColor(true);
    try {
      const created = await colorsService.create({ name: newColorName.trim(), hex_code: newColorHex });
      const newItem = created?.id ? created : { id: created, name: newColorName.trim(), hex_code: newColorHex };
      setLocalColors(prev => [...prev, newItem]);
      setForm(prev => ({ ...prev, colors: [...prev.colors, newItem.id] }));
      setNewColorName("");
      setNewColorHex("#000000");
      setShowAddColor(false);
    } catch (e) {
      // ignore — color may already exist
    } finally { setAddingColor(false); }
  };

  const handleAddSize = async () => {
    if (!newSizeName.trim()) return;
    setAddingSize(true);
    try {
      const created = await sizesService.create({ name: newSizeName.trim() });
      const newItem = created?.id ? created : { id: created, name: newSizeName.trim() };
      setLocalSizes(prev => [...prev, newItem]);
      setForm(prev => ({ ...prev, sizes: [...prev.sizes, newItem.id] }));
      setNewSizeName("");
      setShowAddSize(false);
    } catch (e) {
      // ignore
    } finally { setAddingSize(false); }
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleMulti = (key, id) => {
    setForm(prev => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id] };
    });
  };

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setThumbnailRemoved(false);
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages(prev => [...prev, ...files]);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
    setRemoveImageIds(prev => [...prev, imgId]);
  };

  const addSpec = () => setSpecs(prev => [...prev, { name: "", value: "" }]);
  const updateSpec = (index, key, value) => setSpecs(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  const removeSpec = (index) => setSpecs(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || "",
        price: form.price,
        discount_price: form.discount_price || null,
        wholesale_price: form.wholesale_price || null,
        minimum_purchase: form.minimum_purchase || null,
        affiliate_commission_rate: "",
        stock: form.stock || 0,
        is_active: form.is_active === "true",
        weight: form.weight || null,
        length: form.length || null,
        width: form.width || null,
        height: form.height || null,
        shop: form.shop || null,
        brand: form.brand || null,
        category: form.category || null,
        shipping_category: form.shipping_category || null,
        colors: form.colors,
        sizes: form.sizes,
      };

      // If we have files OR images to remove OR thumbnail explicitly cleared, use FormData
      const needsFormData = thumbnail || additionalImages.length > 0 || removeImageIds.length > 0 || thumbnailRemoved;
      if (needsFormData) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          if (Array.isArray(v)) {
            v.forEach(item => fd.append(k, item));
          } else {
            fd.append(k, v);
          }
        });
        if (thumbnail) fd.append("thumbnail", thumbnail);
        // Signal thumbnail removal to backend (explicit null)
        if (thumbnailRemoved && !thumbnail) fd.append("thumbnail", "");
        additionalImages.forEach((file, i) => fd.append("additional_images", file));
        // Send IDs of existing images to remove
        removeImageIds.forEach(id => fd.append("remove_image_ids", id));
        // Add specs as JSON
        if (specs.filter(s => s.name && s.value).length > 0) {
          fd.append("specifications_json", JSON.stringify(specs.filter(s => s.name && s.value)));
        }
        await onSubmit(fd);
      } else {
        // JSON payload — strip null/undefined (same as FormData path) to avoid
        // "may not be null" validation errors on non-nullable FK fields.
        const cleanPayload = Object.fromEntries(
          Object.entries(payload).filter(([, v]) => {
            if (Array.isArray(v)) return true; // keep empty arrays for colors/sizes
            return v !== null && v !== undefined;
          })
        );
        if (specs.filter(s => s.name && s.value).length > 0) {
          cleanPayload.specifications = specs.filter(s => s.name && s.value);
        }
        await onSubmit(cleanPayload);
      }
    } catch (err) {
      // Extract meaningful field-level validation errors, not just the generic HTTP status
      let msg = "Something went wrong";
      if (err?.data) {
        const d = err.data;
        if (d.detail) {
          msg = d.detail;
        } else {
          // d may be { shop: ["msg"], name: ["msg"], ... }
          const parts = Object.entries(d).map(([field, errs]) => {
            const text = Array.isArray(errs) ? errs[0] : String(errs);
            return `${field.replace(/_/g, " ")}: ${text}`;
          });
          msg = parts.length ? parts.join(" · ") : (err.message || "Bad Request");
        }
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Product Information */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Product Information</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => handleChange("name", e.target.value)} required className={inputCls} placeholder="Product name" />
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input type="text" value={form.slug} onChange={e => handleChange("slug", e.target.value)} className={inputCls} placeholder="auto-generated" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Product description" />
        </div>
        <div>
          <label className={labelCls}>Thumbnail Image</label>
          <div className="flex items-start gap-3">
            {thumbnailPreview ? (
              <div className="relative w-20 h-20">
                <img src={thumbnailPreview} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                <button type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(""); setThumbnailRemoved(true); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Upload image</span>
              <input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
            </label>
          </div>
        </div>
      </fieldset>

      {/* Business Details */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Business Details</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Shop <span className="text-red-500">*</span></label>
            <SearchableSelect
              required
              value={form.shop}
              onChange={v => handleChange("shop", v)}
              placeholder="Select shop..."
              options={shops.map(s => ({ value: s.id, label: s.name }))}
            />
          </div>
          <div>
            <label className={labelCls}>Brand</label>
            <SearchableSelect
              value={form.brand}
              onChange={v => handleChange("brand", v)}
              placeholder="Select brand..."
              options={brands.map(b => ({ value: b.id, label: b.name }))}
            />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <SearchableSelect
              value={form.category}
              onChange={v => handleChange("category", v)}
              placeholder="Select category..."
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div>
            <label className={labelCls}>Shipping Category</label>
            <SearchableSelect
              value={form.shipping_category}
              onChange={v => handleChange("shipping_category", v)}
              placeholder="Select shipping category..."
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
          <div>
            <label className={labelCls}>Status <span className="text-red-500">*</span></label>
            <SearchableSelect
              required
              value={form.is_active}
              onChange={v => handleChange("is_active", v)}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
          </div>
        </div>
      </fieldset>

      {/* Pricing & Inventory */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Pricing & Inventory</legend>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Price (৳) <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" value={form.price} onChange={e => handleChange("price", e.target.value)} required className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Discount Price (৳)</label>
            <input type="number" step="0.01" value={form.discount_price} onChange={e => handleChange("discount_price", e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Wholesale Price (৳)</label>
            <input type="number" step="0.01" value={form.wholesale_price} onChange={e => handleChange("wholesale_price", e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Min Purchase Qty</label>
            <input type="number" value={form.minimum_purchase} onChange={e => handleChange("minimum_purchase", e.target.value)} className={inputCls} placeholder="1" />
          </div>
          <div>
            <label className={labelCls}>Affiliate Commission %</label>
            <input type="number" step="0.01" value={form.affiliate_commission_rate ?? ""} onChange={e => handleChange("affiliate_commission_rate", e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Stock <span className="text-red-500">*</span></label>
            <input type="number" value={form.stock} onChange={e => handleChange("stock", e.target.value)} required className={inputCls} placeholder="0" />
          </div>
        </div>
      </fieldset>

      {/* Physical Properties (collapsible) */}
      <fieldset>
        <button type="button" onClick={() => setShowPhysical(!showPhysical)} className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-1">
          Physical Properties {showPhysical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showPhysical && (
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input type="number" step="0.01" value={form.weight} onChange={e => handleChange("weight", e.target.value)} className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Length (cm)</label>
              <input type="number" step="0.01" value={form.length} onChange={e => handleChange("length", e.target.value)} className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Width (cm)</label>
              <input type="number" step="0.01" value={form.width} onChange={e => handleChange("width", e.target.value)} className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Height (cm)</label>
              <input type="number" step="0.01" value={form.height} onChange={e => handleChange("height", e.target.value)} className={inputCls} placeholder="0.00" />
            </div>
          </div>
        )}
      </fieldset>

      {/* Colors & Sizes */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Variants</legend>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Colors</label>
            <button type="button" onClick={() => setShowAddColor(v => !v)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> New Color
            </button>
          </div>
          {showAddColor && (
            <div className="flex items-center gap-2 mb-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <input
                type="text" value={newColorName} onChange={e => setNewColorName(e.target.value)}
                placeholder="Color name" className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" />
              <input
                type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)}
                className="w-8 h-7 rounded cursor-pointer border-0 p-0" title="Pick color" />
              <button type="button" onClick={handleAddColor} disabled={addingColor || !newColorName.trim()}
                className="px-2 py-1 text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded disabled:opacity-50">
                {addingColor ? "..." : "Add"}
              </button>
              <button type="button" onClick={() => setShowAddColor(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {colors.map(c => (
              <button key={c.id} type="button" onClick={() => toggleMulti("colors", c.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  form.colors.includes(c.id)
                    ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                }`}
              >
                {c.hex_code && <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex_code }} />}
                {c.name}
              </button>
            ))}
            {colors.length === 0 && <span className="text-xs text-gray-400">No colors available — add one above</span>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>Sizes</label>
            <button type="button" onClick={() => setShowAddSize(v => !v)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> New Size
            </button>
          </div>
          {showAddSize && (
            <div className="flex items-center gap-2 mb-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <input
                type="text" value={newSizeName} onChange={e => setNewSizeName(e.target.value)}
                placeholder="Size name (e.g., XL, 42)" className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" />
              <button type="button" onClick={handleAddSize} disabled={addingSize || !newSizeName.trim()}
                className="px-2 py-1 text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded disabled:opacity-50">
                {addingSize ? "..." : "Add"}
              </button>
              <button type="button" onClick={() => setShowAddSize(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {sizes.map(s => (
              <button key={s.id} type="button" onClick={() => toggleMulti("sizes", s.id)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  form.sizes.includes(s.id)
                    ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                }`}
              >
                {s.name}
              </button>
            ))}
            {sizes.length === 0 && <span className="text-xs text-gray-400">No sizes available — add one above</span>}
          </div>
        </div>
      </fieldset>

      {/* Specifications */}
      <fieldset className="space-y-3">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-medium uppercase tracking-wider text-gray-400">Specifications</legend>
          <button type="button" onClick={addSpec} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={spec.name} onChange={e => updateSpec(i, "name", e.target.value)} className={`${inputCls} flex-1`} placeholder="Spec name" />
            <input type="text" value={spec.value} onChange={e => updateSpec(i, "value", e.target.value)} className={`${inputCls} flex-1`} placeholder="Spec value" />
            <button type="button" onClick={() => removeSpec(i)} className="p-1.5 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </fieldset>

      {/* Additional Images */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">Additional Images</legend>
        <div className="flex flex-wrap gap-2">
          {/* Existing images from server (edit mode) */}
          {existingImages.map((img) => (
            <div key={img.id} className="relative w-16 h-16">
              <img src={img.image} alt="" className="w-16 h-16 rounded object-cover border border-gray-200 dark:border-gray-700" />
              <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {/* Newly added images */}
          {additionalImages.map((file, i) => (
            <div key={`new-${i}`} className="relative w-16 h-16">
              <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded object-cover border border-gray-200 dark:border-gray-700" />
              <button type="button" onClick={() => removeAdditionalImage(i)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          <label className="w-16 h-16 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Upload className="w-4 h-4 text-gray-400" />
            <input type="file" accept="image/*" multiple onChange={handleAdditionalImages} className="hidden" />
          </label>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-800">
        <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors">
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Product View Component ──────────────────────────────────────
function ProductView({ item }) {
  if (!item) return null;
  const Row = ({ label, value }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{String(value ?? "—")}</span>
    </div>
  );

  return (
    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* Thumbnail */}
      {item.thumbnail_url && (
        <img src={item.thumbnail_url} alt={item.name} className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
      )}

      {/* Basic Info */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Product Information</h4>
        <Row label="Name" value={item.name} />
        <Row label="Slug" value={item.slug} />
        <Row label="Status" value={item.is_active ? "Active" : "Inactive"} />
        <Row label="Shop" value={item.shop?.name} />
        <Row label="Brand" value={item.brand?.name} />
        <Row label="Category" value={item.category?.name || item.sub_category?.name} />
        <Row label="Shipping Category" value={item.shipping_category?.name} />
      </div>

      {/* Pricing */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Pricing & Inventory</h4>
        <Row label="Price" value={`৳${Number(item.price).toLocaleString()}`} />
        <Row label="Discount Price" value={item.discount_price ? `৳${Number(item.discount_price).toLocaleString()}` : "—"} />
        <Row label="Wholesale Price" value={item.wholesale_price ? `৳${Number(item.wholesale_price).toLocaleString()}` : "—"} />
        <Row label="Min Purchase" value={item.minimum_purchase || "—"} />
        <Row label="Commission %" value={item.affiliate_commission_rate || "—"} />
        <Row label="Stock" value={item.stock} />
      </div>

      {/* Physical */}
      {(item.weight || item.length || item.width || item.height) && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Physical Properties</h4>
          <Row label="Weight" value={item.weight ? `${item.weight} kg` : "—"} />
          <Row label="Dimensions" value={[item.length, item.width, item.height].filter(Boolean).join(" × ") || "—"} />
        </div>
      )}

      {/* Colors & Sizes */}
      {(item.colors?.length > 0 || item.sizes?.length > 0) && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Variants</h4>
          {item.colors?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-xs text-gray-500 mr-1">Colors:</span>
              {item.colors.map(c => (
                <span key={c.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {c.hex_code && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex_code }} />}
                  {c.name}
                </span>
              ))}
            </div>
          )}
          {item.sizes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-500 mr-1">Sizes:</span>
              {item.sizes.map(s => (
                <span key={s.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{s.name}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Specifications */}
      {item.specifications?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Specifications</h4>
          {item.specifications.map((spec, i) => (
            <Row key={i} label={spec.name} value={spec.value} />
          ))}
        </div>
      )}

      {/* Additional Images */}
      {item.additional_images?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Additional Images</h4>
          <div className="flex flex-wrap gap-2">
            {item.additional_images.map((img, i) => (
              <img key={i} src={img.image} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Meta</h4>
        <Row label="Rating" value={item.rating ? `${Number(item.rating).toFixed(1)} (${item.review_count} reviews)` : "No reviews"} />
        <Row label="Created" value={item.created_at ? new Date(item.created_at).toLocaleString() : "—"} />
        <Row label="Updated" value={item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"} />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ProductsPage() {
  const toast = useToastContext();
  const { data, loading, totalCount, params, setSearch, setPage, create, update, remove } = useModel(productsService, {
    defaultParams: { page: 1, page_size: PAGE_SIZE },
    onSuccess: (msg) => toast.success(msg),
    onError: (err) => toast.error(err?.message || "Operation failed"),
  });

  // Fetch reference data for forms
  const { data: brandsRaw } = useSWR("ref-brands", () => brandsService.list({ page_size: 200 }), { revalidateOnFocus: false });
  const { data: colorsRaw } = useSWR("ref-colors", () => colorsService.list({ page_size: 200 }), { revalidateOnFocus: false });
  const { data: sizesRaw } = useSWR("ref-sizes", () => sizesService.list({ page_size: 200 }), { revalidateOnFocus: false });
  const { data: categoriesRaw } = useSWR("ref-categories", () => categoriesService.list({ page_size: 200 }), { revalidateOnFocus: false });
  const { data: shopsRaw } = useSWR("ref-shops", () => shopsService.list({ page_size: 200 }), { revalidateOnFocus: false });

  const brands = brandsRaw?.results || (Array.isArray(brandsRaw) ? brandsRaw : []);
  const colors = colorsRaw?.results || (Array.isArray(colorsRaw) ? colorsRaw : []);
  const sizes = sizesRaw?.results || (Array.isArray(sizesRaw) ? sizesRaw : []);
  const categories = categoriesRaw?.results || (Array.isArray(categoriesRaw) ? categoriesRaw : []);
  const shops = shopsRaw?.results || (Array.isArray(shopsRaw) ? shopsRaw : []);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleCreate = async (payload) => {
    await create(payload);
    setCreateOpen(false);
  };

  const handleEdit = async (payload) => {
    await update(editItem.slug || editItem.id, payload);
    setEditItem(null);
  };

  const handleDelete = async () => {
    await remove(deleteItem.slug || deleteItem.id);
    setDeleteItem(null);
  };

  const formProps = { categories, brands, colors, sizes, shops };

  return (
    <Container
      title="Products"
      description="Manage your product catalog"
      actions={
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        serverSide
        totalItems={totalCount}
        currentPage={params.page || 1}
        pageSize={PAGE_SIZE}
        onSearch={setSearch}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        searchable
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => setViewItem(row)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Eye className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditItem(row)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        )}
      />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Product" maxWidth="max-w-4xl">
        <ProductForm onSubmit={handleCreate} submitLabel="Create Product" {...formProps} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Product" maxWidth="max-w-4xl">
        {editItem && <ProductForm initialValues={editItem} onSubmit={handleEdit} submitLabel="Save Changes" {...formProps} />}
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Product Details" maxWidth="max-w-4xl">
        <ProductView item={viewItem} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />


    </Container>
  );
}
