// Mock data for the admin dashboard

export const dashboardStats = {
  totalRevenue: 128450.75,
  totalOrders: 2847,
  totalUsers: 12543,
  totalProducts: 864,
  revenueChange: 12.5,
  ordersChange: 8.2,
  usersChange: 15.3,
  productsChange: 3.1,
};

export const revenueChartData = [
  { month: "Jan", revenue: 8400, orders: 210 },
  { month: "Feb", revenue: 9200, orders: 245 },
  { month: "Mar", revenue: 11800, orders: 290 },
  { month: "Apr", revenue: 10500, orders: 270 },
  { month: "May", revenue: 13200, orders: 320 },
  { month: "Jun", revenue: 12100, orders: 305 },
  { month: "Jul", revenue: 14500, orders: 350 },
  { month: "Aug", revenue: 13800, orders: 340 },
  { month: "Sep", revenue: 15600, orders: 380 },
  { month: "Oct", revenue: 14200, orders: 360 },
  { month: "Nov", revenue: 16800, orders: 410 },
  { month: "Dec", revenue: 18350, orders: 450 },
];

export const recentOrders = [
  { id: "ORD-2847", customer: "Sarah Johnson", email: "sarah@example.com", total: 249.99, status: "completed", date: "2026-02-21" },
  { id: "ORD-2846", customer: "Mike Chen", email: "mike@example.com", total: 89.50, status: "processing", date: "2026-02-21" },
  { id: "ORD-2845", customer: "Emily Davis", email: "emily@example.com", total: 175.00, status: "shipped", date: "2026-02-20" },
  { id: "ORD-2844", customer: "James Wilson", email: "james@example.com", total: 320.00, status: "pending", date: "2026-02-20" },
  { id: "ORD-2843", customer: "Lisa Park", email: "lisa@example.com", total: 59.99, status: "completed", date: "2026-02-19" },
  { id: "ORD-2842", customer: "Tom Brown", email: "tom@example.com", total: 445.00, status: "cancelled", date: "2026-02-19" },
];

export const mockProducts = Array.from({ length: 25 }, (_, i) => ({
  id: `PRD-${1000 + i}`,
  name: [
    "Wireless Headphones", "Cotton T-Shirt", "Running Shoes", "Laptop Stand", "Coffee Mug",
    "Backpack Pro", "Smart Watch", "Desk Lamp", "Phone Case", "Water Bottle",
    "Bluetooth Speaker", "Yoga Mat", "Sunglasses", "Notebook Set", "USB Hub",
    "Wireless Mouse", "Plant Pot", "Wall Art", "Candle Set", "Kitchen Scale",
    "Travel Bag", "LED Strip", "Card Holder", "Soap Set", "Desk Organizer",
  ][i],
  category: ["Electronics", "Clothing", "Footwear", "Accessories", "Home"][i % 5],
  price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
  stock: Math.floor(Math.random() * 500),
  status: ["active", "active", "active", "draft", "archived"][i % 5],
  vendor: ["TechCo", "FashionHub", "SportMax", "HomeStyle", "GadgetWorld"][i % 5],
  image: null,
  createdAt: "2026-01-15",
}));

export const mockOrders = Array.from({ length: 30 }, (_, i) => ({
  id: `ORD-${2847 - i}`,
  customer: [
    "Sarah Johnson", "Mike Chen", "Emily Davis", "James Wilson", "Lisa Park",
    "Tom Brown", "Anna Lee", "David Kim", "Rachel Green", "Chris Martin",
  ][i % 10],
  email: `customer${i}@example.com`,
  items: Math.floor(Math.random() * 5) + 1,
  total: parseFloat((Math.random() * 500 + 20).toFixed(2)),
  status: ["completed", "processing", "shipped", "pending", "cancelled"][i % 5],
  payment: ["paid", "paid", "paid", "unpaid", "refunded"][i % 5],
  date: `2026-02-${String(21 - (i % 15)).padStart(2, "0")}`,
}));

export const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: `USR-${5000 + i}`,
  name: [
    "Sarah Johnson", "Mike Chen", "Emily Davis", "James Wilson", "Lisa Park",
    "Tom Brown", "Anna Lee", "David Kim", "Rachel Green", "Chris Martin",
    "Nina Patel", "Oscar Reyes", "Fiona Walsh", "Henry Ford", "Gina Torres",
    "Leo Zhang", "Maya Jones", "Ryan Scott", "Zara Ali", "Jack White",
  ][i],
  email: `user${i}@example.com`,
  role: ["customer", "customer", "customer", "vendor", "admin"][i % 5],
  status: ["active", "active", "active", "inactive", "active"][i % 5],
  orders: Math.floor(Math.random() * 50),
  spent: parseFloat((Math.random() * 2000).toFixed(2)),
  joinedAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-15`,
}));

export const mockVendors = Array.from({ length: 12 }, (_, i) => ({
  id: `VND-${100 + i}`,
  name: ["TechCo", "FashionHub", "SportMax", "HomeStyle", "GadgetWorld", "EcoGoods", "LuxBrand", "ModernCraft", "UrbanWear", "FreshMart", "BookNest", "PetZone"][i],
  email: `vendor${i}@example.com`,
  products: Math.floor(Math.random() * 100) + 5,
  revenue: parseFloat((Math.random() * 50000 + 1000).toFixed(2)),
  status: ["active", "active", "active", "pending", "inactive"][i % 5],
  commission: [10, 12, 15, 8, 10][i % 5],
  joinedAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-01`,
}));

