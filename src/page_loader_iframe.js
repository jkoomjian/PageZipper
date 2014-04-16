/*------------------------- Load Page With Iframe ----------------------*/
function PageZipperIframe() {

	//takes a url, returns a div containing the body content of the page at url
	this.loadPage = function(url) {
		var ifrspan = pgzp().doc.createElement('span');
		//ffextensions really do not like onload - call it in some weird dimension where pgzp() is not defined
		var onloadstr = pgzp().loader_type == "ffextension" ? "" : "onload=\"pgzp().iframe.processPageAddComplete('pgzp_page"+pgzp().pages.length+"')\"";

		ifrspan.innerHTML = "<iframe id='pgzp_page"+pgzp().pages.length+"' class='pgzp_page_added' "+onloadstr+" style='clear: both; display: block; border-width: 0; overflow: hidden;' scroll='no' frameBorder='0'></iframe>";
		var ifr = ifrspan.childNodes[0];
		pgzp().jq(pgzp().doc).find("#pgzp_iframe_placeholder").append(ifr);
		ifr.src = url;
		pgzp().runOnIframeLoad(ifr, pgzp().iframe.processPageAdd);
		ifr.style.width = (pgzp().doc.body.offsetWidth -5) + 'px';
	}
	
	//Call as soon as Dom is ready
	this.processPageAdd = function() {
		var iframe = pgzp().jq(pgzp().doc).find(".pgzp_page_added").last()[0]; //get the last iframe loaded
		var nextPage = pgzp().buildPage(iframe.src, iframe);
		pgzp().pages.push(nextPage);
		pgzp().url_list.push( nextPage.url );  //track urls we've already loaded, so they don't get loaded again
		pgzp().iframe.setIFrameHeight(nextPage);
		pgzp().menuIncrementPagesLoaded();
		pgzp().jq(nextPage.ifrDoc).bind("keydown", this.keyDown);
		pgzp().jq(nextPage.ifrDoc).bind("keyup", this.keyUp);
		nextPage.nextLinkObj = pgzp().getNextLink( nextPage.elemContent ); //very slow- do this after the page has been loaded
		pgzp().is_loading_page = false;
	}
	
	//Call once everything is fully loaded
	this.processPageAddComplete = function(ifrId) {
		var page = pgzp().iframe.getPageById(ifrId); //sometimes this is called before the iframe is loaded
		if (page) pgzp().iframe.setIFrameHeight(page);
	}
	
	this.setIFrameHeight = function(page) {
		page.inPageElem.style.height = pgzp().getDocumentHeight(page.ifrDoc) + 'px';
	}
	
	//check for abs pos and abs position the iframe if necessary
	this.setAbsolutePositioning = function(page) {
		var origDocH, ifr = page.inPageElem;
		
		//get the element before this one in doc.body
		var iframes = pgzp().jq(pgzp().doc).find(".pgzp_page_added");
		if (iframes.length >= 2) {
			origDocH = iframes[iframes.length-2].pgzpDocHeightAfterAdd;
		} else {
			origDocH = pgzp().doc.body.pgzpDocHeightAfterAdd;
		}
		
		var pos = pgzp().findPos(ifr)
		if (pos.y < Math.max(origDocH-50, 10)) {
			ifr.style.position = "absolute";
			ifr.style.top = origDocH + "px";
			ifr.style.left = "0px";
		}
	}
	
	this.getPageById = function(id) {
		for (var i=0; i<pgzp().pages.length; i++) {
			if (pgzp().pages[i].ifrId && pgzp().pages[i].ifrId == id) {
				return pgzp().pages[i]
			} 
		}
		return null;
	}
}

/* Determine if the iframe dom is ready
 * we cant use onload b/c that waits until every single file in the html page is loaded - takes forever
 * amazingly, I couldn't find a good solution for this problem on the net
 * this solution is pretty basic, but seems to work
 */
PageZipper.prototype.runOnIframeLoad = function(iframeElem, callback) {
	pgzp()._ril_ifr = iframeElem;
	pgzp()._ril_callback = callback;
	pgzp()._ril_int = pgzp().win.setInterval(pgzp()._runOnIframeLoad2, 50); //check every 50msec
}
PageZipper.prototype._runOnIframeLoad2 = function() {
	var ifrDoc = pgzp()._ril_ifr.contentWindow.document, validReadyStates = /loaded|interactive|complete/;

	//IE seems to not handle interactive state properly - dom is still being created when readyState = interactive
	if (pgzp().jq.browser.msie) {
		validReadyStates = /loaded|complete/
	}

	//pgzp().log("readyState: " + ifrDoc.readyState);
	if (
		ifrDoc.body &&	//checking for body b/c chrome has a bizarre habit of starting in readyState=complete and then switch to readyState=loading
		ifrDoc.body.childNodes.length > 0 &&
		validReadyStates.test(ifrDoc.readyState)
		) {
		//Dom has loaded!
		pgzp().win.clearInterval(pgzp()._ril_int);
		pgzp()._ril_callback();
	}
}