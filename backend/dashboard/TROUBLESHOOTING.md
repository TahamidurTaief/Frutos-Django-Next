# Troubleshooting & Common Issues

## Issue 1: ModuleNotFoundError for packages

**Error:**
```
ModuleNotFoundError: No module named 'rest_framework_simplejwt'
```

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

All dependencies are listed in `requirements.txt`. This installs all required packages.

---

## Issue 2: Static files not loading (CSS/JS missing)

**Symptoms:**
- Dashboard looks plain (no styling)
- Icons missing
- Layout broken

**Solution (Development):**
```bash
# Django serves static files automatically when DEBUG=True
python manage.py runserver
```

Verify in `settings.py`:
```python
DEBUG = True
STATICFILES_DIRS = [
    os.path.join(BASE_DIR.parent, 'fila'),
]
```

**Solution (Production):**
```bash
python manage.py collectstatic --clear
```

---

## Issue 3: Cannot access dashboard (403/404)

**Symptoms:**
- `/dashboard/` returns 403 Forbidden
- Or redirects to login

**Solution:**

1. **Make sure you're logged in as staff user:**

```bash
python manage.py createsuperuser
```

2. **Or update existing user:**

```python
python manage.py shell

from users.models import User  # or django.contrib.auth.models.User
user = User.objects.get(username='your_username')
user.is_staff = True
user.save()
exit()
```

3. **Check view decorators:**
```python
# All dashboard views must have:
@login_required
@user_passes_test(staff_required)
```

---

## Issue 4: HTMX not working (modals don't open, no AJAX)

**Symptoms:**
- Clicking "Add Product" reloads page instead of opening modal
- Delete requires page refresh
- Search doesn't work in real-time

**Solution:**

1. **Check HTMX is loaded in base.html:**
```html
<script src="https://unpkg.com/htmx.org@1.9.10"></script>
```

2. **Check browser console for errors:**
   - Press F12 → Console tab
   - Look for JavaScript errors

3. **Verify Bootstrap JS is loaded:**
```html
<script src="/static/assets/js/bootstrap.bundle.min.js"></script>
```

4. **Check network tab:**
   - Press F12 → Network tab
   - Look for requests with `HX-Request: true` header

---

## Issue 5: Forms not submitting

**Symptoms:**
- Modal form doesn't submit
- No validation errors shown
- Nothing happens on submit

**Solution:**

1. **Check CSRF token in form:**
```html
<form method="post">
    {% csrf_token %}
    <!-- form fields -->
</form>
```

2. **For file uploads, check encoding:**
```html
<form method="post" enctype="multipart/form-data"
      hx-encoding="multipart/form-data">
```

3. **Check form errors in template:**
```html
{% if form.errors %}
    {{ form.errors }}
{% endif %}
```

4. **Check Django logs in terminal:**
```
Look for:
- Validation errors
- 500 errors
- Form POST data
```

---

## Issue 6: "No module named 'dashboard'"

**Error:**
```
ModuleNotFoundError: No module named 'dashboard'
```

**Solution:**

Make sure `dashboard` is in `INSTALLED_APPS`:

```python
# backend/settings.py
INSTALLED_APPS = [
    ...
    'dashboard',  # Must be here
]
```

Restart the server:
```bash
python manage.py runserver
```

---

## Issue 7: Product images not showing

**Symptoms:**
- Thumbnail shows broken image icon
- Images uploaded but not displayed

**Solution:**

1. **Check MEDIA_URL and MEDIA_ROOT in settings.py:**
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')
```

2. **Check urls.py has media URL pattern:**
```python
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

3. **Check image template tag:**
```html
{% if product.thumbnail %}
    <img src="{{ product.thumbnail.url }}" alt="{{ product.name }}">
{% endif %}
```

---

## Issue 8: Slug auto-generation not working

**Symptoms:**
- "slug is required" error when creating product
- Even though name is provided

**Solution:**

The view should auto-generate slug:

```python
# dashboard/views.py
def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            product = form.save(commit=False)
            if not product.slug:
                product.slug = slugify(product.name)
            product.save()
            form.save_m2m()
```

If still fails, add slug to form temporarily:
```python
# dashboard/forms.py
class ProductForm(forms.ModelForm):
    slug = forms.SlugField(required=False)
```

---

## Issue 9: Modal doesn't close after submit

**Symptoms:**
- Product created/updated successfully
- But modal stays open
- Page doesn't refresh

**Solution:**

Check HTMX event listener in list.html:

```javascript
document.body.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.successful && event.detail.xhr.status === 200) {
        const modalElement = document.querySelector('#productModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }
});
```

---

## Issue 10: Search not working

**Symptoms:**
- Typing in search box does nothing
- No real-time filtering

