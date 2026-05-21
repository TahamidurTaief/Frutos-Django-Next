# dashboard/views_dashboard_home.py
"""
Enhanced Dashboard Home View - Integrating Fila Index.html with Real Django Data
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This view provides ALL dynamic data for the dashboard home page.
Data is prepared using optimized Django ORM queries with aggregations.
"""

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Avg, Q, F, DecimalField
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import json

from products.models import Product, Category
from orders.models import Order, OrderItem, OrderPayment
from users.models import User
from shops.models import Shop


@login_required
def dashboard_home_view(request):
    """
    Main dashboard home page with comprehensive e-commerce analytics.
    Integrates the Fila admin template with real backend data.
    """
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. KPI CARDS - Top Level Metrics
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # Total Orders
    total_orders = Order.objects.count()
    
    # Total Customers (CUSTOMER type users)
    total_customers = User.objects.filter(user_type='CUSTOMER').count()
    
    # Total Revenue (only PAID orders)
    total_revenue = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID
    ).aggregate(
        total=Sum('total_amount')
    )['total'] or Decimal('0.00')
    
    # Total Sales Count (completed/delivered orders)
    total_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED
    ).count()
    
    # Monthly metrics (current month)
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED,
        ordered_at__gte=month_start
    ).count()
    
    # Daily metrics (today)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    today_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED,
        ordered_at__gte=today_start
    ).count()
    
    # Calculate percentage changes (last 7 days vs previous 7 days)
    seven_days_ago = now - timedelta(days=7)
    fourteen_days_ago = now - timedelta(days=14)
    
    orders_last_week = Order.objects.filter(
        ordered_at__gte=seven_days_ago
    ).count()
    
    orders_previous_week = Order.objects.filter(
        ordered_at__gte=fourteen_days_ago,
        ordered_at__lt=seven_days_ago
    ).count()
    
    # Calculate order growth percentage
    if orders_previous_week > 0:
        order_growth_percent = ((orders_last_week - orders_previous_week) / orders_previous_week) * 100
    else:
        order_growth_percent = 100.0 if orders_last_week > 0 else 0.0
    
    # Customer growth (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    
    customers_last_month = User.objects.filter(
        user_type='CUSTOMER',
        date_joined__gte=thirty_days_ago
    ).count()
    
    customers_previous_month = User.objects.filter(
        user_type='CUSTOMER',
        date_joined__gte=sixty_days_ago,
        date_joined__lt=thirty_days_ago
    ).count()
    
    if customers_previous_month > 0:
        customer_growth_percent = ((customers_last_month - customers_previous_month) / customers_previous_month) * 100
    else:
        customer_growth_percent = 100.0 if customers_last_month > 0 else 0.0
    
    # Revenue growth
    revenue_last_month = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=thirty_days_ago
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    revenue_previous_month = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=sixty_days_ago,
        ordered_at__lt=thirty_days_ago
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    if revenue_previous_month > 0:
        revenue_growth_percent = float((revenue_last_month - revenue_previous_month) / revenue_previous_month * 100)
    else:
        revenue_growth_percent = 100.0 if revenue_last_month > 0 else 0.0
    
    # Sales Overview - last 20% growth assumption (for the progress bar)
    sales_growth_percent = 20.0
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. CHARTS DATA
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # Total Sales Chart - Last 12 months
    twelve_months_ago = now - timedelta(days=365)
    monthly_sales_data = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=twelve_months_ago
    ).annotate(
        month=TruncMonth('ordered_at')
    ).values('month').annotate(
        total=Sum('total_amount')
    ).order_by('month')
    
    total_sales_chart = {
        'categories': [item['month'].strftime('%b %Y') for item in monthly_sales_data],
        'series': [float(item['total']) for item in monthly_sales_data]
    }
    
    # Profit Chart - Last 30 days (simplified: 10% of order total as profit)
    profit_data = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=thirty_days_ago
    ).annotate(
        day=TruncDate('ordered_at')
    ).values('day').annotate(
        total=Sum('total_amount')
    ).order_by('day')
    
    profit_chart = {
        'categories': [item['day'].strftime('%d %b') for item in profit_data],
        'series': [float(item['total']) * 0.1 for item in profit_data]  # 10% profit margin
    }
    
    # Calculate total profit
    total_profit = total_revenue * Decimal('0.1')  # 10% profit margin
    
    # Average Daily Sales Chart - Last 30 days
    daily_sales_data = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=thirty_days_ago
    ).annotate(
        day=TruncDate('ordered_at')
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    avg_daily_sales_chart = {
        'categories': [item['day'].strftime('%d %b') for item in daily_sales_data],
        'series': [item['count'] for item in daily_sales_data]
    }
    
    avg_daily_sales_value = daily_sales_data.aggregate(avg=Avg('count'))['avg'] or 0
    
    # Revenue Chart - Last 7 days
    seven_days_revenue = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=seven_days_ago
    ).annotate(
        day=TruncDate('ordered_at')
    ).values('day').annotate(
        total=Sum('total_amount')
    ).order_by('day')
    
    revenue_chart = {
        'categories': [item['day'].strftime('%d %b') for item in seven_days_revenue],
        'series': [float(item['total']) for item in seven_days_revenue]
    }
    
    # Order Summary Chart - Order Status Distribution
    order_status_counts = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Map status codes to readable names
    status_mapping = {
        'PENDING': 'Pending',
        'PROCESSING': 'New Order',
        'SHIPPED': 'Completed',
        'DELIVERED': 'Completed',
        'CANCELLED': 'Cancelled',
    }
    
    # Aggregate completed orders (SHIPPED + DELIVERED = 60%)
    completed_count = Order.objects.filter(
        status__in=[Order.OrderStatus.SHIPPED, Order.OrderStatus.DELIVERED]
    ).count()
    
    pending_count = Order.objects.filter(
        status__in=[Order.OrderStatus.PENDING, Order.OrderStatus.PROCESSING]
    ).count()
    
    cancelled_count = Order.objects.filter(
        status=Order.OrderStatus.CANCELLED
    ).count()
    
    order_summary_chart = {
        'labels': ['Completed', 'New Order', 'Pending'],
        'series': [completed_count, pending_count, cancelled_count]
    }
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. TOP SELLING PRODUCTS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    top_products = Product.objects.filter(
        is_active=True
    ).annotate(
        total_sold=Sum('orderitem__quantity'),
        total_revenue=Sum(
            F('orderitem__quantity') * F('orderitem__unit_price'),
            output_field=DecimalField()
        )
    ).filter(
        total_sold__isnull=False
    ).order_by('-total_sold')[:6]
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. TOP SELLERS (Top Customers by Purchase Amount)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    top_sellers = User.objects.filter(
        user_type='CUSTOMER',
        orders__payment_status=Order.PaymentStatus.PAID
    ).annotate(
        total_spent=Sum('orders__total_amount')
    ).order_by('-total_spent')[:6]
    
    # Add rating (mock - you can replace with actual rating logic)
    for seller in top_sellers:
        seller.rating = 5.0  # Mock rating
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 5. RECENT ORDERS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    recent_orders = Order.objects.select_related(
        'user'
    ).prefetch_related(
        'items'
    ).order_by('-ordered_at')[:5]
    
    # Add profit calculation for each order (10% margin)
    for order in recent_orders:
        order.profit = order.total_amount * Decimal('0.1')
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 6. TRANSACTIONS HISTORY (Recent Payments)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    transactions = OrderPayment.objects.select_related(
        'order'
    ).order_by('-created_at')[:6]
    
    # Add transaction type icon, color, and amount using related order
    for transaction in transactions:
        # amount comes from the related order
        transaction.amount = getattr(transaction.order, 'total_amount', Decimal('0.00'))

        # determine positive / negative using order.payment_status
        transaction.is_positive = (getattr(transaction.order, 'payment_status', None) == Order.PaymentStatus.PAID)

        # set icon and color based on payment_method
        pm = transaction.payment_method
        if pm == OrderPayment.PaymentMethod.CARD:
            transaction.type_icon = 'credit_card'
            transaction.type_color = 'primary-50'
            transaction.type_bg = 'ebe9fe'
        elif pm == OrderPayment.PaymentMethod.BKASH:
            transaction.type_icon = 'payments'
            transaction.type_color = 'info'
            transaction.type_bg = 'daf7fb'
        elif pm == OrderPayment.PaymentMethod.NAGAD:
            transaction.type_icon = 'account_balance'
            transaction.type_color = 'danger'
            transaction.type_bg = 'fce4e2'
        else:
            transaction.type_icon = 'payments'
            transaction.type_color = 'primary'
            transaction.type_bg = 'e0f8ea' 
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 7. NEW CUSTOMERS THIS MONTH
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    new_customers_count = User.objects.filter(
        user_type='CUSTOMER',
        date_joined__gte=month_start
    ).count()
    
    new_customers_today = User.objects.filter(
        user_type='CUSTOMER',
        date_joined__gte=today_start
    ).order_by('-date_joined')[:5]
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 8. BEST SELLER OF THE MONTH (Mock Data for Now)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # This could be a seller/shop or top customer
    best_seller = User.objects.filter(
        user_type='CUSTOMER',
        orders__payment_status=Order.PaymentStatus.PAID,
        orders__ordered_at__gte=month_start
    ).annotate(
        monthly_spent=Sum('orders__total_amount')
    ).order_by('-monthly_spent').first()
    
    best_seller_amount = best_seller.monthly_spent if best_seller else Decimal('0.00')
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 9. TOP SALES LOCATIONS (Mock - using User country if available)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # For now, using static data. Replace with actual location data if available
    top_locations = [
        {'name': 'United States', 'flag': 'usa.png', 'percentage': 85},
        {'name': 'China', 'flag': 'china.png', 'percentage': 60},
        {'name': 'Australia', 'flag': 'australia.png', 'percentage': 85},
        {'name': 'Germany', 'flag': 'germany.png', 'percentage': 75},
        {'name': 'Canada', 'flag': 'canada.png', 'percentage': 80},
        {'name': 'France', 'flag': 'france.png', 'percentage': 65},
    ]
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 10. CONTEXT PREPARATION
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    context = {
        # User Info
        'user': request.user,
        
        # KPI Cards
        'total_orders': total_orders,
        'total_customers': total_customers,
        'total_revenue': total_revenue,
        'total_sales': total_sales,
        'monthly_sales': monthly_sales,
        'today_sales': today_sales,
        
        # Growth Percentages
        'order_growth_percent': round(order_growth_percent, 2),
        'order_growth_positive': order_growth_percent >= 0,
        'customer_growth_percent': round(abs(customer_growth_percent), 2),
        'customer_growth_positive': customer_growth_percent >= 0,
        'revenue_growth_percent': round(revenue_growth_percent, 2),
        'revenue_growth_positive': revenue_growth_percent >= 0,
        'sales_growth_percent': sales_growth_percent,
        
        # Profit
        'total_profit': total_profit,
        
        # Average Daily Sales
        'avg_daily_sales_value': round(avg_daily_sales_value, 0),
        
        # Charts Data (converted to JSON for template injection)
        'total_sales_chart': json.dumps(total_sales_chart),
        'profit_chart': json.dumps(profit_chart),
        'avg_daily_sales_chart': json.dumps(avg_daily_sales_chart),
        'revenue_chart': json.dumps(revenue_chart),
        'order_summary_chart': json.dumps(order_summary_chart),
        
        # Tables & Lists
        'top_products': top_products,
        'top_sellers': top_sellers,
        'recent_orders': recent_orders,
        'transactions': transactions,
        
        # New Customers
        'new_customers_count': new_customers_count,
        'new_customers_today': new_customers_today,
        
        # Best Seller
        'best_seller': best_seller,
        'best_seller_amount': best_seller_amount,
        
        # Locations
        'top_locations': top_locations,
    }
    
    return render(request, 'dashboard/index.html', context)


