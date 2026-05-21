"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Container from "@/app/dashboard/_components/Container";
import DataTable from "@/app/dashboard/_components/DataTable";
import Modal from "@/app/dashboard/_components/Modal";
import FormModal from "@/app/dashboard/_components/FormModal";
import ConfirmDialog from "@/app/dashboard/_components/ConfirmDialog";
import { useToastContext } from "@/app/dashboard/_components/Toaster";
import { useModel } from "@/app/dashboard/_lib/useModel";
import {
  heroBannersService, offerBannersService, blogPostsService, socialLinksService,
  navbarService, offerCategoriesService, horizontalBannersService,
  footerSectionsService, footerLinksService, siteSettingsService,
} from "@/app/dashboard/_lib/services";

const PAGE_SIZE = 10;

/** Clip text to max characters with ellipsis */
const clip = (v, max = 40) => {
  if (!v) return "—";
  const s = String(v);
  return s.length > max ? s.slice(0, max) + "…" : s;
};

const TABS = [
  { id: "hero", label: "Hero Banners" },
  { id: "offers", label: "Offer Banners" },
  { id: "horizontal", label: "Promo Banners" },
  { id: "offerCats", label: "Offer Categories" },
  { id: "navbar", label: "Navbar" },
  { id: "blog", label: "Blog Posts" },
  { id: "footer", label: "Footer" },
  { id: "footerLinks", label: "Footer Links" },
  { id: "social", label: "Social Links" },
  { id: "settings", label: "Site Settings" },
];

/* ─── Column / Field definitions per tab ─────────────────────── */

const statusCol = (key = "is_active") => ({
  key,
  label: "Status",
  render: (v) => (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${v ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
      {v ? "Active" : "Inactive"}
    </span>
  ),
});

const activeField = { key: "is_active", label: "Active", type: "select", required: true, options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] };

// Hero Banners
const heroColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v)}</span> },
  { key: "subtitle", label: "Subtitle", render: (v) => v ? <span className="text-gray-500 dark:text-gray-400 text-xs" title={v}>{clip(v, 45)}</span> : "—" },
  { key: "order", label: "Order" },
  statusCol(),
];
const heroFields = [
  { key: "title", label: "Title", required: true },
  { key: "subtitle", label: "Subtitle" },
  { key: "button_text", label: "Button Text" },
  { key: "button_url", label: "Button URL" },
  { key: "order", label: "Order", type: "number", placeholder: "1" },
  activeField,
];

// Offer Banners
const offerColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v)}</span> },
  { key: "order", label: "Order" },
  statusCol(),
];
const offerFields = [
  { key: "title", label: "Title", required: true },
  { key: "subtitle", label: "Subtitle" },
  { key: "button_text", label: "Button Text" },
  { key: "button_url", label: "Button URL" },
  { key: "order", label: "Order", type: "number" },
  activeField,
];

// Horizontal Promo Banners
const horizontalColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v)}</span> },
  { key: "subtitle", label: "Subtitle", render: (v) => v ? <span className="text-gray-500 dark:text-gray-400 text-xs" title={v}>{clip(v, 45)}</span> : "—" },
  { key: "order", label: "Order" },
  statusCol(),
];
const horizontalFields = [
  { key: "title", label: "Title", required: true },
  { key: "subtitle", label: "Subtitle" },
  { key: "button_text", label: "Button Text" },
  { key: "button_url", label: "Button URL" },
  { key: "overlay_colors", label: "Overlay Colors", placeholder: "from-purple-900/70 via-blue-900/50 to-transparent" },
  { key: "order", label: "Order", type: "number" },
  activeField,
];

