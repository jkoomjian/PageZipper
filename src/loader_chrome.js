/*------------------------- Load Chrome Extension ----------------------*/

function _pgzpInitExtension() {
	window.pgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.loader_type = "chromeext";
	pgzp.media_path = chrome.extension.getURL("/");
	pgzp.loadPageZipper();
}

/*------------------------- Methods ----------------------*/
function _pgzpToggleBookmarklet() {
	if (pgzp.is_running) {
		pgzp.stopPageZipper();
	} else {
		pgzp.runPageZipper();
	}
}

// /* Check if there is a valid next page. If so start pgzp */
// function _pgzpAutorun() {
// 	//init
// 	window.currPgzp = new PageZipper();
// 	pgzp.win = window;
// 	pgzp.doc = window.document;
// 	pgzp.loader_type = "autorun";
// 	pgzp.loadPageZipper();
// 	pgzp.pages.push({url: pgzp.win.location.href});
//
// 	//check for next link
// 	pgzp.debug = true; //TODO
// 	var nextLink = pgzp.getAutorunNextLink(pgzp.doc.body);
// 	//console.log( nextLink ? "Next url text: " + nextLink.text + " url: " + nextLink.url + " score: " + nextLink.finalScore : "no next link");
// 	this.debug = false;
// 	if (nextLink) {
// 		//there are next pages - start pagezipper!
// 		_pgzpInitExtension();
// 		_pgzpToggleBookmarklet();
// 	}
// }