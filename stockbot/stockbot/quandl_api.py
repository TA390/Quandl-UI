# LIBRARY IMPORTS
# ----------------------------------------------------------------------------------------

# Standard library imports
from __future__ import unicode_literals
import inspect, quandl, re, requests

# Core django imports
from django.db import DatabaseError, transaction

# Thrid party app imports

# Project imports
from .serialisers import serialiser

# ----------------------------------------------------------------------------------------

class QuandlException(Exception):

	pass

# ----------------------------------------------------------------------------------------

class QuandlMixin(object):

	base_url = 'https://www.quandl.com/api/v3/'

	api_path = None


	def __init__(self, *args, **kwargs):

		if self.api_path == None:

			raise QuandlException("Base classes of QuandlMixin must define the variable 'api_path'.")

		quandl.ApiConfig.api_key ='nVgbWuDRbve9PmH5z1uq'


	def url(self, *paths, **params):
		"""
		Return the request url.

		@param args: Url path.
		@param params: Url parameters.
		"""

		url = self.base_url + '/'.join(path for path in paths if path != None)

		params['api_key'] = quandl.ApiConfig.api_key
		
		url += '?' + '&'.join(n + '=' + str(params[n]) for n in params)

		return url


	def get_request(self, *path, include_api_path=True, **params):
		"""
		Get request.

		@param path: Url path.
		"""

		api_path = self.api_path if include_api_path else None

		return self.response( requests.get(self.url(api_path, *path, **params)) )


	def response(self, response, fail_silently = True):
		"""
		Return the response of an API request as a JSON object.

		@param response: Request response.
		@param fail_silently: If False, raise an exception if the request fails.
		"""

		data = response.json()

		status_code = str(response.status_code)


		if status_code.startswith("20") == False:

			error = data.get('quandl_error', {})

			if fail_silently:

				data.update({

					'error_message': error.get('message', 'Error') + ' (Quandl Code: ' + error.get('code', 'Unknown') +').'

				})

			else:

				caller = ''

				stack = inspect.stack()

				for level in stack:

					caller = level[3]

					if re.match('(response|get_request)$', caller) == None:

						break

				raise QuandlException(

					caller + '(): ' +
					'status code - ' + status_code +
					', quandl code - ' + error.get('code', 'Unknown') + 
					', message - ' + error.get('message', 'Error')

				)

		return data


	def quandl_response(self, quandl_callback, *args, fail_silently=True, **kwargs):
		"""
		Wrap quandl functions to capture errors raised by the API.

		@param fail_silently: If False, raise an exception if the request fails.
		"""

		try:

			return quandl_callback(*args, **kwargs)

		except Exception as e:

			if fail_silently == False:

				raise e

			return {'error_message': str(e)}



# ----------------------------------------------------------------------------------------

class DatabaseAPI(QuandlMixin):

	api_path = 'databases'


	def download(self, database_code, download_type="complete", filename=None):
		"""
		Download an entire database as a csv file. Only premium databases that support 
		time-series datasets can be downloaded via this route.

		@param database_code: Database short code.
		@param download_type: String ("partial" or "complete"). If “partial”, returns last 
		day of data. If “complete”, returns entire database.
		@param filename: File name (including path) given to the downloaded csv file.
		"""

		if filename == None:

			filename = './media/downloads/databases/%s.zip' %(database_code)

		return self.quandl_response(quandl.bulkdownload, database_code, download_type=download_type, filename=filename)


	def database_list(self, **kwargs):
		"""
		Return a list of all databases on Quandl, along with their respective metadata. 
		Databases are returned 'per_page' results at a time. You can page through the 
		results using the 'page' and 'per_page' parameters.

		@param per_page: Number of results per request (Default: 100).
		@param page: Page to return (Default: 1).
		"""
		return self.get_request('databases.json', include_api_path=False, **kwargs)


	def dataset_list(self, database_code):
		"""
		For databases that support the datasets API route, this call gets a list of 
		available datasets within the database, in the form of a zipped CSV file. This 
		call is not available for databases that do not support the datasets API route.
	
		@param database_code: Database short code.
		"""
		return self.get_request(database_code, 'codes.csv')


	def search(self, **kwargs):
		"""
		Search for specific databases on Quandl. The API will return all databases 
		related to your query.
		
		@param query: Search keywords. Separate multiple keywords with a '+' character (Default: None).
		@param per_page: Number of results per request (Default: 100).
		@param page: Page to return (Default: 1).
		"""
		return self.get_request('databases.json', include_api_path=False, **kwargs)


	def metadata(self, database_code):
		"""
		Get metadata for a specified database. This method is only available for databases 
		that support time-series dataset views. It is not available for databases that 
		support datatable views.

		@param database_code: Database short code.
		"""

		return self.get_request('.'.join((database_code, "json")))


	def is_premium(self, database_code):
		"""
		Return True if the database is premium, False if not and None if the request
		failed.

		@param database_code: Database short code.
		"""

		data = self.metadata(database_code).get('database')

		return data.get('premium')


	def description(self, database_code):
		"""
		Return True if the database is premium, False if not and None if the request
		failed.

		@param database_code: Database short code.
		"""

		data = self.metadata(database_code).get('database')

		return None if data == None else data.get('name', '') + ': ' + data.get('description', '')

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

