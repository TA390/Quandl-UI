# LIBRARY IMPORTS
# ----------------------------------------------------------------------------------------

# Standard library imports
from __future__ import unicode_literals

# Core django imports
from django.conf.urls import include, url

# Thrid party app imports

# Project imports
from . import views

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

urlpatterns = [

	url(r'^$', views.DatasetsView.as_view(), name='list'),
	url(r'^(?P<page>[\d]+)/$', views.DatasetsView.as_view(), name='list'),
	
]

# ----------------------------------------------------------------------------------------