@login_required
def total_revenue_partial(request):
    """Return the Total Revenue card HTML fragment (for HTMX)."""
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    total_revenue = Order.objects.filter(payment_status=Order.PaymentStatus.PAID).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

    revenue_last_month = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=thirty_days_ago
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

    revenue_previous_month = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=sixty_days_ago,
        ordered_at__lt=thirty_days_ago
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

    if revenue_previous_month > 0:
        revenue_growth_percent = float((revenue_last_month - revenue_previous_month) / revenue_previous_month * 100)
    else:
        revenue_growth_percent = 100.0 if revenue_last_month > 0 else 0.0

    context = {
        'total_revenue': total_revenue,
        'revenue_growth_percent': round(revenue_growth_percent, 2),
        'revenue_growth_positive': revenue_growth_percent >= 0,
    }

    return render(request, 'dashboard/partials/total_revenue.html', context)


@login_required
def sales_overview_partial(request):
    """Return the Sales Overview fragment (numbers + progress bar) for HTMX."""
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_sales = Order.objects.filter(status=Order.OrderStatus.DELIVERED).count()

    monthly_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED,
        ordered_at__gte=month_start
    ).count()

    today_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED,
        ordered_at__gte=today_start
    ).count()

    # Basic sales growth (this can be adjusted to use a real comparison window)
    # Compare current month-to-date vs previous month-to-date
    last_month_start = (month_start - timedelta(days=30))
    previous_month_sales = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED,
        ordered_at__gte=last_month_start,
        ordered_at__lt=month_start
    ).count()

    if previous_month_sales > 0:
        sales_growth_percent = ((monthly_sales - previous_month_sales) / previous_month_sales) * 100
    else:
        sales_growth_percent = 100.0 if monthly_sales > 0 else 0.0

    # Normalize and clamp values for UI
    sales_growth_percent = float(sales_growth_percent)
    sales_growth_abs = min(abs(sales_growth_percent), 100.0)
    sales_growth_positive = sales_growth_percent >= 0

    context = {
        'total_sales': total_sales,
        'monthly_sales': monthly_sales,
        'today_sales': today_sales,
        'sales_growth_percent': round(sales_growth_percent, 2),
        'sales_growth_percent_abs': round(sales_growth_abs, 0),
        'sales_growth_positive': sales_growth_positive,
    }

    return render(request, 'dashboard/partials/sales_overview.html', context)


