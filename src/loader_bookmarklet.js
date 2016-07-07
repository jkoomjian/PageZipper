/*------------------------- Load Bookmarklet ----------------------*/

function _pgzpInitBookmarklet() {
	window.pgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.loader_type = "bookmarklet";
	//pgzp.media_path = "http://127.0.0.1/pgzp/src/ffextension/skin/";
	pgzp.media_path = "http://www.printwhatyoulike.com/static/pagezipper/ui/";
	pgzp.loadPageZipper();
}

function _pgzpToggleBookmarklet() {
	if (pgzp.is_running) {
		pgzp.stopPageZipper();
	} else {
		pgzp.runPageZipper();
	}
}

//Start!
_pgzpInitBookmarklet();
_pgzpToggleBookmarklet();