// Offer Categories
const offerCatColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v, 35)}</span> },
  { key: "name", label: "Name", render: (v) => <span title={v}>{clip(v, 25)}</span> },
  { key: "link", label: "Link", render: (v) => v ? <span className="font-mono text-xs text-gray-500" title={v}>{clip(v, 35)}</span> : "—" },
  { key: "badge_text", label: "Badge", render: (v) => v ? <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium">{v}</span> : "—" },
  { key: "order", label: "Order" },
  statusCol(),
];
const offerCatFields = [
  { key: "name", label: "Name", required: true, placeholder: "e.g., flash-sale" },
  { key: "title", label: "Display Title", required: true, placeholder: "e.g., Flash Sale" },
  { key: "link", label: "Link URL", required: true, placeholder: "/products?offer=flash-sale" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "badge_text", label: "Badge Text", placeholder: "HOT, NEW, SALE" },
  { key: "badge_color", label: "Badge Color", placeholder: "red" },
  { key: "icon_class", label: "Icon Class" },
  { key: "order", label: "Order", type: "number" },
  { key: "is_featured", label: "Featured", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  activeField,
];

// Navbar Links
const navbarColumns = [
  { key: "name", label: "Name", render: (v) => <span title={v}>{clip(v, 30)}</span> },
  { key: "link_type", label: "Type", render: (v) => <span className="capitalize">{v}</span> },
  { key: "url", label: "URL", render: (v) => v ? <span className="font-mono text-xs text-gray-500" title={v}>{clip(v, 35)}</span> : "—" },
  { key: "order", label: "Order" },
  statusCol(),
];
const navbarFields = [
  { key: "name", label: "Link Name", required: true },
  { key: "link_type", label: "Type", type: "select", required: true, options: [{ value: "internal", label: "Internal" }, { value: "external", label: "External" }, { value: "dropdown", label: "Dropdown" }] },
  { key: "url", label: "URL", placeholder: "/page or https://..." },
  { key: "icon_class", label: "Icon Class" },
  { key: "order", label: "Order", type: "number" },
  { key: "show_in_mobile", label: "Show Mobile", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  { key: "show_in_desktop", label: "Show Desktop", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  activeField,
];

// Blog Posts
const blogColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v, 40)}</span> },
  { key: "slug", label: "Slug", render: (v) => <span className="font-mono text-xs text-gray-500" title={v}>{clip(v, 30)}</span> },
  { key: "is_featured", label: "Featured", render: (v) => v ? <span className="text-xs text-amber-600 font-medium">Featured</span> : "—" },
  statusCol("is_active"),
  { key: "publish_date", label: "Published", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];
