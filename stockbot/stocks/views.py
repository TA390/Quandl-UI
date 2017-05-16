# LIBRARY IMPORTS
# ----------------------------------------------------------------------------------------

# Standard library imports
from __future__ import unicode_literals

# Core django imports
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.views.generic import View

# Thrid party app imports

# Project imports
from stockbot.quandl_api import DatabaseAPI, DatatableAPI, DatasetAPI

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

database_api = DatabaseAPI()
datatable_api = DatatableAPI()
dataset_api = DatasetAPI()

# ----------------------------------------------------------------------------------------

class IndexView(View):

	template_name = 'stocks/index.html'


	def get(self, request, *args, **kwargs):
		
		#print( database_api.database_list(page=10) )

		return render(request, self.template_name, {})

# ----------------------------------------------------------------------------------------



