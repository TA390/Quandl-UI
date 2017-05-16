/*

	Site wide javascript file

	Dependencies: JQuery 

*/




/* ------------------------------------------------------------------------------------ */

function debug(e){
	
	var msg = "DEBUG: " + e

	console.log(msg);

	// alert(msg);

}

/* ------------------------------------------------------------------------------------ */








/* POLYFILLERS */
/* ------------------------------------------------------------------------------------ */

if (!Function.prototype.bind){

	Function.prototype.bind = function(oThis) {
		
		if(typeof this !== "function"){

			throw new TypeError(

				"Function.prototype.bind - what is trying to be bound is not callable"

			);
		
		}

		var a = Array.prototype.slice.call(arguments, 1),
		
		FtoB = this,
		
		FN = function(){},
		
		FB = function(){

			return FtoB.apply(

				this instanceof FN ? this : oThis,
				a.concat(Array.prototype.slice.call(arguments))

			);

		};

		if (this.prototype) {

			// Function.prototype doesn't have a prototype property
			FN.prototype = this.prototype; 
		
		}
		
		FB.prototype = new FN();

		return FB;
	
	};

}

/* ------------------------------------------------------------------------------------ */
/*
	Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
*/
if(!("firstElementChild" in document.documentElement)){

	Object.defineProperty(Element.prototype, "firstElementChild", {
	
		get: function(){
			
			for(var nodes = this.children, n, i = 0, l = nodes.length; i < l; ++i){
				
				if(n = nodes[i], 1 === n.nodeType){

					return n;
				
				}

			}

			return null;
		}

	});

}

/* ------------------------------------------------------------------------------------ */
/*
	Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
*/
if(!("lastElementChild" in document.documentElement)){

	Object.defineProperty(Element.prototype, "lastElementChild", {

		get: function(){

			for(var nodes = this.children, n, i = nodes.length - 1; i >= 0; --i){
				
				if(n = nodes[i], 1 === n.nodeType){

					return n;
			
				}

			}

			return null;
		
		}

	});
}

/* ------------------------------------------------------------------------------------ */

if(!Array.isArray){

	Array.isArray = function(arg) {
		
		return Object.prototype.toString.call(arg) === '[object Array]';
		
	};
		
}

/* ------------------------------------------------------------------------------------ */








