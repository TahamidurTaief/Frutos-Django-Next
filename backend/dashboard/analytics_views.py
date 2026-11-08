"""
Dashboard Analytics Views
Enhanced dashboard with comprehensive data visualizations
"""

import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from products.models import Product, Category, Brand
from orders.models import Order, OrderItem, OrderPayment
from users.models import User
from shops.models import Shop


def staff_required(user):
    """Check if user is staff"""
    return user.is_staff


@login_required
@user_passes_test(staff_required)
def enhanced_dashboard(request):
    """
    Enhanced dashboard with comprehensive analytics and visualizations
    """
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. KPI CARDS - Key Performance Indicators
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # Products metrics
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    out_of_stock_products = Product.objects.filter(
        Q(stock__lte=0) | Q(stock__isnull=True)
    ).count()
    
    # Orders metrics
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status=Order.OrderStatus.PENDING).count()
    processing_orders = Order.objects.filter(status=Order.OrderStatus.PROCESSING).count()
    completed_orders = Order.objects.filter(status=Order.OrderStatus.DELIVERED).count()
    
    # Revenue calculation - using Order total_amount for delivered orders
    total_revenue = Order.objects.filter(
        status=Order.OrderStatus.DELIVERED
    ).aggregate(
        total=Sum('total_amount')
    )['total'] or Decimal('0.00')
    
    # Users metrics
    total_users = User.objects.count()
    total_customers = User.objects.filter(user_type='CUSTOMER').count()
    total_sellers = User.objects.filter(user_type='SELLER').count()
    
    # Recent 30 days comparison
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_orders = Order.objects.filter(ordered_at__gte=thirty_days_ago).count()
    
    # Calculate percentage changes (if we have historical data)
    sixty_days_ago = timezone.now() - timedelta(days=60)
    previous_period_orders = Order.objects.filter(
        ordered_at__gte=sixty_days_ago,
        ordered_at__lt=thirty_days_ago
    ).count()
    
    orders_change_percentage = 0
    if previous_period_orders > 0:
        orders_change_percentage = ((recent_orders - previous_period_orders) / previous_period_orders) * 100
    
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. PIE CHARTS DATA
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # Order Status Distribution (Pie Chart)
    order_status_data = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    order_status_labels = []
    order_status_series = []
    for item in order_status_data:
        # Get human-readable status label
        status_label = dict(Order.OrderStatus.choices).get(item['status'], item['status'])
        order_status_labels.append(status_label)
        order_status_series.append(item['count'])
    
    # Product Category Distribution (Pie Chart)
    category_data = Product.objects.filter(
        is_active=True
    ).values(
        'sub_category__category__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:6]  # Top 6 categories
    
    category_labels = []
    category_series = []
    for item in category_data:
        category_name = item['sub_category__category__name'] or 'Uncategorized'
        category_labels.append(category_name)
        category_series.append(item['count'])
    
    # Payment Method Distribution
    payment_method_data = OrderPayment.objects.values('payment_method').annotate(
        count=Count('id')
    ).order_by('-count')
    
    payment_method_labels = []
    payment_method_series = []
    for item in payment_method_data:
        payment_method_labels.append(item['payment_method'] or 'Unknown')
        payment_method_series.append(item['count'])
    
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. BAR CHARTS DATA
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # Orders per Day (Last 7 Days) - Bar Chart
    seven_days_ago = timezone.now() - timedelta(days=7)
    orders_per_day = Order.objects.filter(
        ordered_at__gte=seven_days_ago
    ).annotate(
        date=TruncDate('ordered_at')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Prepare data for bar chart
    orders_daily_labels = []
    orders_daily_series = []
    for item in orders_per_day:
        orders_daily_labels.append(item['date'].strftime('%b %d'))
        orders_daily_series.append(item['count'])
    
    # Revenue per Month (Last 6 Months) - Bar Chart
    six_months_ago = timezone.now() - timedelta(days=180)
    revenue_per_month = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID,
        ordered_at__gte=six_months_ago
    ).annotate(
        month=TruncMonth('ordered_at')
    ).values('month').annotate(
        total=Sum('total_amount')
    ).order_by('month')
    
    revenue_monthly_labels = []
    revenue_monthly_series = []
    for item in revenue_per_month:
        revenue_monthly_labels.append(item['month'].strftime('%b %Y'))
        # Convert Decimal to float for JSON serialization
        revenue_monthly_series.append(float(item['total']))
    
    # Top 5 Selling Products - Bar Chart
    top_products = OrderItem.objects.values(
        'product__name'
    ).annotate(
        total_quantity=Sum('quantity')
    ).order_by('-total_quantity')[:5]
    
    top_products_labels = []
    top_products_series = []
    for item in top_products:
        product_name = item['product__name'] or 'Unknown Product'
        # Truncate long product names
        if len(product_name) > 30:
            product_name = product_name[:27] + '...'
        top_products_labels.append(product_name)
        top_products_series.append(item['total_quantity'])
    
    # Top 5 Brands by Sales - Bar Chart
    top_brands = Product.objects.filter(
        is_active=True,
        brand__isnull=False
    ).values(
        'brand__name'
    ).annotate(
        product_count=Count('id')
    ).order_by('-product_count')[:5]
    
    top_brands_labels = []
    top_brands_series = []
    for item in top_brands:
        top_brands_labels.append(item['brand__name'])
        top_brands_series.append(item['product_count'])
    
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 4. ADDITIONAL STATS
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    total_shops = Shop.objects.count()
    active_shops = Shop.objects.filter(is_active=True).count()
    
    # Average order value
    avg_order_value = Order.objects.filter(
        payment_status=Order.PaymentStatus.PAID
    ).aggregate(
        avg=Avg('total_amount')
    )['avg'] or Decimal('0.00')
    
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # Context for Template
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    context = {
        # KPI Cards
        'total_products': total_products,
        'active_products': active_products,
        'out_of_stock_products': out_of_stock_products,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'processing_orders': processing_orders,
        'completed_orders': completed_orders,
        'total_revenue': total_revenue,
        'total_users': total_users,
        'total_customers': total_customers,
        'total_sellers': total_sellers,
        'total_shops': total_shops,
        'active_shops': active_shops,
        'avg_order_value': avg_order_value,
        'recent_orders': recent_orders,
        'orders_change_percentage': round(orders_change_percentage, 2),
        
        # Pie Charts - JSON encoded for JavaScript
        'order_status_labels': json.dumps(order_status_labels),
        'order_status_series': json.dumps(order_status_series),
        'category_labels': json.dumps(category_labels),
        'category_series': json.dumps(category_series),
        'payment_method_labels': json.dumps(payment_method_labels),
        'payment_method_series': json.dumps(payment_method_series),
        
        # Bar Charts - JSON encoded for JavaScript
        'orders_daily_labels': json.dumps(orders_daily_labels),
        'orders_daily_series': json.dumps(orders_daily_series),
        'revenue_monthly_labels': json.dumps(revenue_monthly_labels),
        'revenue_monthly_series': json.dumps(revenue_monthly_series),
        'top_products_labels': json.dumps(top_products_labels),
        'top_products_series': json.dumps(top_products_series),
        'top_brands_labels': json.dumps(top_brands_labels),
        'top_brands_series': json.dumps(top_brands_series),
    }
    
    return render(request, 'dashboard/analytics_home.html', context)
