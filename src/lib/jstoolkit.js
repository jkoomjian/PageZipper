/*------------------------- Javascript Toolbox by Matt Kruse ----------------------*/
/**
 * Copyright (c)2005-2008 Matt Kruse (http://www.javascripttoolbox.com/lib/util/source.php)
 * 
 * Dual licensed under the MIT and GPL licenses. 
 * This basically means you can use this code however you want for
 * free, but don't claim to have written it yourself!
 * Donations always accepted: http://www.JavascriptToolbox.com/donate/
 * 
 * Please do not link to the .js files on javascripttoolbox.com from
 * your site. Copy the files locally to your server instead.
 * 
 */

	
// Util function to default a bad number to 0
// --------------------------------------------------------------------
PageZipper.prototype.zero = function(n) {
	return (!pgzp.defined(n) || isNaN(n))?0:n;
};

// Determine if a reference is defined
PageZipper.prototype.defined = function(o) {
	return (typeof(o)!="undefined");
};

/* ******************************************************************* */
/*   CSS FUNCTIONS                                                     */
/* ******************************************************************* */
PageZipper.prototype.css = (function(){
	var css = {};

	// Convert an RGB string in the form "rgb (255, 255, 255)" to "#ffffff"
	css.rgb2hex = function(rgbString) {
		if (typeof(rgbString)!="string" || !pgzp.defined(rgbString.match)) { return null; }
		var result = rgbString.match(/^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/);
		if (result==null) { return rgbString; }
		var rgb = +result[1] << 16 | +result[2] << 8 | +result[3];
		var hex = "";
		var digits = "0123456789abcdef";
		while(rgb!=0) { 
			hex = digits.charAt(rgb&0xf)+hex; 
			rgb>>>=4; 
		} 
		while(hex.length<6) { hex='0'+hex; }
		return "#" + hex;
	};

	// Convert hyphen style names like border-width to camel case like borderWidth
	css.hyphen2camel = function(property) {
		if (!pgzp.defined(property) || property==null) { return null; }
		if (property.indexOf("-")<0) { return property; }
		var str = "";
		var c = null;
		var l = property.length;
		for (var i=0; i<l; i++) {
			c = property.charAt(i);
			str += (c!="-")?c:property.charAt(++i).toUpperCase();
		}
		return str;
	};
		
	// Get the currently-applied style of an object - expects propery in dash form - ex. border-left-width
	css.getStyle = function(o, property) {
		if (o==null) { return null; }
		var val = null;
		var camelProperty = css.hyphen2camel(property);
		// Handle "float" property as a special case
		if (property=="float") {
			val = css.getStyle(o,"cssFloat");
			if (val==null) { 
				val = css.getStyle(o,"styleFloat"); 
			}
		}
		else if (o.currentStyle && pgzp.defined(o.currentStyle[camelProperty])) {
			val = o.currentStyle[camelProperty];
		}
		else if (pgzp.win.getComputedStyle) {
			val = pgzp.win.getComputedStyle(o,null).getPropertyValue(property);
		}
		else if (o.style && pgzp.defined(o.style[camelProperty])) {
			val = o.style[camelProperty];
		}
		// For color values, make the value consistent across browsers
		// Convert rgb() colors back to hex for consistency
		if (/^\s*rgb\s*\(/.test(val)) {
			val = css.rgb2hex(val);
		}
		// Lowercase all #hex values
		if (/^#/.test(val)) {
			val = val.toLowerCase();
		}
		return val;
	};
	
	// Set a style on an object
	css.setStyle = function(o, property, value) {
		if (o==null || !pgzp.defined(o.style) || !pgzp.defined(property) || property==null || !pgzp.defined(value)) { return false; }
		if (property=="float") {
			o.style["cssFloat"] = value;
	  		o.style["styleFloat"] = value;
		} else if (property=="opacity") {
			o.style['-moz-opacity'] = value;
			o.style['-khtml-opacity'] = value;
			o.style.opacity = value;
			if (pgzp.defined(o.style.filter)) {
				o.style.filter = "alpha(opacity=" + value*100 + ")";
			}
		} else {
		  o.style[css.hyphen2camel(property)] = value;
		}
		
		return true;
	};
	
	// Determine if an object or class string contains a given class.
	css.hasClass = function(obj,className) {
		if (!pgzp.defined(obj) || obj==null || !RegExp) { return false; }
		var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
		if (typeof(obj)=="string") {
		  return re.test(obj);
		} else if (typeof(obj)=="object" && obj.className) {
		  return re.test(obj.className);
		}
		return false;
	};
  
	  // Add a class to an object
	css.addClass = function(obj,className) {
		if (typeof(obj)!="object" || obj==null || !pgzp.defined(obj.className)) { return false; }
		if (obj.className==null || obj.className=='') { 
			obj.className = className; 
			return true; 
		}
		if (pgzp.css.hasClass(obj,className)) { return true; }
		obj.className = obj.className + " " + className;
		return true;
	};
  
 	// Remove a class from an object
	css.removeClass = function(obj,className) {
		if (typeof(obj)!="object" || obj==null || !pgzp.defined(obj.className) || obj.className==null) { return false; }
		if (!pgzp.css.hasClass(obj,className)) { return false; }
		var re = new RegExp("(^|\\s+)" + className + "(\\s+|$)");
		obj.className = obj.className.replace(re,' ');
		return true;
	};
  
	// Fully replace a class with a new one
	css.replaceClass = function(obj,className,newClassName) {
		if (typeof(obj)!="object" || obj==null || !pgzp.defined(obj.className) || obj.className==null) { return false; }
		pgzp.css.removeClass(obj,className);
		pgzp.css.addClass(obj,newClassName);
		return true;
	};
	
	return css;
})();


/* ******************************************************************* */
/*   SCREEN FUNCTIONS                                                  */
/* ******************************************************************* */
PageZipper.prototype.screen = (function() {
	var screen = {};
	
	// Get a reference to the body
	screen.getBody = function() {
		if (pgzp.doc.body) {
			return pgzp.doc.body;
		}
		if (pgzp.doc.getElementsByTagName) {
			var bodies = pgzp.doc.getElementsByTagName("BODY");
			if (bodies!=null && bodies.length>0) {
				return bodies[0];
			}
		}
		return null;
	};

	// Get the amount that the main document has scrolled from top
	screen.getScrollTop = function() {
		if (pgzp.doc.documentElement && pgzp.defined(pgzp.doc.documentElement.scrollTop) && pgzp.doc.documentElement.scrollTop>0) {
			return pgzp.doc.documentElement.scrollTop;
		}
		if (pgzp.doc.body && pgzp.defined(pgzp.doc.body.scrollTop)) {
			return pgzp.doc.body.scrollTop;
		}
		return null;
	};
	
	// Get the height of the entire document
	screen.getDocumentHeight = function() {
		var body = pgzp.screen.getBody();
		var innerHeight = (pgzp.defined(self.innerHeight)&&!isNaN(self.innerHeight))?self.innerHeight:0;
		if (pgzp.doc.documentElement && (!pgzp.doc.compatMode || pgzp.doc.compatMode=="CSS1Compat")) {
		    var topMargin = parseInt(pgzp.css.getStyle(body,'margin-top'),10) || 0;
		    var bottomMargin = parseInt(pgzp.css.getStyle(body,'margin-bottom'), 10) || 0;
			return Math.max(body.offsetHeight + topMargin + bottomMargin, pgzp.doc.documentElement.clientHeight, pgzp.doc.documentElement.scrollHeight, pgzp.zero(self.innerHeight));
		}
		return Math.max(body.scrollHeight, body.clientHeight, pgzp.zero(self.innerHeight));
	};
	
	// Get the width of the viewport (viewable area) in the browser window
	screen.getViewportWidth = function() {
    	if (pgzp.doc.documentElement && (!pgzp.doc.compatMode || pgzp.doc.compatMode=="CSS1Compat")) {
			return pgzp.doc.documentElement.clientWidth;
		} else if (pgzp.doc.compatMode && pgzp.doc.body) {
      		return pgzp.doc.body.clientWidth;
		}
		return screen.zero(self.innerWidth);
	};

	// Get the height of the viewport (viewable area) in the browser window
	screen.getViewportHeight = function() {
		if (!pgzp.win.opera && pgzp.doc.documentElement && (!pgzp.doc.compatMode || pgzp.doc.compatMode=="CSS1Compat")) {
			return pgzp.doc.documentElement.clientHeight;
		} else if (pgzp.doc.compatMode && !pgzp.win.opera && pgzp.doc.body) {
			return pgzp.doc.body.clientHeight;
		}
		return pgzp.zero(self.innerHeight);
	};

	return screen;
})();