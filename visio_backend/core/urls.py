from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse

def simple_sitemap(request):
    """Simple sitemap placeholder"""
    return HttpResponse(
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        '<url><loc>https://visio-backend-sp1h.onrender.com/</loc></url>'
        '</urlset>',
        content_type='application/xml'
    )

def health_check(request):
    """Health check endpoint for Render"""
    return JsonResponse({'status': 'ok', 'service': 'visio-backend'})

urlpatterns = [
    path('', health_check, name='health'),
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('sitemap.xml', simple_sitemap, name='sitemap'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)