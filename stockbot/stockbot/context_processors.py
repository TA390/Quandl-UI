# LIBRARY IMPORTS
# ----------------------------------------------------------------------------------------

# Standard library imports
from __future__ import unicode_literals

# Core django imports
from django.conf import settings

# Thrid party app imports

# Project imports

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

SITE_NAME_KEY = 'site_name'

# ----------------------------------------------------------------------------------------

BASE_TEMPLATE_KEY = 'base_template'

BASE_TEMPLATE_NAME = 'base.html'

BASE_AJAX_TEMPLATE_NAME = 'base_ajax.html'

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

def base_template(request):
	
	return {

		BASE_TEMPLATE_KEY: BASE_TEMPLATE_NAME,
		SITE_NAME_KEY: 'Quandl API'

	}

# ----------------------------------------------------------------------------------------

