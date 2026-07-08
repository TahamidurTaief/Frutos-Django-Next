"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import api from "@/app/dashboard/_lib/api";
import { Loader2, Package, Plus, Pencil, Trash2, Eye, Filter, ChevronDown, Check } from "lucide-react";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import ProductForm from "@/app/dashboard/_components/ProductForm";
import ProductView from "@/app/dashboard/_components/ProductView";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import {
  brandsService, colorsService, sizesService,
  subcategoriesService, categoriesService, storesService, siteSettingsService
} from "@/app/dashboard/_lib/services";

const getColumns = (totalStores) => [
  { key: "thumbnail_url", label: "PHOTO", sortable: false, render: (v) => v ? (
    <img src={v} alt="" className="w-8 h-8 rounded object-cover" />
  ) : (
    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
      <Package className="w-3.5 h-3.5 text-slate-400" />
    </div>
  )},
  { key: "name",           label: "Name" },
  { key: "price",          label: "Price",      render: (v) => `€${Number(v).toLocaleString()}` },
  { key: "discount_price", label: "Sale Price",  render: (v) => v ? `€${Number(v).toLocaleString()}` : "—" },
  { key: "stock",          label: "Stock" },
  { key: "stores",         label: "Store",      render: (v) => (v && v.length > 0) ? (totalStores > 0 && v.length === totalStores ? "All" : `${v.length} store${v.length > 1 ? 's' : ''}`) : "—" },
  { key: "category",       label: "Category",   render: (v) => v?.name || "—" },
  { key: "is_active",      label: "Status",     render: (v) => v ? "active" : "inactive", type: "status" },
];

export default function StaffProducts({ profile }) {
  const toast = useToastContext();

  const { data: rawData, isLoading, error, mutate } = useSWR(
    "/api/products/products/?page_size=500",
    (url) => api.get(url),
    { revalidateOnFocus: false }
  );

  const { data: brandsRaw }      = useSWR("ref-brands",      () => brandsService.list({ page_size: 200 }),      { revalidateOnFocus: false });
  const { data: colorsRaw }      = useSWR("ref-colors",      () => colorsService.list({ page_size: 200 }),      { revalidateOnFocus: false });
  const { data: sizesRaw }       = useSWR("ref-sizes",       () => sizesService.list({ page_size: 200 }),       { revalidateOnFocus: false });
  const { data: categoriesRaw }  = useSWR("ref-categories",  () => categoriesService.list({ page_size: 200 }),  { revalidateOnFocus: false });
  const { data: subcatsRaw }     = useSWR("ref-subcats",     () => subcategoriesService.list({ page_size: 200 }), { revalidateOnFocus: false });
  const { data: storesRaw }      = useSWR("ref-stores",      () => storesService.list({ page_size: 200 }),      { revalidateOnFocus: false });
  const { data: catalogSettingsRaw } = useSWR("site-settings-catalog", () => siteSettingsService.list({ group: "catalog" }), { revalidateOnFocus: false });

  const brands       = brandsRaw?.results      || (Array.isArray(brandsRaw)      ? brandsRaw      : []);
  const colors       = colorsRaw?.results      || (Array.isArray(colorsRaw)      ? colorsRaw      : []);
  const sizes        = sizesRaw?.results       || (Array.isArray(sizesRaw)       ? sizesRaw       : []);
  const categories   = categoriesRaw?.results  || (Array.isArray(categoriesRaw)  ? categoriesRaw  : []);
  const subcategories= subcatsRaw?.results     || (Array.isArray(subcatsRaw)     ? subcatsRaw     : []);
  const stores       = storesRaw?.results      || (Array.isArray(storesRaw)      ? storesRaw      : []);
  const catalogSettings = catalogSettingsRaw?.results || (Array.isArray(catalogSettingsRaw) ? catalogSettingsRaw : []);
  
  const productClassesStr = catalogSettings.find(s => s.key === 'product_classes')?.value || "";
  const productClasses = productClassesStr.split(',').map(s => s.trim()).filter(Boolean);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewItem,   setViewItem]   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formProps = { categories, brands, colors, sizes, subcategories, stores, productClasses };

  let data = Array.isArray(rawData) ? rawData : (rawData?.results || []);
  if (selectedCategory) {
    data = data.filter(item => item.category?.id === Number(selectedCategory));
  }

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => String(c.id) === String(selectedCategory))?.name 
    : "All Categories";

  const categoryFilter = (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#00694C]/20 focus:border-[#00694C] transition-all cursor-pointer min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>{selectedCategoryName}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>

      {isFilterOpen && (
        <div className="absolute left-0 z-50 w-56 mt-2 origin-top-left bg-white border border-slate-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1.5 max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                setSelectedCategory("");
                setIsFilterOpen(false);
              }}
              className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
                !selectedCategory ? 'bg-[#00694C]/10 text-[#00694C] font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex-1 text-left">All Categories</span>
              {!selectedCategory && <Check className="w-4 h-4 text-[#00694C]" />}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(String(c.id));
                  setIsFilterOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
                  String(selectedCategory) === String(c.id) ? 'bg-[#00694C]/10 text-[#00694C] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex-1 text-left">{c.name}</span>
                {String(selectedCategory) === String(c.id) && <Check className="w-4 h-4 text-[#00694C]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleCreate = async (payload) => {
    try {
      await api.post("/api/products/products/", payload);
      toast.success("Product created successfully");
      setCreateOpen(false);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to create product");
    }
  };

  const handleEdit = async (payload) => {
    try {
      await api.patch(`/api/products/products/${editItem.slug || editItem.id}/`, payload);
      toast.success("Product updated successfully");
      setEditItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/products/products/${deleteItem.slug || deleteItem.id}/`);
      toast.success("Product deleted successfully");
      setDeleteItem(null);
      mutate();
    } catch (err) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-[#00694C]" />
          <h1 className="text-3xl font-serif text-[#004A3A] font-medium tracking-tight">Product Catalog</h1>
        </div>
        {profile?.can_create_products && (
          <button 
            onClick={() => setCreateOpen(true)} 
            className="flex items-center gap-2 cursor-pointer bg-[#00694C] hover:bg-[#004A3A] text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-colors"
          >
            <Plus size={18} /> 
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00694C] animate-spin" /></div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Failed to load products.</div>
        ) : (
          <DataTable
            columns={getColumns(stores.length)}
            data={data}
            pageSize={20}
            searchable
            searchKeys={["name"]}
            extraFilters={categoryFilter}
            onRowClick={(row) => setViewItem(row)}
            actions={(profile?.can_update_products || profile?.can_delete_products) ? ((row) => (
              <div className="flex items-center justify-end gap-2">
                {profile?.can_update_products && (
                  <button 
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditItem(row);
                    }} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-100 hover:border-indigo-200 rounded-lg shadow-sm transition-all text-xs font-bold tracking-wide" 
                    title="Edit Product"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                {profile?.can_delete_products && (
                  <button 
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteItem(row);
                    }} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-100 hover:border-rose-200 rounded-lg shadow-sm transition-all text-xs font-bold tracking-wide" 
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )) : undefined}
          />
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Product" maxWidth="max-w-4xl">
        <ProductForm {...formProps} onSubmit={handleCreate} submitLabel="Create Product" />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Product" maxWidth="max-w-4xl">
        {editItem && <ProductForm {...formProps} initialValues={editItem} onSubmit={handleEdit} submitLabel="Update Product" />}
      </Modal>

      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Product Details" maxWidth="max-w-4xl">
        <ProductView item={viewItem} stores={stores} />
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
      />
    </div>
  );
}
