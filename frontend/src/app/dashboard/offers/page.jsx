"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Upload, X, ImageIcon, Tag, Package, AlertCircle, CheckCircle2, Eye, Calendar, CalendarDays, Search, Settings, Percent } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useModel } from "@/app/dashboard/_lib/useModel";
import SearchableSelect from "@/app/dashboard/_components/SearchableSelect";
import { offersService, productsService } from "@/app/dashboard/_lib/services";

const PAGE_SIZE = 20;

const inp = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition-all";
const lbl = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

// ─── Offer View Modal ────────────────────────────────────────────────────────
function OfferViewModal({ open, offer, onClose }) {
  if (!open || !offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Eye size={17} className="text-indigo-600" />
            </div>
            <p className="font-bold text-slate-800">Offer Details</p>
          </div>
          <button style={{cursor: 'pointer'}} onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Banner & Title */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {(offer.banner_image_url || offer.banner_image) ? (
                <img src={offer.banner_image_url || offer.banner_image} className="w-full h-full object-cover" alt="Banner" />
              ) : (
                <ImageIcon size={32} className="text-slate-300" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{offer.title}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${offer.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">Slug: {offer.slug}</span>
              </div>
            </div>
          </div>

          <p className="text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed">
            {offer.description || "No description provided."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <CalendarDays size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Start Date</p>
                <p className="text-sm font-semibold text-slate-800">{offer.start_date ? new Date(offer.start_date).toLocaleString() : "Not set"}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">End Date</p>
                <p className="text-sm font-semibold text-slate-800">{offer.end_date ? new Date(offer.end_date).toLocaleString() : "Not set"}</p>
              </div>
            </div>
          </div>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden">
             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Package size={14} /> Products in Offer ({offer.items?.length || 0})</h4>
             </div>
             <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
               {offer.items?.length > 0 ? (
                 offer.items.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                     <span className="text-sm font-semibold text-slate-800">{item.product?.name || item.product_name || "Unknown Product"}</span>
                     <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">€{parseFloat(item.offer_price || 0).toFixed(2)}</span>
                   </div>
                 ))
               ) : (
                 <div className="p-4 text-center text-sm text-slate-400">No products included in this offer.</div>
               )}
             </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button style={{cursor: 'pointer'}} onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm">Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── Product Info Card in Search Dropdown ────────────────────────────────────
function ProductDropdownItem({ product, onClick, alreadyAdded }) {
  const imgUrl = product.thumbnail_url || product.images?.[0]?.image || product.thumbnail || product.image;
  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const stock = product.stock || 0;
  const inStock = stock > 0;

  return (
    <div
      onClick={alreadyAdded ? undefined : onClick}
      className={`p-3 border-b last:border-b-0 flex items-center gap-3 transition-colors ${
        alreadyAdded
          ? "cursor-default opacity-60 bg-slate-50"
          : "cursor-pointer hover:bg-emerald-50"
      }`}
    >
      {/* Product Image */}
      <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
        {imgUrl ? (
          <img src={imgUrl} className="w-full h-full object-cover" alt={product.name} />
        ) : (
          <ImageIcon className="w-6 h-6 text-slate-400" />
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{product.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {product.category?.name && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                  <Tag className="w-2.5 h-2.5" /> {product.category.name}
                </span>
              )}
              {product.brand?.name && (
                <span className="text-[10px] text-slate-400">{product.brand.name}</span>
              )}
            </div>
          </div>

          {/* Stock & Added Badge */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {alreadyAdded ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Added
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                inStock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}>
                <Package className="w-3 h-3" />
                {inStock ? `${stock} in stock` : "Out of stock"}
              </span>
            )}
          </div>
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1.5">
          {discountPrice ? (
            <>
              <span className="text-sm font-bold text-amber-600">€{discountPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-400 line-through">€{price.toFixed(2)}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold">
                -{Math.round(((price - discountPrice) / price) * 100)}%
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-800">€{price.toFixed(2)}</span>
          )}
          {product.unit && (
            <span className="text-[10px] text-slate-400">/ {product.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Selected Product Row ─────────────────────────────────────────────────────
function SelectedProductRow({ item, idx, onRemove, onUpdatePrice }) {
  const prod = item.product || {};
  const imgUrl = prod.thumbnail_url || prod.images?.[0]?.image || prod.thumbnail || prod.image;
  const origPrice = parseFloat(prod.price || 0);
  const offerPrice = parseFloat(item.offer_price || 0);
  const savings = origPrice > 0 && offerPrice > 0 ? ((origPrice - offerPrice) / origPrice * 100).toFixed(0) : null;

  return (
    <div className="p-3 grid items-center gap-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors" style={{ gridTemplateColumns: "48px 1fr 100px 130px 36px" }}>
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
        {imgUrl ? (
          <img src={imgUrl} className="w-full h-full object-cover" alt={prod.name} />
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="min-w-0 flex flex-col justify-center">
        <div className="text-sm font-bold text-slate-800 truncate leading-tight mb-1">{prod.name || "—"}</div>
        {savings && parseFloat(savings) > 0 && (
          <div className="inline-flex items-center gap-1 w-fit">
            <span className="text-[10px] px-1.5 py-0.5 bg-green-100/80 text-green-700 border border-green-200/50 rounded-md font-bold flex items-center gap-0.5">
              <Percent className="w-3 h-3" /> {savings}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Original Price */}
      <div className="text-sm font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/60 px-3 py-1.5 rounded-lg text-center truncate">
        €{prod.price || item.old_price || "0.00"}
      </div>

      {/* Offer Price Input */}
      <div>
        <div className="relative">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/80 font-bold">€</span>
           <input
             type="number"
             step="0.01"
             min="0"
             className={`${inp} pl-7 py-2 border-amber-200 focus:ring-amber-500/30 focus:border-amber-500 text-amber-700 font-bold bg-amber-50/50`}
             value={item.offer_price}
             onChange={e => onUpdatePrice(idx, e.target.value)}
             required
             placeholder="0.00"
           />
        </div>
      </div>

      {/* Remove */}
      <div className="flex justify-center">
        <button style={{cursor: 'pointer'}}
          type="button"
          onClick={() => onRemove(idx)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Offer Form ───────────────────────────────────────────────────────────────
function OfferForm({ initial = {}, onSubmit, submitLabel = "Save" }) {
  const [title, setTitle] = useState(initial.title || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [description, setDescription] = useState(initial.description || "");
  const [isActive, setIsActive] = useState(String(initial.is_active ?? true));
  const [startDate, setStartDate] = useState(initial.start_date || "");
  const [endDate, setEndDate] = useState(initial.end_date || "");

  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(initial.banner_image_url || initial.banner_image || "");
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState(initial.items || []);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBanner = (e) => {
    const f = e.target.files?.[0];
    if (f) { setBanner(f); setPreview(URL.createObjectURL(f)); }
  };

  const searchProducts = async (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await productsService.list({ search: q, page_size: 8 });
      setSearchResults(res.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const isAlreadyAdded = (productId) => {
    return items.some(i => (i.product?.id || i.product_id || i.id) === productId);
  };

  const addProduct = (product) => {
    if (!isAlreadyAdded(product.id)) {
      // Use discount price if available, otherwise regular price
      const offerPrice = product.discount_price
        ? parseFloat(product.discount_price)
        : parseFloat(product.price || 0);
      setItems([...items, { product, offer_price: offerPrice }]);
    }
    setSearch("");
    setSearchResults([]);
  };

  const removeProduct = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const updatePrice = (idx, price) => {
    const newItems = [...items];
    newItems[idx].offer_price = price;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      if (slug) fd.append("slug", slug);
      if (description) fd.append("description", description);
      fd.append("is_active", isActive === "true");
      if (startDate) fd.append("start_date", startDate);
      if (endDate) fd.append("end_date", endDate);
      if (banner) fd.append("banner_image", banner);

      const itemsPayload = items.map(item => ({
        product_id: item.product?.id || item.product_id || item.id,
        offer_price: item.offer_price
      }));
      fd.append("items_data", JSON.stringify(itemsPayload));

      await onSubmit(fd);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ── Offer Details Card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
             <Settings className="w-4 h-4 text-slate-400" /> Offer Details
          </h3>
          
          <div><label className={lbl}>Offer Title *</label><input required className={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Summer Special" /></div>
          
          <div className="grid grid-cols-2 gap-5">
            <div><label className={lbl}>Slug (Optional)</label><input className={inp} value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" /></div>
            <div>
              <label className={lbl}>Status</label>
              <SearchableSelect
                value={isActive}
                onChange={setIsActive}
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div><label className={lbl}>Start Date</label><input type="datetime-local" className={`${inp} cursor-pointer`} value={startDate ? startDate.slice(0, 16) : ""} onChange={e => setStartDate(e.target.value)} /></div>
            <div><label className={lbl}>End Date</label><input type="datetime-local" className={`${inp} cursor-pointer`} value={endDate ? endDate.slice(0, 16) : ""} onChange={e => setEndDate(e.target.value)} /></div>
          </div>

          <div><label className={lbl}>Description</label><textarea rows={3} className={inp + " resize-none"} value={description} onChange={e => setDescription(e.target.value)} placeholder="Offer description details..." /></div>

          {/* Banner Upload */}
          <div>
            <label className={lbl}>Banner Image</label>
            <div className="flex flex-col mt-2">
              {preview ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm shrink-0">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button style={{cursor: 'pointer'}} type="button" onClick={() => { setBanner(null); setPreview(""); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 text-red-500 hover:text-red-600 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">Upload Banner Image</span>
                  <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ── Products in Offer Card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[500px] max-h-[600px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Package className="w-4 h-4 text-slate-400" /> Products in Offer
            </h3>
            {items.length > 0 && (
              <span className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold uppercase tracking-wide">
                {items.length} Selected
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative mb-4 shrink-0">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name to add..."
              className={`${inp} pl-10 bg-slate-50/50 border-slate-200`}
              value={search}
              onChange={e => searchProducts(e.target.value)}
              autoComplete="off"
            />

            {/* Dropdown */}
            {search && (
              <div className="absolute z-20 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm font-semibold text-slate-500">
                    <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <ProductDropdownItem
                      key={p.id}
                      product={p}
                      alreadyAdded={isAlreadyAdded(p.id)}
                      onClick={() => addProduct(p)}
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 font-medium">
                    No products found for &quot;{search}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Products Table */}
          <div className="flex-1 overflow-hidden flex flex-col border border-slate-200 rounded-xl bg-slate-50/50">
            {items.length > 0 ? (
              <>
                <div className="bg-slate-100/80 px-3 py-2 grid gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 shrink-0"
                  style={{ gridTemplateColumns: "48px 1fr 100px 130px 36px" }}>
                  <div></div>
                  <div>Product Details</div>
                  <div className="text-center">Orig Price</div>
                  <div className="text-center">Offer Price</div>
                  <div></div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <SelectedProductRow
                      key={idx}
                      item={item}
                      idx={idx}
                      onRemove={removeProduct}
                      onUpdatePrice={updatePrice}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-200">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-600">No products added yet</p>
                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px]">Search above to add specific products to this offer.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-5 mt-6 border-t border-slate-200">
        <button style={{cursor: 'pointer'}} type="submit" disabled={submitting} className="px-8 py-3 text-sm font-black tracking-wide bg-[#00694C] text-white rounded-xl hover:bg-[#085041] disabled:opacity-50 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto">
          {submitting ? "SAVING..." : submitLabel.toUpperCase()}
        </button>
      </div>
    </form>
  );
}


export default function OffersPage() {
  const toast = useToastContext();
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [viewModal, setViewModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });

  const offers = useModel(offersService, {
    defaultParams: { page_size: PAGE_SIZE, page: 1 },
    paginated: true,
    onSuccess: (m) => { toast.success(m); setModal({ open: false, mode: "create", item: null }); },
    onError: (e) => toast.error(e?.message || "Operation failed"),
  });

  const columns = [
    { key: "banner_image_url", label: "Banner", sortable: false, render: (v, row) => {
      const src = v || row.banner_image;
      return src
        ? <img src={src} alt="" className="w-16 h-8 rounded object-cover border cursor-pointer" />
        : <div className="w-16 h-8 rounded bg-slate-100 flex items-center justify-center border border-dashed border-gray-300 cursor-pointer"><span className="text-xs text-slate-400">No Img</span></div>;
    }},
    { key: "title", label: "Offer Title", render: (v) => <span className="font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors">{v}</span> },
    { key: "start_date", label: "Start Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    { key: "end_date", label: "End Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
    { key: "is_active", label: "Status", render: (v) => <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{v ? "Active" : "Inactive"}</span> },
  ];

  const handleSave = async (data) => {
    if (modal.mode === "edit") {
      await offers.patch(modal.item.slug, data);
    } else {
      await offers.create(data);
    }
  };

  const handleDelete = async () => {
    try {
      await offers.remove(confirm.item.slug);
      setConfirm({ open: false, item: null });
    } catch (_) {}
  };

  const actions = (row) => (
    <div className="flex items-center gap-1">
      <button style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setViewModal({ open: true, item: row }); }} className="p-1.5 rounded-md hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
      <button style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setModal({ open: true, mode: "edit", item: row }); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"><Pencil className="w-4 h-4" /></button>
      <button style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, item: row }); }} className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  );

  return (
    <Container title="Offers & Promotions" description="Manage special offers, banners, and their active dates">
      <div className="flex items-center justify-end mb-4">
        <button style={{cursor: 'pointer'}} onClick={() => setModal({ open: true, mode: "create", item: null })} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#00694C] text-white rounded-xl hover:bg-[#085041] shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      <DataTable
        key="offers"
        columns={columns}
        data={offers.data}
        loading={offers.loading}
        actions={actions}
        serverSide
        totalItems={offers.totalCount}
        currentPage={offers.params.page || 1}
        pageSize={PAGE_SIZE}
        onSearch={(q) => { offers.setSearch(q); offers.setPage(1); }}
        onPageChange={offers.setPage}
        onRowClick={(row) => setViewModal({ open: true, item: row })}
        searchable
        emptyMessage="No offers found"
      />

      <Modal open={modal.open} onClose={() => setModal({ open: false, mode: "create", item: null })} title={`${modal.mode === "edit" ? "Edit" : "Add"} Offer`} maxWidth="max-w-5xl">
        <OfferForm initial={modal.mode === "edit" ? modal.item : {}} onSubmit={handleSave} submitLabel={modal.mode === "edit" ? "Update" : "Create"} />
      </Modal>

      <ConfirmDialog open={confirm.open} onClose={() => setConfirm({ open: false, item: null })} onConfirm={handleDelete} title="Delete Offer" message={`Are you sure you want to delete "${confirm.item?.title}"? This action cannot be undone.`} />
      
      <OfferViewModal open={viewModal.open} offer={viewModal.item} onClose={() => setViewModal({ open: false, item: null })} />
    </Container>
  );
}

