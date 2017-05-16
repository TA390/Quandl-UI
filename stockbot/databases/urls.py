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

	url(r'^$', views.DatabasesView.as_view(), name='list'),
	url(r'^(?P<page>[\d]+)/$', views.DatabasesView.as_view(), name='list'),
	
	url(r'^download/(?P<database_code>[\w]+)/$', views.DownloadDatabaseView.as_view(), name='download'),
	
]

# ----------------------------------------------------------------------------------------