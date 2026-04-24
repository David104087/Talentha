"""
WSGI config for the Talentha IPRA project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "talentha.settings")

application = get_wsgi_application()