/* ------------------------------------------------------------------------------------ */
/*
	Global namespace.
*/
window.Quandl = {

	/* -------------------------------------------------------------------------------- */
	/*
		Common css classes.
	*/
	cls: {

		hide: "hide",
		show: "show",
		open: "open",
		hidden: "hidden",
		disabled: "disabled",
		modal: "modal",
		modal_open: "modal_open"

	},

	/* -------------------------------------------------------------------------------- */
	/*
		"Click" event.
	*/
	evts: {

		click: "click"

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Temporary class instances removed with each page load.
	*/
	Temp: {},

	/* -------------------------------------------------------------------------------- */

	getMediaURL: function(url){

		return "/media/" + url;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Error messages displayed for request errors.

		@param xhr: xhr instance.
		@param codes: Optional object of codes/messages. If null no messages are displayed.
	*/
	requestError: function(xhr, codes){

		if(codes === null){

			return codes;

		} else{

			var messages = {

				0: "Please check your internet connection.",
				
				403: "Sorry, your request has been denied.",
				
				404: "Sorry, we could not find the page you were looking for.",

				500: "Sorry, the server did not send anything back.",

			}


			codes = codes || {};

			for(var c in codes){

				messages[c] = codes[c];

			}


			return messages[xhr.status] || codes.all;

		}

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return true if the global xhr instance is available for use. The xhr is available 
		if it is not in use or "reference" matches the current reference.

		@param reference: Optional reference assigned to the xhr instance so it can be 
			identified by its caller. The xhr instance is always available to its caller.
	*/
	requestAvailable: function(reference){

		return (

			Quandl.xhr === undefined || 
			Quandl.xhr.reference !== undefined && Quandl.xhr.reference === reference

		);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Acquire the xhr instance if it is free.

		@param reference: Optional reference assigned to the xhr instance
	*/
	acquireRequest: function(reference){

		if(Quandl.requestAvailable(reference)){

			Quandl.xhr = {reference: reference};

		}

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Release the xhr instance.

		@param reference: Optional reference assigned to the xhr instance.
	*/
	releaseRequest: function(reference){

		if(reference === undefined || Quandl.requestAvailable(reference)){

			Quandl.xhr = undefined;

		}

	}, 

	/* -------------------------------------------------------------------------------- */
	/*
		Make a request and return the xhr instance.

		@param request: Request data object.
		@param reference: Optional reference assigned to the xhr instance.
		@param manual_release: Boolean - if true the xhr instance will not be released
			automatically on completion.
	*/
	request: function(request, reference, manual_release){

		if(Quandl.xhr !== undefined && Quandl.xhr.abort !== undefined){

			Quandl.xhr.abort();

		}

		Quandl.xhr = $.ajax(request)

			.fail(function(xhr){

				var messages = xhr.responseJSON && xhr.responseJSON.messages;

				if(messages === undefined || messages.length === 0){

					messages = Quandl.requestError(xhr, request.codes);

				}

				Quandl.messages(messages);

			})

			.always(function(){

				if(manual_release !== true){

					Quandl.releaseRequest();

				}

		});

		Quandl.xhr.reference = reference;

		return Quandl.xhr;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return the current url.
	*/
	getURL: function(){
	
		return location.pathname + location.search;
	
	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return the ID of the main element.
	*/
	getMainID: function(){

		return "main_content";

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return the the main element.
	*/
	getMain: function(){
	
		return document.getElementById("main_content");
	
	},
	
	/* -------------------------------------------------------------------------------- */
	/*
		Replace the current page with the page at "url".

		@param url: Page url. Defaults to the current page.
	*/
	replacePage: function(url){
	
		window.location.replace(url || Quandl.getURL());
	
	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Return "html" as a document fragment.

		@param html: String of html.
	*/
	createFragment: function(html){

		var d = document.createDocumentFragment();
		
		d.appendChild(document.createElement("div")).innerHTML = html;
		
		return d;

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Return an element contained in a document fragment. IE does not recognise
		getElementByID consistently.

		@param fragment: Document fragment.
		@param id: Element id.
	*/
	getFragment: function(fragment, id){

		if(fragment.getElementById === undefined){
		
			return fragment.querySelector("#" + id);
		
		}
		
		return fragment.getElementById(id);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return the element by its ID.

		@param id: Element id.
		@param selector: Optional query selector.
	*/
	get: function(id, selector){

		var e = document.getElementById(id);

		return (e === null || selector === undefined) ? e : e.querySelector(selector);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Create a new element.

		@param tag: Element tag name.
		@param attrs: Optional object of attributes.
		@param text: Optional text string.
	*/
	create: function(tag, attrs, text){

		var e = document.createElement(tag);
		
		for(var n in attrs){

			e.setAttribute(n, attrs[n]);

		}
		
		if(text !== undefined){

			e.appendChild(document.createTextNode(text));
		
		}

		return e;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Remove all child nodes of an element.

		@param element: Node element.
	*/
	empty: function(element){

		if(element){

			while(element.firstChild){

				element.removeChild(element.firstChild);

			}

			return element;

		}

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Remove all element passed to the function.

		@param *: Node Elements.
	*/
	remove: function(){
		
		for(var i=0; i<arguments.length; i++){
		
			if(arguments[i] && arguments[i].parentNode !== null){
		
				arguments[i].parentNode.removeChild(arguments[i]);
		
			}
		
		}

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Replace old_elem with with new_elem.s
	*/
	replace: function(new_elem, old_elem){

		return old_elem.parentNode.replaceChild(new_elem, old_elem);

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Append all elements in "array" to "element".

		@param element: Node element.
		@param array: Array of node/text elements.
		@param clone: If true shallow clone the elements instead of moving them.
	*/
	append: function(element, array, clone){


		for(var i=array.length-1, reference=null, node; i>=0; --i){

			node = array[i];

			if(node){

				if(node.nodeType === node.ELEMENT_NODE || node.nodeType === node.TEXT_NODE){

					if(clone){

						node = node.cloneNode(false);

					}

					reference = element.insertBefore( node, reference );

				}

			}

		}

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return true if child is a descendant of parent and false if not.

		@param parent: Parent element that contains child.
		@param child: Element to find.
		@param depth: Max number of iterations (Defaults to 5).
	*/
	isDescendant: function(parent, child, depth){

		depth = depth || 5;
	
		for(var node = child.parentNode; node !== null && depth > 0; --depth){
			
			if(node===parent){
			
				return true;
			
			}
			
			node = node.parentNode;
		
		}
		
		return false;

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Return true if the browser supports a particular feature, else return false.

		@param attr: Name of the attribute to test for (e.g. mulitple)
		@param element: Element or Element tag name.
	*/
	isAttributeSupported: function(attr, element){

		if(element.nodeType===undefined){

			element = document.createElement(element); 

		}

		return element[attr] !== undefined;

	},

	/* ------------------------------------------------------------------------------------ */
	/*
		Return true if the event is supports.

		http://perfectionkills.com/detecting-event-support-without-browser-sniffing/

		@param name: Event name.
		@param element: Optional element to test the event against.
	*/
	isEventSupported: (function(){
	
		var TAGNAMES = {
	
			"select":"input",
			"change":"input",
			"input": "input",
			"submit":"form",
			"reset":"form",
			"error":"img",
			"load":"img",
			"abort":"img"
	
		}
		
		function isEventSupported(name, element) {
			
			if(element===undefined || element.nodeType===undefined){

				element = document.createElement(element || TAGNAMES[name] || "div");
			
			}
			
			name = "on" + name;

			var isSupported = (name in element);
			
			if (!isSupported) {
			
				element.setAttribute(name, "return;");
			
				isSupported = typeof element[name] == "function";
			
			}
			
			element = null;

			return isSupported;
		
		}
		
		return isEventSupported;

	})(),

	/* ------------------------------------------------------------------------------------ */
	/* 
		Return a class instance that inherits "prototype".

		@param prototype: Object.
	*/
	inherit: function(prototype){

		/* Dummy constructor function */
		function f(){}

		/* Assign to it the prototype to inherit */
		f.prototype = prototype;

		/* Return 'subclass' */
		return new f();

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Capitalise the first letter in a string.

		@param str: String.
	*/
	capitalise: function(str){

		return str.charAt(0).toUpperCase() + str.slice(1);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return a regexp to find a class name in a string.

		@param cls: Class name.
	*/
	classRegExp: function(cls){

		return new RegExp("(^|\\s+)" + cls + "(\\s+|$)");

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Return true if "element" has the class "cls" and false otherwise.

		@param element: Javascript element.
		@param cls: Class name.
	*/
	hasClass: function(element, cls){

		return Quandl.classRegExp(cls).test(element.className);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Append the class "cls" to the "element".

		@param element: Javascript element.
		@param cls: Class name.
	*/
	_addClass: function(element, cls){

		element.className += ( element.className === "" ? "" : " " ) + cls;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Append the class "cls" to the "element" if it does not exist.

		@param element: Javascript element.
		@param cls: Class name.
	*/
	addClass: function(element, cls){

		try{
		
			if(Quandl.classRegExp(cls).test(element.className) === false){
		
				Quandl._addClass(element, cls);
		
			}
		
		}catch(e){ 

			// debug(e); 

		}
		
		return element;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Remove the class "cls" from the "element".

		@param element: Javascript element.
		@param cls: Class name.
	*/
	removeClass: function(element, cls){

		try{

			element.className = element.className.replace(Quandl.classRegExp(cls), "$2");
		
		} catch(e){

			// debug(e);

		}

		return element;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Remove the class that matches the regular expression "regexp" and add "cls" to 
		"element".

		@param element: Javascript element.
		@param regex: Regular expression.
		@param cls: Class name.
	*/
	replaceClass: function(element, regexp, cls){

		try{

			element.className = element.className.replace(regexp, "");

			Quandl.addClass(element, cls);
		
		} catch(e){

			// debug(e);

		}

		return element;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Remove the current icon class and add the icon "name" to the element.

		@param element: Javascript element.
		@param name: Icon name (excluding the prefix "icon_").
	*/
	replaceIcon: function(element, name){

		return Quandl.replaceClass(element, /icon_[\w]+/, "icon_" + name);

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Toggle the class "cls" on the "element". Return true if the class has been added
		and false if removed.

		@param element: Javascript element.
		@param cls: Class name.
	*/
	toggleClass: function(element, cls){

		var add_class = Quandl.classRegExp(cls).test(element.className) === false;

		(add_class ? Quandl._addClass : Quandl.removeClass)(element, cls);

		return add_class;

	},

	/* -------------------------------------------------------------------------------- */




	/* CLASSES */
	/* -------------------------------------------------------------------------------- */
	/*
		Simplified version of Function.prototype.bind() for class instances created in 
		Quandl namespace.
	*/
	_bindClsArgs: function(){

		/* Remove the required arguments from the list. See Quandl.newClass arguments */
		var args = Array.prototype.slice.call(arguments, 3);

		/* Bind the arguments */
		function F(){

			return this.constructor.apply(

				this,
				args.concat(Array.prototype.slice.call(arguments))

			);
		
		}

		F.prototype = this.prototype;

		return F;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Create an instance of the class and store a global reference to it in the Quandl
		namespace.
		
		@param Cls: Class
		@param name: Fallback name if Cls.name is not a property.
		@param tmp: Boolean - If true remove the class when the page unloads.
		@params 3..N: arguments passed to the class constructor.
	*/
	newClass: function(Cls, name, tmp){

		try{

			if(Cls.name===undefined){

				Cls.name = name;

			}

			var obj = (tmp===true) ? this.Temp : this;

			obj[Cls.name] = new (this._bindClsArgs.apply(Cls, arguments));

		} catch(e){

			console.log(e);

		}

	},
	
	/* -------------------------------------------------------------------------------- */
	/*
		Store a global reference to a class.

		@param Cls: Class
		@param name: Class name
		@param tmp: Boolean - If true remove the class when the page unloads.
	*/
	refClass: function(Cls, name, tmp){

		if(Cls.name === undefined){

			Cls.name = name;

		}
		
		var obj = (tmp === true ? this.Temp : this);
		
		obj[Cls.name] = Cls;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Remove a reference to a class.

		@param Cls: Class
	*/	
	delClass: function(Cls){

		delete this[Cls.name];

	},

	/* -------------------------------------------------------------------------------- */	
	/*
		Check that the class names passed as arguments are referenced in the Global 
		(window) or temporary (Quandl.Temp) namespace.

		@param fail_silently: Optional boolean to prevent an exception from being thrown.
		@params 0..N: Class names (e.g. "Page", "Menu");.
	*/
	checkTempDependencies: function(fail_silently){

		var i = typeof arguments[0]==="boolean" ? 1 : 0;

		for(; i<arguments.length; ++i){

			if(window[arguments[i]]===undefined && this.Temp[arguments[i]]===undefined){
	
				if(arguments[0]===true){

					return false;

				}
				
				throw new Error("Global dependency missing: " + arguments[i]);

			}

		}

		return true;

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Check that the class names passed as arguments (args) are referenced in the Quandl
		namespace. Thrown an exception or return false if the class has not been defined
		and return true otherwise.

		@param type: typeof value to check the class name against.
		@param name: Name of the check to perform ("dependency" or "reference").
		@param args: Array of class names. A boolean value can be passed as the first
			argument and if true the function will return false instead of throwing an
			exception.
	*/
	_checkQuandlCls: function(type, name, args){

		var i = typeof args[0]==="boolean" ? 1 : 0;

		for(; i<args.length; ++i){

			if(this[args[i]]===undefined || typeof this[args[i]]!==type){

				if(args[0]===true){

					return false;

				}
				
				throw new Error("Missing "+name+": "+args[i]);

			}

		}

		return true;

	},

	/* -------------------------------------------------------------------------------- */	
	/*
		Check that all classes have instances defined in the Quandl namespace.
		
		@param fail_silently: Optional boolean to prevent an exception from being thrown.
		@params 0..N: Class names (e.g. "Page", "Menu");
	*/
	checkDependencies: function(fail_silently){
	
		return this._checkQuandlCls("object", "dependency", arguments);
	
	},
	
	/* -------------------------------------------------------------------------------- */
	/*
		Check that all classes have references defined in the Quandl namespace.

		@param fail_silently: Optional boolean to prevent an exception from being thrown.
		@params 0..N: Class names (e.g. "Page", "Menu");
	*/
	checkReferences: function(fail_silently){
	
		return this._checkQuandlCls("function", "reference", arguments);
	
	},
	
	/* END CLASSES */
	/* -------------------------------------------------------------------------------- */




	/* HELPERS */
	/* -------------------------------------------------------------------------------- */
	/*
		Helper function for Class Page.
	*/
	register: function(context){

		if(Quandl.Page !== undefined){

			Quandl.Page.register(context)

		}

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Helper function for Class Message.
	*/
	messages: function(){

		if(Quandl.Message !== undefined){

			Quandl.Message.add.apply(Quandl.Message, arguments);

		}

	},

	/* -------------------------------------------------------------------------------- */
	/*
		Helper function for Class Menu.
	*/
	menus: function(){

		if(Quandl.Menu !== undefined){

			var fn = arguments.length === 1 ? "unregister" : "register";

			Quandl.Menu[fn].apply(Quandl.Menu, arguments);

		}

	},

	/* END HELPERS */
	/* -------------------------------------------------------------------------------- */

};

/* ------------------------------------------------------------------------------------ */








/* GLOBALS */
/* ------------------------------------------------------------------------------------ */
/* 
	(5-Feb-16)
	https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/encodeURI.
	
*/
function fixedEncodeURI(str){

    return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');

}

/* ------------------------------------------------------------------------------------ */
/*
	(5-Feb-16)
	https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/
		encodeURIComponent.
*/
function fixedEncodeURIComponent(str){

	return encodeURIComponent(str).replace(/[!'()*]/g, function(c){

		return '%' + c.charCodeAt(0).toString(16);

	});

}

/* END GLOBALS */
/* ------------------------------------------------------------------------------------ */








/* ------------------------------------------------------------------------------------ */

(function () {


	/* ANIMATE */
	/* -------------------------------------------------------------------------------- */

	function Animate(){


	}

	Animate.prototype = {

		constructor: Animate,

		/* ---------------------------------------------------------------------------- */
		/*
			Upload progress bar.
		*/
		_animate: function(element, start, cls){

			(start ? Quandl.addClass : Quandl.removeClass)(element, cls);

		},

		/* ---------------------------------------------------------------------------- */
		/*
			Upload progress bar.
		*/
		bounce: function(element, start){

			this._animate(element, start, "bounce");

		},

		/* ---------------------------------------------------------------------------- */
		/*
			Upload progress bar.
		*/
		pulse: function(element, start){

			this._animate(element, start, "pulse");

		},

		/* ---------------------------------------------------------------------------- */

	}

	/* -------------------------------------------------------------------------------- */

	Quandl.newClass(Animate, "Animate");

	/* END ANIMATE */
	/* -------------------------------------------------------------------------------- */




	/* MESSAGE */
	/* -------------------------------------------------------------------------------- */
	/*
		Disaply a message at the top of the page.
	*/
	function Message(){

		var button = Quandl.get("messages", "div.container")

			.appendChild( Quandl.create("div", {"class": "close"}) )

			.appendChild(

				Quandl.create("button", {"class": "icon icon_cross", "type": "button"})

		);

		button.appendChild(Quandl.create("span", {"class": "hide"}, "Close"));

		$(button).on(Quandl.evts.click, {self: this}, this.closeHandler);	

		Quandl.removeClass(this.getContainer(), "no_js");
		
	}

	Message.prototype = {

		constructor: Message,

		/* ---------------------------------------------------------------------------- */
		/*
			Return the outermost container.
		*/
		getContainer: function(){
		
			return Quandl.get("messages");
		
		},
		
		/* ---------------------------------------------------------------------------- */
		/*
			Return the messages container.
		*/
		getMessages: function(){
		
			return Quandl.get("messages", "div.text");
		
		},
		
		/* ---------------------------------------------------------------------------- */
		/*
			Hide the messages container and clear the timeout.
		*/
		close: function(){
		
			clearTimeout(this.timeout_id);
		
			Quandl.empty(this.getMessages());
		
			Quandl.removeClass(this.getContainer(), Quandl.cls.show);
		
		},

		/* ---------------------------------------------------------------------------- */
		/*
			Event handler for close().
		*/
		closeHandler: function(e){
		
			e.data.self.close();
		
		},
		
		/* ---------------------------------------------------------------------------- */
		/*
			Remove all messages after a timeout.

			@param time: Optional time in milliseconds.
		*/
		timeout: function(time){
		
			var self = this;
		
			clearTimeout(this.timeout_id);
		
			this.timeout_id = setTimeout(function(){ self.close(); }, time || 4000);
		
		},
		
		/* ---------------------------------------------------------------------------- */
		/*
			Append messages to the message container.
	
			@param messages: String or array of objects containing the properties 
				"message" and "tags" (optional) where tags is a string of class names.
			@param keep: Optional boolean - if true append new messages to the current
				messages, else remove the old messages before displaying the new ones.
			@param time: Optional time in milliseconds. All messages will be removes
				after "time". If zero the message will not timeout. Defaults to 4000.

		*/
		add: function(messages, keep, time){

			if(messages){

				if(Array.isArray(messages) === false){

					messages = [{message: messages}];

				}

				if(messages.length !== 0){

					var msg = this.getMessages();

					/* Clear the current contents if keep is not true */
					if(keep !== true){

						Quandl.empty(msg);
					
					}

					/* Append each message to the message box */
					for(var i in messages){

						var attrs = {};

						if(typeof messages[i] === "string" || messages[i] instanceof String){

							messages[i] = { message: messages[i] };

						}

						if(messages[i].tags){ 

							attrs["class"] = messages[i].tags;
						
						}

						var p = Quandl.create("p", attrs, messages[i].message || "");

						if(Quandl.hasClass(p, "persist")){

							time = 0;

						}

						msg.appendChild(p);

					}

					/* Set a timeout to remove the messages. */
					if(time !== 0){

						this.timeout(time);
					
					}

					/* Display the messages container */
					Quandl.addClass(this.getContainer(), Quandl.cls.show);
				
				}

			}

		},

	}

	/************************************************************************************/

	Quandl.newClass(Message, "Message");

	/************************************************************************************/

	/* END MESSAGE */
	/* -------------------------------------------------------------------------------- */




	/* DOCUMENT READY FUNCTION */
	/* -------------------------------------------------------------------------------- */
	
	$(function(){



	});

	/* -------------------------------------------------------------------------------- */

}());

/* ------------------------------------------------------------------------------------ */



