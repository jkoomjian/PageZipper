PageZipper.prototype.buildPage = function(url, elemContent) {
	var page = {
			'url': url,
			'elemContent': elemContent,		//dom node containing this page's content
			'nextLinkObj': null,			//NextLink obj
			'posterImgs': null,
			'inPageElem': elemContent			
			};
			
	//iframe only
	if (elemContent.tagName.toLowerCase() == "iframe") {
		page.ifrWin = elemContent.contentWindow;
		page.ifrDoc = elemContent.contentWindow.document;
		//page.inPageElem = elemContent;					//dom elem in base page containing iframe (body on 1st page) - used by findPos
		page.elemContent = page.ifrDoc.body;
		page.ifrDoc.pgzp_iframe_id = elemContent.id;
		page.ifrId = elemContent.id;
	}
	
	return page;
}



//takes a url, returns a div containing the body content of the page at url
PageZipper.prototype.loadPage = function(url) {
	pgzp().in_compat_mode ? pgzp().iframe.loadPage(url) : pgzp().ajax.loadPage(url);
}

PageZipper.prototype.addExistingPage = function(url, body) {
	
	var nextPage = pgzp().buildPage(url, body);
	
	if (pgzp().in_compat_mode) {
		pgzp().addIframePlaceholder();
	} else {
		pgzp().ajax.removeAbsolutePositioning(nextPage.elemContent);
	}
	
	pgzp().pages.push(nextPage);

	//must set this here, else will try to get largest image on all of pgzp.doc.body, which may be multiple pages by the time it is called
	nextPage.posterImgs = pgzp().getPosterImagesOnPage(nextPage.elemContent);
	
	//very slow- do this after the page has been loaded
	nextPage.nextLinkObj = pgzp().getNextLink(nextPage.elemContent);

	return nextPage;
}

PageZipper.prototype.addIframePlaceholder = function() {
	var placeholder = pgzp().jq("<div/>").attr('id', 'pgzp_iframe_placeholder').css({position: 'absolute', top: pgzp().jq(document).height()+'px', left: '0px'});
	pgzp().jq(pgzp().doc.body).append(placeholder);
}