# Admin Dashboard - Setup & Usage Guide

## Overview

Custom Admin Dashboard built with Django + HTMX + Bootstrap 5 for iCommerce platform.

**Tech Stack:**
- Django 5.x (Backend)
- HTMX 1.9.10 (Dynamic interactions)
- Bootstrap 5 (UI Framework - Fila Template)
- Django Templates (No React/Next.js)

## Project Structure

```
backend/
├── dashboard/                      # Dashboard Django app
│   ├── templates/
│   │   └── dashboard/
│   │       ├── base.html          # Base template with layout
│   │       ├── home.html          # Dashboard homepage
│   │       ├── partials/          # Reusable components
│   │       │   ├── sidebar.html   # Left sidebar navigation
│   │       │   ├── navbar.html    # Top header bar
│   │       │   └── footer.html    # Footer section
│   │       └── products/          # Product CRUD templates
│   │           ├── list.html      # Product list page
│   │           ├── form.html      # Standalone form page
│   │           └── partials/
│   │               ├── product_table.html  # HTMX table partial
│   │               └── product_form.html   # HTMX modal form
│   ├── views.py                   # Dashboard views
│   ├── forms.py                   # Django ModelForms
│   ├── urls.py                    # Dashboard URL patterns
│   └── apps.py                    # App configuration
│
fila/                              # Bootstrap admin template assets
├── assets/
│   ├── css/                       # Stylesheets
│   ├── js/                        # JavaScript files
│   └── images/                    # Images & icons
```

## Features Implemented

### ✅ Core Features
- **Authentication**: `@login_required` + `is_staff` check
- **Dashboard Home**: Statistics overview
- **Product CRUD**: Full Create, Read, Update, Delete with HTMX
- **Search**: Real-time product search (500ms debounce)
- **Responsive Design**: Mobile-friendly Bootstrap 5 UI
- **No Page Reload**: HTMX handles all interactions dynamically

### ✅ HTMX Interactions
- **Modal Create/Edit**: Product forms load in Bootstrap modals
- **Inline Delete**: Confirmation + table refresh without reload
- **Live Search**: Auto-search as you type
- **Table Updates**: Smooth partial updates on CRUD operations

### ✅ Security
- Only staff users can access dashboard
- CSRF protection on all forms
- Proper authentication checks

## URL Structure

```
/dashboard/                           → Dashboard home
/dashboard/products/                  → Product list
/dashboard/products/create/           → Create product (modal or page)
/dashboard/products/<uuid>/edit/      → Edit product (modal or page)
/dashboard/products/<uuid>/delete/    → Delete product (HTMX)
```

## Installation & Setup

### 1. Install Dependencies

Dashboard app is already included in `INSTALLED_APPS`. No additional packages needed beyond existing requirements.

### 2. Static Files Configuration

The dashboard uses assets from `fila/` directory. Configuration is already set in `settings.py`:

```python
STATICFILES_DIRS = [
    os.path.join(BASE_DIR.parent, 'fila'),  # Bootstrap admin template
]
```

### 3. Collect Static Files (Production)

```bash
python manage.py collectstatic
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (if not exists)

```bash
python manage.py createsuperuser
```

## Usage

### Start Development Server

```bash
cd backend
python manage.py runserver
```

### Access Dashboard

1. **Login Required**: Go to `/issl-admin/` to login
2. **Dashboard**: Navigate to `/dashboard/`
3. **Products Management**: Click "Products" in sidebar or go to `/dashboard/products/`

## HTMX Integration Examples

### 1. Load Form in Modal (Create)
```html
<button hx-get="{% url 'dashboard:product_create' %}" 
        hx-target="#modal-container" 
        hx-swap="innerHTML">
    Add Product
</button>
```

### 2. Submit Form via HTMX
```html
<form hx-post="{% url 'dashboard:product_create' %}"
      hx-target="#product-table-container"
      hx-encoding="multipart/form-data">
    <!-- form fields -->
</form>
```

### 3. Delete with Confirmation
```html
<button hx-delete="{% url 'dashboard:product_delete' product.id %}"
        hx-target="#product-table-container"
        hx-confirm="Are you sure?">
    Delete
</button>
```

### 4. Live Search (500ms debounce)
```html
<input type="text" name="q"
       hx-get="{% url 'dashboard:product_list' %}"
       hx-trigger="input changed delay:500ms"
       hx-target="#product-table-container">
