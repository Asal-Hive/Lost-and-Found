from django.utils.deprecation import MiddlewareMixin


class ExemptAPIFromCSRFMiddleware(MiddlewareMixin):
    """Exempts /api/ endpoints from CSRF protection for ease of development."""
    
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None