export const mockShops = Array.from({ length: 8 }, (_, i) => ({
  id: `SHP-${200 + i}`,
  name: ["TechCo Store", "Fashion Central", "Sport Arena", "Home & Living", "Gadget Hub", "Eco Market", "Luxury Lane", "Modern Crafts"][i],
  vendor: ["TechCo", "FashionHub", "SportMax", "HomeStyle", "GadgetWorld", "EcoGoods", "LuxBrand", "ModernCraft"][i],
  products: Math.floor(Math.random() * 80) + 10,
  rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
  status: ["active", "active", "active", "pending", "active"][i % 5],
  visits: Math.floor(Math.random() * 10000) + 500,
}));

export const mockShipping = Array.from({ length: 15 }, (_, i) => ({
  id: `SHP-${3000 + i}`,
  orderId: `ORD-${2847 - i}`,
  customer: mockOrders[i]?.customer || "Customer",
  carrier: ["FedEx", "UPS", "DHL", "USPS", "Local Courier"][i % 5],
  tracking: `TRK${String(Math.random()).slice(2, 14)}`,
  status: ["in_transit", "delivered", "processing", "in_transit", "delivered"][i % 5],
  estimatedDelivery: `2026-02-${String(25 + (i % 5)).padStart(2, "0")}`,
  shippedAt: `2026-02-${String(18 + (i % 5)).padStart(2, "0")}`,
}));

export const mockWebsiteContent = [
  { id: "WEB-001", title: "Homepage Banner", type: "banner", status: "published", lastUpdated: "2026-02-20" },
  { id: "WEB-002", title: "About Us Page", type: "page", status: "published", lastUpdated: "2026-02-18" },
  { id: "WEB-003", title: "Shipping Policy", type: "page", status: "published", lastUpdated: "2026-02-15" },
  { id: "WEB-004", title: "Return Policy", type: "page", status: "draft", lastUpdated: "2026-02-10" },
  { id: "WEB-005", title: "FAQ Page", type: "page", status: "published", lastUpdated: "2026-02-08" },
  { id: "WEB-006", title: "Promo Banner - Spring Sale", type: "banner", status: "draft", lastUpdated: "2026-02-21" },
  { id: "WEB-007", title: "Terms of Service", type: "page", status: "published", lastUpdated: "2026-01-30" },
  { id: "WEB-008", title: "Privacy Policy", type: "page", status: "published", lastUpdated: "2026-01-25" },
];

export const mockSections = [
  { id: "SEC-001", name: "Hero Slider", page: "Homepage", type: "slider", order: 1, status: "active" },
  { id: "SEC-002", name: "Featured Products", page: "Homepage", type: "product_grid", order: 2, status: "active" },
  { id: "SEC-003", name: "Categories Grid", page: "Homepage", type: "grid", order: 3, status: "active" },
  { id: "SEC-004", name: "Testimonials", page: "Homepage", type: "carousel", order: 4, status: "inactive" },
  { id: "SEC-005", name: "Newsletter CTA", page: "Homepage", type: "cta", order: 5, status: "active" },
  { id: "SEC-006", name: "Top Sellers", page: "Homepage", type: "product_grid", order: 6, status: "active" },
  { id: "SEC-007", name: "Brand Partners", page: "Homepage", type: "logo_grid", order: 7, status: "draft" },
  { id: "SEC-008", name: "Sale Banner", page: "Shop", type: "banner", order: 1, status: "active" },
];

export const mockInvoice = {
  id: "INV-2847",
  orderId: "ORD-2847",
  date: "February 21, 2026",
  dueDate: "March 7, 2026",
  company: {
    name: "iCommerce Inc.",
    address: "123 Commerce Street",
    city: "San Francisco, CA 94105",
    phone: "+1 (555) 123-4567",
    email: "billing@icommerce.com",
  },
  customer: {
    name: "Sarah Johnson",
    address: "456 Customer Ave",
    city: "New York, NY 10001",
    email: "sarah@example.com",
  },
  items: [
    { name: "Wireless Headphones Pro", qty: 1, price: 149.99 },
    { name: "Phone Case - Clear", qty: 2, price: 24.99 },
    { name: "USB-C Cable (2 pack)", qty: 1, price: 19.99 },
    { name: "Screen Protector", qty: 3, price: 9.99 },
  ],
  subtotal: 249.93,
  shipping: 12.00,
  tax: 22.49,
  total: 284.42,
  status: "paid",
};

export const statusColors = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  in_transit: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  shipped: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  refunded: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};