class DatatableAPI(QuandlMixin):

	api_path = 'datatables'


	def datatable(self, datatable_code, paginate = False):
		"""
		This API call returns an entire datatable, including all rows and columns, subject 
		to a limit of 10,000 rows. If the datatable has more than 10,000 rows, the first 
		10,000 rows are returned along with a cursor pointing to the next set of rows to 
		download.

		@param datatable_code: Datatable short code (Format: Database code/Datatable code).
		@param paginate: If true, all rows will be returned.
		"""

		return quandl.get_table(datatable_code, paginate = paginate)


	def filter_row(self, datatable_code, **rows):
		"""
		This API call returns an entire datatable, including all rows and columns, subject 
		to a limit of 10,000 rows. If the datatable has more than 10,000 rows, the first 
		10,000 rows are returned along with a cursor pointing to the next set of rows to 
		download.

		@param datatable_code: Datatable short code (Format: Database code/Datatable code).
		@param rows: Key value pairs (row_name = filter_value OR (filter_values, )).
		"""

		return quandl.get_table(datatable_code, **rows)


	def filter_col(self, datatable_code, cols):
		"""
		Filter columns in a datatable.

		@param datatable_code: Datatable short code (Format: Database code/Datatable code).
		@param cols: List or Tuple of column names.
		"""

		return quandl.get_table(datatable_code, qopts={'columns': cols})


	def filter(self, datatable_code, cols=(), **rows):
		"""
		Filter rows and columns.

		@param datatable_code: Datatable short code (Format: Database code/Datatable code).
		@param cols: List or Tuple of column names.
		@param rows: Key value pairs (row_name = filter_value OR (filter_values, )).
		"""

		return quandl.get_table(datatable_code, qopts={'columns': cols}, **rows)

# ----------------------------------------------------------------------------------------




# ----------------------------------------------------------------------------------------

class DatasetAPI(QuandlMixin):

	api_path = 'datasets'


	def get_data(self, dataset_code, returns=None, **params):
		"""
		Return data from the specified dataset.

		@param dataset_code: Dataset short code (Format: Database code/Dataset code).
		@param returns: Return format ("numpy" or "pandas", default: "pandas").
		@param params: See get().
		"""

		return quandl.get(dataset_code, returns=returns, **params)


	def get_metadata(self, dataset_code, **params):
		"""
		Return metadata for the specified dataset.

		@param dataset_code: Dataset short code (Format: Database code/Dataset code).
		"""

		return quandl.Dataset(dataset_code).data_fields()


	def get(self, dataset_code, **params):
		"""
		Return data and metadata for the specified dataset. Call data() on the returned
		object for data and data_fields() for metadata.

		@param dataset_code: Dataset short code (Format: Database code/Dataset code).
		@param params: Query parameters:
			
			See https://www.quandl.com/docs/api?python#customize-your-dataset.

			limit (int): Use limit=n to get the first n rows of the dataset. Use limit=1 
				to get just the latest row.
			column_index (int): Request a specific column. Column 0 is the date column and 
				is always returned. Data begins at column 1.
			start_date (string): "yyyy-mm-dd" - Retrieve data rows on and after the 
				specified start date.
			end_date (string): "yyyy-mm-dd" - Retrieve data rows up to and including the 
				specified end date.
			order (string) "asc" or "desc" - Return data in ascending or descending order 
				of date. Default is “desc”.
			collapse (string): "none", "daily", "weekly", "monthly", "quarterly", 
				"annual" - Change the sampling frequency of the returned data. Default is 
				“none” i.e. data is returned in its original granularity.
			transform (string): "none", "diff", "rdiff", "rdiff_from", "cumul", "normalize"
				Perform elementary calculations on the data prior to downloading. Default 
				is “none”. Calculation options are described below.
		"""

		return quandl.Dataset(dataset_code, **params)


	def multi_get(self, *dataset_codes):
		"""
		Request multiple time-series datasets in a single call.

		@param dataset_codes: One or more dataset short code. To request a specific column 
		for each data set specify the index. E.g. "WIKI/FB" (all columns) or 
		"WIKI/FB.3" (column 4).
		"""

		return quandl.get([code for code in dataset_codes])


	def search(self, query, **kwargs):
		"""
		Search for individual datasets on Quandl. The API will return all datasets 
		related to your query as well as datasets that belong to databases related to 
		your query.
		
		@param query: Search keywords. Separate multiple keywords with a '+' character.
		@param database_code: Restrict search results to a specific database.
		@param per_page: Number of results per request (Default: 100).
		@param page: Page to return (Default: 1).
		"""

		return self.get_request('datasets.json', include_api_path=False, **kwargs)

# ----------------------------------------------------------------------------------------