**Solution:**

1. **Check HTMX attributes on search input:**
```html
<input type="text" name="q" id="search-input"
       hx-get="{% url 'dashboard:product_list' %}"
       hx-trigger="input changed delay:500ms"
       hx-target="#product-table-container">
```

2. **Check view handles query parameter:**
```python
def product_list(request):
    products = Product.objects.all()
    
    query = request.GET.get('q', '')
    if query:
        products = products.filter(name__icontains=query)
```

3. **Check HTMX request in network tab:**
   - Should see GET request to `/dashboard/products/?q=search_term`
   - With `HX-Request: true` header

---

## Issue 11: Colors/Sizes not saving

**Symptoms:**
- Select colors/sizes in form
- Product saves but no colors/sizes attached

**Solution:**

Must call `form.save_m2m()` after saving:

```python
if form.is_valid():
    product = form.save(commit=False)
    product.slug = slugify(product.name)
    product.save()
    form.save_m2m()  # Important for ManyToMany fields!
```

---

## Issue 12: RichTextField not showing properly

**Symptoms:**
- Description field shows as plain textarea
- No rich text editor

**Solution:**

CKEditor should be in `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    ...
    'ckeditor',
]
```

For dashboard, we use plain textarea. If you want rich editor in dashboard:

```python
# dashboard/forms.py
from ckeditor.widgets import CKEditorWidget

class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorWidget())
```

---

## Issue 13: Permission denied errors

**Error:**
```
PermissionDenied at /dashboard/
```

**Solution:**

User must be staff:

```python
# In Django shell
from users.models import User
user = User.objects.get(username='your_username')
user.is_staff = True
user.is_superuser = True  # Optional
user.save()
```

Or check view decorator:
```python
def staff_required(user):
    return user.is_staff  # Returns True only if user.is_staff is True
```

---

## Issue 14: Database errors

**Error:**
```
django.db.utils.OperationalError: no such table: dashboard_*
```

**Solution:**

Dashboard app has no models, so no migrations needed. But if you see this:

```bash
python manage.py migrate
python manage.py makemigrations
python manage.py migrate
```

---

## Issue 15: URL not found

**Error:**
```
NoReverseMatch at /dashboard/
Reverse for 'product_list' not found
```

**Solution:**

1. **Check dashboard URLs are included in main urls.py:**
```python
# backend/backend/urls.py
urlpatterns = [
    path('dashboard/', include('dashboard.urls')),
]
```

2. **Check dashboard/urls.py has app_name:**
```python
# dashboard/urls.py
app_name = 'dashboard'

urlpatterns = [
    path('products/', views.product_list, name='product_list'),
]
```

3. **Use correct namespace in templates:**
```html
{% url 'dashboard:product_list' %}  <!-- Correct -->
{% url 'product_list' %}            <!-- Wrong -->
```

---

## Quick Debugging Checklist

When something doesn't work:

1. ✅ Check terminal for Django errors
2. ✅ Check browser console (F12) for JS errors
3. ✅ Check Network tab for failed requests
4. ✅ Verify user `is_staff = True`
5. ✅ Verify all packages installed: `pip list`
6. ✅ Verify static files loading: View page source
7. ✅ Clear browser cache: Ctrl+Shift+R
8. ✅ Restart Django server
9. ✅ Check DEBUG = True in settings

---

## Getting Help

If issue persists:

1. **Django Logs**: Check terminal output
2. **Browser Console**: Press F12 → Console
3. **Network Tab**: Press F12 → Network
4. **Django Debug Toolbar**: Install for detailed debugging
5. **Python Shell**: Test queries manually

```bash
python manage.py shell

from products.models import Product
Product.objects.all()
```

---

## Common Error Messages Decoded

| Error | Meaning | Solution |
|-------|---------|----------|
| `No module named 'X'` | Package not installed | `pip install X` |
| `NoReverseMatch` | URL name not found | Check urls.py and {% url %} |
| `PermissionDenied` | User not staff | Set `is_staff = True` |
| `CSRF verification failed` | Missing CSRF token | Add `{% csrf_token %}` |
| `IntegrityError` | Database constraint | Check unique fields |
| `OperationalError` | Database issue | Run migrations |

---

## Pro Tips

1. **Always check terminal first** - Django errors show here
2. **Use browser devtools** - Network tab shows HTMX requests
3. **Enable Django debug toolbar** - For detailed debugging
4. **Test in incognito mode** - Eliminates cache issues
5. **Check one thing at a time** - Isolate the problem

---

**Most issues are solved by:**
1. Installing dependencies: `pip install -r requirements.txt`
2. Setting user as staff: `user.is_staff = True`
3. Restarting server after code changes

---

*Last Updated: January 2026*