const blogFields = [
  { key: "title", label: "Title", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "content", label: "Content", type: "textarea" },
  { key: "is_featured", label: "Featured", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  activeField,
];

// Footer Sections
const footerColumns = [
  { key: "title", label: "Title", render: (v) => <span title={v}>{clip(v, 35)}</span> },
  { key: "section_type", label: "Type", render: (v) => <span className="capitalize">{(v || "").replace(/_/g, " ")}</span> },
  { key: "order", label: "Order" },
  { key: "links", label: "Links", render: (v) => v?.length ?? 0 },
  statusCol(),
];
const footerFields = [
  { key: "title", label: "Section Title", required: true },
  { key: "section_type", label: "Section Type", type: "select", required: true, options: [
    { value: "company_info", label: "Company Info" },
    { value: "services", label: "Services" },
    { value: "platforms", label: "Platforms" },
    { value: "company", label: "Company" },
    { value: "legal", label: "Legal" },
    { value: "social", label: "Social Media" },
  ]},
  { key: "order", label: "Order", type: "number" },
  activeField,
];

// Footer Links
const footerLinkColumns = [
  { key: "text", label: "Text", render: (v) => <span title={v}>{clip(v, 30)}</span> },
  { key: "url", label: "URL", render: (v) => v ? <span className="font-mono text-xs text-gray-500" title={v}>{clip(v, 40)}</span> : "—" },
  { key: "order", label: "Order" },
  { key: "open_in_new_tab", label: "New Tab", render: (v) => v ? "Yes" : "No" },
  statusCol(),
];
const footerLinkFields = [
  { key: "text", label: "Link Text", required: true },
  { key: "url", label: "URL", required: true, placeholder: "/page or https://..." },
  { key: "section", label: "Section ID", required: true, placeholder: "Footer Section UUID" },
  { key: "icon_class", label: "Icon Class" },
  { key: "order", label: "Order", type: "number" },
  { key: "open_in_new_tab", label: "Open in New Tab", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  activeField,
];

// Social Links
const socialColumns = [
  { key: "platform", label: "Platform", render: (v) => <span title={v}>{clip(v, 25)}</span> },
  { key: "url", label: "URL", render: (v) => v ? <span className="font-mono text-xs text-gray-500" title={v}>{clip(v, 45)}</span> : "—" },
  { key: "order", label: "Order" },
  statusCol(),
];
const socialFields = [
  { key: "platform", label: "Platform", required: true, placeholder: "e.g., Facebook" },
  { key: "url", label: "URL", required: true, placeholder: "https://..." },
  { key: "icon_class", label: "Icon class", placeholder: "e.g., facebook" },
  { key: "order", label: "Order", type: "number" },
  activeField,
];

// Site Settings
const settingsColumns = [
  { key: "key", label: "Key", render: (v) => <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{v}</code> },
  { key: "value", label: "Value", render: (v) => <span className="font-mono text-xs text-gray-600 dark:text-gray-400" title={String(v ?? "")}>{clip(v, 50)}</span> },
  { key: "setting_type", label: "Type", render: (v) => <span className="capitalize">{v}</span> },
  { key: "group", label: "Group", render: (v) => <span className="capitalize">{v}</span> },
  statusCol(),
];
const settingsFields = [
  { key: "key", label: "Key", required: true, placeholder: "e.g., site_name" },
  { key: "value", label: "Value", type: "textarea", required: true },
  { key: "setting_type", label: "Setting Type", type: "select", required: true, options: [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "url", label: "URL" },
    { value: "email", label: "Email" },
    { value: "textarea", label: "Long Text" },
  ]},
  { key: "description", label: "Description" },
  { key: "group", label: "Group", placeholder: "general" },
  activeField,
];

/* ─── Tab Config Map ─────────────────────────────────────────── */
const TAB_CONFIG = {
  hero:        { service: heroBannersService,      columns: heroColumns,       fields: heroFields,       boolFields: ["is_active"] },
  offers:      { service: offerBannersService,     columns: offerColumns,      fields: offerFields,      boolFields: ["is_active"] },
  horizontal:  { service: horizontalBannersService,columns: horizontalColumns, fields: horizontalFields, boolFields: ["is_active"] },
  offerCats:   { service: offerCategoriesService,  columns: offerCatColumns,   fields: offerCatFields,   boolFields: ["is_active", "is_featured"] },
  navbar:      { service: navbarService,           columns: navbarColumns,     fields: navbarFields,     boolFields: ["is_active", "show_in_mobile", "show_in_desktop"] },
  blog:        { service: blogPostsService,        columns: blogColumns,       fields: blogFields,       boolFields: ["is_active", "is_featured"] },
  footer:      { service: footerSectionsService,   columns: footerColumns,     fields: footerFields,     boolFields: ["is_active"] },
  footerLinks: { service: footerLinksService,      columns: footerLinkColumns, fields: footerLinkFields, boolFields: ["is_active", "open_in_new_tab"] },
  social:      { service: socialLinksService,      columns: socialColumns,     fields: socialFields,     boolFields: ["is_active"] },
  settings:    { service: siteSettingsService,     columns: settingsColumns,   fields: settingsFields,   boolFields: ["is_active"] },
};

/* ─── Generic Tab Table ──────────────────────────────────────── */
function TabTable({ service, columns, formFields, lookupField = "id", boolFields = ["is_active"] }) {
  const toast = useToastContext();
  const { data, totalCount, loading, params, setSearch, setPage, create, patch, remove } = useModel(service, { pageSize: PAGE_SIZE });
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const castBools = (values) => {
    const out = { ...values };
    boolFields.forEach((k) => { if (k in out) out[k] = out[k] === "true"; });
    return out;
  };

  const initBools = (item) => {
    const out = { ...item };
    boolFields.forEach((k) => { if (k in out) out[k] = String(out[k]); });
    return out;
  };

  const handleCreate = async (values) => {
    try { await create(castBools(values)); toast.success("Created successfully"); setCreateOpen(false); } catch (e) { toast.error(e?.message || "Create failed"); }
  };
  const handleEdit = async (values) => {
    try { await patch(editItem[lookupField], castBools(values)); toast.success("Updated successfully"); setEditItem(null); } catch (e) { toast.error(e?.message || "Update failed"); }
  };
  const handleDelete = async () => {
    try { await remove(deleteItem[lookupField]); toast.success("Deleted successfully"); setDeleteItem(null); } catch (e) { toast.error(e?.message || "Delete failed"); }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        serverSide
        totalItems={totalCount}
        currentPage={params.page}
        pageSize={PAGE_SIZE}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        onPageChange={setPage}
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
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Item">
        <FormModal fields={formFields} onSubmit={handleCreate} submitLabel="Create" />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Item">
        {editItem && <FormModal fields={formFields} initialValues={initBools(editItem)} onSubmit={handleEdit} submitLabel="Save" />}
      </Modal>
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Details">
        {viewItem && (
          <div className="space-y-3">
            {Object.entries(viewItem).filter(([k]) => !["id", "image", "image_url_final"].includes(k)).map(([key, val]) => (
              <div key={key} className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white max-w-[60%] text-right truncate">{typeof val === "object" ? JSON.stringify(val) : String(val ?? "—")}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete" message="Are you sure you want to delete this item? This action cannot be undone." />
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function WebsitePage() {
  const [activeTab, setActiveTab] = useState("hero");
  const cfg = TAB_CONFIG[activeTab];

  return (
    <Container title="Website Content" description="Manage banners, navigation, footer, blog, and site settings">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 mb-4 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TabTable
        key={activeTab}
        service={cfg.service}
        columns={cfg.columns}
        formFields={cfg.fields}
        boolFields={cfg.boolFields}
      />
    </Container>
  );
}
