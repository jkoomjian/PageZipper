/*------------------------- Load Chrome Extension ----------------------*/
function _pgzpInitExtension() {
	window.pgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.loader_type = "chromeext";
	pgzp.media_path = chrome.extension.getURL("/");
	pgzp.loadPageZipper();
}