@login_required
def top_selling_partial(request):
    """Return a partial for top selling products filtered by period (HTMX)."""
    period = request.GET.get('period', 'week')
    now = timezone.now()

    if period == 'day':
        cutoff = now - timedelta(days=1)
    elif period == 'week':
        cutoff = now - timedelta(days=7)
    elif period == 'month':
        cutoff = now - timedelta(days=30)
    elif period == 'year':
        cutoff = now - timedelta(days=365)
    else:
        cutoff = None

    qs = Product.objects.filter(is_active=True)

    if cutoff:
        qs = qs.filter(orderitem__order__ordered_at__gte=cutoff, orderitem__order__payment_status=Order.PaymentStatus.PAID)

    top_products = qs.annotate(
        total_sold=Sum('orderitem__quantity'),
        total_revenue=Sum(
            F('orderitem__quantity') * F('orderitem__unit_price'),
            output_field=DecimalField()
        )
    ).filter(total_sold__isnull=False).order_by('-total_sold').distinct()[:6]

    context = {
        'top_products': top_products,
        'period': period,
    }

    return render(request, 'dashboard/partials/top_selling_products.html', context)


@login_required
def order_summary_partial(request):
    """Return the Order Summary chart fragment (for HTMX)."""
    completed_count = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED
    ).count()
    
    pending_count = Order.objects.filter(
        status__in=[Order.OrderStatus.PENDING, Order.OrderStatus.PROCESSING]
    ).count()
    
    cancelled_count = Order.objects.filter(
        status=Order.OrderStatus.CANCELLED
    ).count()
    
    total_orders = completed_count + pending_count + cancelled_count
    
    # Calculate percentages
    if total_orders > 0:
        completed_percent = (completed_count / total_orders) * 100
        pending_percent = (pending_count / total_orders) * 100
        cancelled_percent = (cancelled_count / total_orders) * 100
    else:
        completed_percent = pending_percent = cancelled_percent = 0
    
    context = {
        'completed_count': completed_count,
        'pending_count': pending_count,
        'cancelled_count': cancelled_count,
        'total_orders': total_orders,
        'completed_percent': completed_percent,
        'pending_percent': pending_percent,
        'cancelled_percent': cancelled_percent,
    }
    
    return render(request, 'dashboard/partials/order_summary.html', context)


