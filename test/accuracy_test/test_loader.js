/*------------------------- Load Pgzp For Unit Tests ----------------------*/

function pgzp {
	return window.currPgzp;
}

function _pgzpInitBookmarklet() {
	window.currPgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.is_bookmarklet = true;
//	pgzp.media_path = "http://localhost/web/is/ffextension/src/skin/";
	pgzp.media_path = "http://www.printwhatyoulike.com/static/pagezipper/ui/";
	pgzp.jq = jQuery.noConflict(true);
	//add in Node value - ff provides these, but they do not exist for the extension ?!?! Or for IE
	if (!window['Node']) {
	    window.Node = {
		    ELEMENT_NODE: 1,
	    	TEXT_NODE: 3
		}
	}
	//pgzp.currDomain = "localhost");
	pgzp.url_list = [ pgzp.win.location.href ];
}

var _page_zipper_is_bookmarklet = true;
_pgzpInitBookmarklet();