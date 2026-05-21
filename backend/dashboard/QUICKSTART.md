# Quick Start Guide - Admin Dashboard

## Prerequisites

- Python 3.11+
- Django project with existing Product model
- Staff/superuser account

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py migrate
```

### 3. Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

Make sure to set `is_staff = True` for the user.

### 4. Start Development Server

```bash
python manage.py runserver
```

### 5. Access Dashboard

1. **Login**: http://127.0.0.1:8000/issl-admin/
2. **Dashboard**: http://127.0.0.1:8000/dashboard/
3. **Products**: http://127.0.0.1:8000/dashboard/products/

## Features

✅ **Dashboard Home** - Overview statistics  
✅ **Product CRUD** - Create, Read, Update, Delete products  
✅ **HTMX Integration** - No page reloads  
✅ **Live Search** - Real-time product filtering  
✅ **Modal Forms** - Bootstrap modals for create/edit  
✅ **Responsive Design** - Mobile-friendly UI  

## Tech Stack

- **Backend**: Django 5.2+
- **Frontend**: Bootstrap 5 (Fila Template)
- **Interactivity**: HTMX 1.9.10
- **Templates**: Django Templates

## URLs

| URL | Description |
|-----|-------------|
| `/dashboard/` | Dashboard home |
| `/dashboard/products/` | Product list |
| `/dashboard/products/create/` | Create product |
| `/dashboard/products/<id>/edit/` | Edit product |
| `/dashboard/products/<id>/delete/` | Delete product |

## Security

- Only staff users can access dashboard
- `@login_required` decorator on all views
- `is_staff` check required
- CSRF protection enabled

## Next Steps

1. Start the server: `python manage.py runserver`
2. Navigate to: http://127.0.0.1:8000/dashboard/
3. Click "Products" in sidebar
4. Click "Add Product" to create your first product

## Documentation

See `README.md` for detailed documentation, extension guide, and best practices.

## Support

Check:
1. Django logs in terminal
2. Browser console for errors
3. HTMX documentation: https://htmx.org/

---

**Happy coding!** 🚀
