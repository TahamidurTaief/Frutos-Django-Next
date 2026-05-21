# Orders Dashboard - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Access the Dashboard
```
URL: http://localhost:8000/dashboard/
(Must be logged in as staff user)
```

### Step 2: Navigate to Orders
- Click "Orders" in the left sidebar (under MANAGEMENT section)
- Or go directly to: `http://localhost:8000/dashboard/orders/`

---

## 📖 Main Features

### View All Orders
- **URL**: `/dashboard/orders/`
- **Features**:
  - Search by: Order #, Customer name, Email, Phone
  - Filter by: Order Status, Payment Status
  - View order details, edit, or delete
  - Real-time table updates (HTMX)

### Create New Order
- **Button**: "Add Order" (top right)
- **Features**:
  - Modal form appears
  - Fields: Customer info, Order status, Payment status, Amounts, Shipping
  - Automatic validation
  - Success message on creation

### View Order Details
- **Click**: Order number link or View icon
- **Shows**:
  - Customer information
  - All order items with prices
  - Shipping details
  - Order summary with totals
  - Edit button available

### Edit Order
- **Click**: Edit icon on order row
- **Features**:
  - Modal form with pre-filled data
  - Update any order information
  - Automatic validation
  - Instant table refresh

### Delete Order
- **Click**: Delete icon (trash can)
- **Features**:
  - Confirmation dialog
  - Safe deletion
  - Table updates immediately

---

## 🎨 Status Indicators

### Order Status (Color-coded)
- 🔴 **PENDING** - Red (new orders)
- 🔵 **PROCESSING** - Blue (being prepared)
- 🔷 **SHIPPED** - Light Blue (on the way)
- 🟢 **DELIVERED** - Green (completed)
- ⚪ **CANCELLED** - Gray (cancelled)

### Payment Status
- 🟢 **PAID** - Green
- 🔴 **PENDING** - Red
- 🔴 **FAILED** - Red

---

## 🔍 Search & Filter

### Single Search
Type in search box to find by:
- Order number (e.g., "ORD123456")
- Customer name (e.g., "John Doe")
- Email (e.g., "john@example.com")
- Phone (e.g., "01712345678")

### Single Filter
Select dropdown to filter by:
- **Order Status**: Pending, Processing, Shipped, Delivered, Cancelled
- **Payment Status**: Paid, Pending, Failed

### Combined Search + Filter
Use both together:
1. Type customer name
2. Select "PENDING" status
3. Table shows only pending orders for that customer

---

## 📋 Order Form Fields

### Customer Information (Required)
- **Name**: Customer's full name
- **Email**: Customer's email address
- **Phone**: Customer's phone number

### Order Information (Required)
- **User**: Link to customer account (optional)
- **Status**: Order status (Pending, Processing, etc.)
- **Payment Status**: Payment status (Paid, Pending, Failed)

### Pricing (Required)
- **Subtotal**: Amount before shipping
- **Total Amount**: Final amount including shipping

### Shipping (Optional)
- **Address**: Select from customer addresses
- **Method**: Select shipping method
- **Tracking #**: Tracking number (if shipped)

---

## 🎯 Workflow Examples

### Workflow 1: New Order
1. Click "Add Order"
2. Fill customer info
3. Set status: "PENDING"
4. Set payment status: "PENDING"
5. Enter amounts
6. Click "Create Order"
7. Order appears in list

### Workflow 2: Process Order
1. Find pending order
2. Click edit icon
3. Change status to "PROCESSING"
4. Save
5. Table updates instantly

### Workflow 3: Ship Order
1. Find processing order
2. Click edit icon
3. Add shipping method
4. Add tracking number
5. Change status to "SHIPPED"
6. Save

### Workflow 4: Complete Order
1. Find shipped order
2. Click edit icon
3. Change status to "DELIVERED"
4. Save
5. Order marked as complete

---

## ⌨️ Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit form
- **Esc**: Close modal
- **Ctrl+F**: Browser search on page

---

## 📱 Mobile Responsiveness

Dashboard is fully responsive:
- ✅ Desktop: Full-width table
- ✅ Tablet: Adjusted column widths
- ✅ Mobile: Stacked layout, scrollable table

---

## 🔐 Security

- ✅ Login required
- ✅ Staff-only access
- ✅ All data protected
- ✅ Automatic CSRF protection
- ✅ Safe form validation

---

## ⚙️ Troubleshooting

### Problem: Can't see Orders menu
**Solution**: Log in as staff user (is_staff=True)

### Problem: Modal doesn't appear
**Solution**: Check browser console for errors, verify HTMX is loaded

### Problem: Search not working
**Solution**: Wait for 500ms debounce to complete, check network tab

### Problem: Can't create order
**Solution**: 
- Check all required fields are filled
- Look for red error messages
- Verify amounts are valid numbers

### Problem: Changes not saving
**Solution**: 
- Check for form validation errors
- Verify internet connection
- Try refreshing page

---

## 💡 Tips & Tricks

1. **Quick Search**: Start typing in search box - results update automatically
2. **Combine Filters**: Use search AND status filter together for precise results
3. **View Details**: Click order number to see full details page
4. **Batch Actions**: Edit multiple orders by filtering first
5. **Status Colors**: Quickly scan table for order status at a glance

---

## 📊 Dashboard Home

Visit `/dashboard/` to see:
- Total Products count
- Active Products count
- **Total Orders count** ← NEW
- **Pending Orders count** ← NEW
- Quick action buttons

---

## 🔗 Related Links

- Orders List: `/dashboard/orders/`
- Products: `/dashboard/products/`
- Dashboard Home: `/dashboard/`
- Django Admin: `/issl-admin/`

---

## 📞 Need Help?

Refer to:
- `ORDERS_IMPLEMENTATION.md` - Technical details
- `COMPLETION_SUMMARY.md` - Overview
- `CODE_CHANGES_MANIFEST.md` - What was changed

---

## ✅ Check It Out!

1. Go to: `http://localhost:8000/dashboard/`
2. Click "Orders" in sidebar
3. Try creating an order
4. Try searching and filtering
5. Enjoy! 🎉

---

**Status**: ✅ Ready to use!