@login_required
def top_sellers_partial(request):
    """Return the Top Sellers fragment with real customer data (for HTMX)."""
    # Get top customers by total spending
    top_sellers = User.objects.filter(
        user_type='CUSTOMER',
        orders__payment_status=Order.PaymentStatus.PAID
    ).annotate(
        total_spent=Sum('orders__total_amount'),
        order_count=Count('orders', filter=Q(orders__payment_status=Order.PaymentStatus.PAID))
    ).order_by('-total_spent')[:6]
    
    # Add rating based on order count (simple heuristic)
    for seller in top_sellers:
        # 1 order = 3 stars, 5+ orders = 5 stars
        if seller.order_count >= 10:
            seller.rating = 5.0
        elif seller.order_count >= 8:
            seller.rating = 4.5
        elif seller.order_count >= 5:
            seller.rating = 4.0
        elif seller.order_count >= 3:
            seller.rating = 3.5
        elif seller.order_count >= 1:
            seller.rating = 3.0
        else:
            seller.rating = 0.0
    
    context = {
        'top_sellers': top_sellers,
    }
    
    return render(request, 'dashboard/partials/top_sellers.html', context)


@login_required
def recent_orders_partial(request):
    """Return the Recent Orders table fragment with filtering (for HTMX)."""
    # Get filter parameters
    status_filter = request.GET.get('status', 'all')
    search_query = request.GET.get('search', '')
    page_num = request.GET.get('page', 1)
    
    # Base queryset
    orders = Order.objects.select_related('user').order_by('-ordered_at')
    
    # Apply status filter
    if status_filter != 'all':
        if status_filter == 'Shipped':
            orders = orders.filter(status=Order.OrderStatus.DELIVERED)
        elif status_filter == 'Confirmed':
            orders = orders.filter(status=Order.OrderStatus.CONFIRMED)
        elif status_filter == 'Pending':
            orders = orders.filter(status=Order.OrderStatus.PENDING)
        elif status_filter == 'Rejected':
            orders = orders.filter(status=Order.OrderStatus.CANCELLED)
    
    # Apply search filter (search by customer name or order ID)
    if search_query:
        orders = orders.filter(
            Q(user__name__icontains=search_query) |
            Q(id__icontains=search_query)
        )
    
    total_orders = orders.count()
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(orders, 5)  # 5 orders per page
    page_obj = paginator.get_page(page_num)
    
    # Add profit calculation for each order
    recent_orders = list(page_obj.object_list)
    for order in recent_orders:
        order.profit = order.total_amount * Decimal('0.1')  # 10% margin
    
    # Calculate page ranges
    page_range = paginator.page_range
    has_pagination = paginator.num_pages > 1
    
    context = {
        'recent_orders': recent_orders,
        'total_orders': total_orders,
        'page_number': page_obj.number,
        'total_pages': paginator.num_pages,
        'page_range': page_range,
        'has_pagination': has_pagination,
        'page_start': (page_obj.number - 1) * 5 + 1,
        'page_end': min(page_obj.number * 5, total_orders),
    }
    
    return render(request, 'dashboard/partials/recent_orders_table.html', context)