```

## Extending the Dashboard

### Add New CRUD Module (e.g., Orders)

1. **Create Views** in `dashboard/views.py`:
```python
@login_required
@user_passes_test(staff_required)
def order_list(request):
    orders = Order.objects.all()
    return render(request, 'dashboard/orders/list.html', {'orders': orders})
```

2. **Add URLs** in `dashboard/urls.py`:
```python
path('orders/', views.order_list, name='order_list'),
```

3. **Create Templates**:
   - `templates/dashboard/orders/list.html`
   - `templates/dashboard/orders/partials/order_table.html`

4. **Update Sidebar** in `partials/sidebar.html`:
```html
<li class="menu-item">
    <a href="{% url 'dashboard:order_list' %}" class="menu-link">
        <span class="material-symbols-outlined menu-icon">receipt_long</span>
        <span class="title">Orders</span>
    </a>
</li>
```

### Add Custom Filters

Update the form view to handle filters:
```python
def product_list(request):
    products = Product.objects.all()
    
    # Search
    if query := request.GET.get('q'):
        products = products.filter(name__icontains=query)
    
    # Filter by category
    if category_id := request.GET.get('category'):
        products = products.filter(sub_category__category_id=category_id)
    
    # Filter by stock status
    if stock_status := request.GET.get('stock'):
        if stock_status == 'in_stock':
            products = products.filter(stock__gt=0)
        elif stock_status == 'out_of_stock':
            products = products.filter(stock=0)
    
    return render(request, 'dashboard/products/list.html', {'products': products})
```

## Best Practices

### ✅ Do's
- Use `@login_required` and `@user_passes_test(staff_required)` on all views
- Return partial templates for HTMX requests: `if request.headers.get('HX-Request')`
- Use Django ModelForms for data validation
- Keep HTMX attributes in templates (separation of concerns)
- Use Bootstrap utility classes for styling

### ❌ Don'ts
- Don't write custom JavaScript (HTMX handles interactions)
- Don't use DRF serializers in dashboard views
- Don't expose dashboard to non-staff users
- Don't modify `frontend/` directory
- Don't use React or Vue.js components

## Troubleshooting

### Static Files Not Loading

**Solution 1 - Development:**
```bash
python manage.py runserver
# Django serves static files automatically in DEBUG=True
```

**Solution 2 - Production:**
```bash
python manage.py collectstatic --clear
```

### HTMX Not Working

Check browser console for:
1. HTMX library loaded: View source → `<script src="https://unpkg.com/htmx.org@1.9.10"></script>`
2. Network tab shows XHR requests with `HX-Request: true` header

### Forms Not Submitting

1. Ensure `{% csrf_token %}` is present in form
2. Check `enctype="multipart/form-data"` for file uploads
3. Verify `hx-encoding="multipart/form-data"` on HTMX forms with files

### Modal Not Opening

Check JavaScript console. Bootstrap modal requires:
```javascript
const modal = new bootstrap.Modal(document.querySelector('#productModal'));
modal.show();
```

This is handled automatically in `list.html` via HTMX event listeners.

## Performance Tips

### Database Optimization
```python
# Use select_related for ForeignKey
products = Product.objects.select_related('shop', 'brand', 'sub_category')

# Use prefetch_related for ManyToMany
products = Product.objects.prefetch_related('colors', 'sizes')
```

### HTMX Loading States
```html
<button hx-indicator="#loading-spinner">
    Submit
</button>
<span id="loading-spinner" class="htmx-indicator">Loading...</span>
```

### Cache Static Assets (Production)
```python
# settings.py
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
```

## Future Enhancements

### Planned Features
- [ ] Orders management module
- [ ] Shops management
- [ ] User management
- [ ] Analytics dashboard
- [ ] Export to CSV/Excel
- [ ] Bulk actions (delete, update)
- [ ] Image gallery management
- [ ] Activity logs

### Optional Improvements
- Add pagination (Django Paginator)
- Add inline editing (HTMX inline forms)
- Add drag-and-drop sorting
- Add advanced filters (price range, date range)
- Add bulk image upload

## Support

For issues or questions:
1. Check Django logs in terminal
2. Check browser console for JavaScript errors
3. Review HTMX documentation: https://htmx.org/docs/

## License

Internal tool for iCommerce platform.

---

**Last Updated:** January 2026  
**Maintained By:** iCommerce Development Team
