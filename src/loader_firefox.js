/*------------------------- Load FF Extension ----------------------*/
function _pgzpInitExtension() {
	window.pgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.loader_type = "ffextension";
	pgzp.media_path = browser.extension.getURL("/");
	pgzp.loadPageZipper();
}