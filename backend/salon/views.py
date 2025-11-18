"""
New organized views.py - Clean and modular
This file replaces the old 3986-line views.py with organized imports
"""

# Import all views from the views package
from .views import *

# This file now acts as a clean interface to all views
# The actual views are organized in separate files:
# - base_views.py: Core functionality
# - booking_views.py: Booking related views  
# - blog_views.py: Blog related views
# - auth_views.py: Authentication views
# - utility_views.py: Helper functions

# All views are imported through the views package __init__.py
# This maintains backward compatibility while organizing the code
