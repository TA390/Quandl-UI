
/* ------------------------------------------------------------------------------------ */

(function(){

"use strict";

	/*

	*/	
	function DatabaseList(){

		this.table = $("#databases");
		this.page_number = $("#page_number");
		this.columns = ["name", "database_code", "description", "premium"];

		$("#load_databases a").on("click", {self: this}, this.submit);
		$("#databases a.download_db").on("click", {self: this}, this.download);

	}

	DatabaseList.prototype = {

		constructor: DatabaseList,

		/* ---------------------------------------------------------------------------- */
		/*
			Submit the form and redirect the page if successful or display an error 
			message back to the user.
		*/
		submit: function(e){

			e.preventDefault();

			var self = e.data.self, a = this;

			$.ajax({

					type: "GET",
					url: this.getAttribute("href"),
						
				})
						
				/* Params: server data, status code, xhr */
				.done(function(data, sc, xhr){

					var databases = data.databases;
					var code_url = "";
					
					for(var i in databases){

						var database = databases[i];

						var row = $("<tr>").attr("class", "row");

						for(var j in self.columns){

							var name = self.columns[j];
							var column = $("<td>").attr("class", name);

							if((/code/i).test(name)) {

								code_url = name + "/";

							}

							var value = database[name];
							var isPremiumColumn = (/premium/i).test(name)
							column.append( isPremiumColumn ? Quandl.capitalise(value.toString()) : value);
							row.append(column);

							if(isPremiumColumn) {

								name = "download"
								column = $("<td>").attr("class", name);
								
								var anchor = $("<a>")
									.attr({"class": "download_db", "href": "/databases/download/" + code_url})
									.text(Quandl.capitalise(name));

								column.append(anchor);
								row.append(column);

							}

						}

						self.table.append(row);

					}


					var meta = data.meta;

					self.page_number.empty().append(meta.current_page);

					if(meta.next_page === null){

						a.remove();

					} else{

						a.href = a.href.replace(/(databases[/])\d+/, "$1"+meta.next_page);

					}

				})	

				.fail(function(xhr){

					Quandl.messages(xhr.responseText, false, 5000);
					
			});

		},

		/* ---------------------------------------------------------------------------- */
		/*
			Download database.
		*/
		download: function(e){

			e.preventDefault();

			var anchor = this;

			anchor.disabled = true;
			Quandl.Animate.pulse(anchor, true);

			$.ajax({

					type: "GET",
					url: this.getAttribute("href"),
						
				})
						
				/* Params: server data, status code, xhr */
				.done(function(data, sc, xhr){

					Quandl.messages(data.message, false, 5000);

				})	

				.fail(function(xhr){

					console.log(xhr);

					Quandl.messages(xhr.responseText, false, 0);
					
				})

				.always(function(){

					anchor.disabled = false;
					Quandl.Animate.pulse(anchor, false);

			});

		}

	}


	/* DOCUMENT READY FUNCTION */
	/* -------------------------------------------------------------------------------- */
	$(function(){
		
		new DatabaseList();

	});

/* ------------------------------------------------------------------------------------ */
}());

