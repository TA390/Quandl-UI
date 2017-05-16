# LIBRARY IMPORTS
# ----------------------------------------------------------------------------------------

# Standard library imports
from __future__ import unicode_literals
import re

# Core django imports
from django.core.urlresolvers import reverse
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import View

# Thrid party app imports

# Project imports
from stockbot.quandl_api import DatabaseAPI, DatasetAPI

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

database_api = DatabaseAPI()
dataset_api = DatasetAPI()

# ----------------------------------------------------------------------------------------

class DatasetsView(View):

	template_name = 'datasets/list.html'

	def get(self, request, page=1, *args, **kwargs):
		
		context = {  }

		return render(request, self.template_name, context)

# ----------------------------------------------------------------------------------------
