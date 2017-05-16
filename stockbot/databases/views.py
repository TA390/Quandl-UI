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
from stockbot.quandl_api import DatabaseAPI

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

database_api = DatabaseAPI()

# ----------------------------------------------------------------------------------------

class DatabasesView(View):

	template_name = 'databases/list.html'

	def get(self, request, page=1, *args, **kwargs):

		q = request.GET.get('q', '').strip()

		if q:

			data = database_api.search(query=re.sub(r'\s+', '+', q), page=page)
			
		else:

			data = database_api.database_list(page=page, per_page=20)


		print(data)
			

		context = { 

			'databases': data.get('databases'), 
			'meta': data.get('meta'),
			'message': data.get('error_message'),
			'q': q

		}

		if request.is_ajax():

			return JsonResponse(context, status=200 if context['message'] == None else 403)

		return render(request, self.template_name, context)

# ----------------------------------------------------------------------------------------

class DownloadDatabaseView(View):

	def get(self, request, database_code, *args, **kwargs):

		data = database_api.download(database_code)
		
		context = { 'message': data.get('error_message', '%s downloaded.' %(database_code)) }


		if request.is_ajax():

			return JsonResponse(context, status=200)

		else:

			return redirect('databases:list')


# ----------------------------------------------------------------------------------------
