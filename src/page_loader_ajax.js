/*------------------------- Load Page In Ajax ----------------------*/
function PageZipperAjax() {
	
	/*----- Add New Page -----*/
	
	//takes a url, returns a div containing the body content of the page at url
	this.loadPage = function(url) {
		//load page
		pgzp.jq.ajax({url: url,
						dataType: 'html',
						success: function(data){
							//try to get only the body, but use the entire doc if we cant locate it
							var results = data.match(/<body.*?>([\w\W]*?)<\/body>/i);
							data = (results && results.length >= 2) ? results[1] : data;
							//remove all js to prevent document.write() from messing us up!
							data = data.replace(/<script[\w\W]*?>[\w\W]*?<\/script>/ig, '')
										.replace(/<script[\w\W]*?\/>/ig, '')
										.replace(/<noscript>([\w\W]*?)<\/noscript>/ig, "$1")
										.replace(/<meta HTTP-EQUIV=["']?refresh["']?[\w\W]*?>/ig, '');
							pgzp.ajax.processPageAdd(url, data);
						}
					});
	}
	
	this.processPageAdd = function(url, nextPageData) {
		
		//store page height - make sure this increases when the new page is added
		var docHeight = pgzp.jq(pgzp.doc).height();

		var nextPage = pgzp.ajax.buildPageFromData(url, nextPageData);
		pgzp.pages.push(nextPage);
		pgzp.url_list.push( nextPage.url );  //track urls we've already loaded, so they don't get loaded again
		pgzp.ajax.copyPage(nextPage.elemContent);
		pgzp.ajax.removeAbsolutePositioning(nextPage.elemContent);
		pgzp.menuIncrementPagesLoaded();
		nextPage.nextLinkObj = pgzp.getNextLink(nextPage.elemContent); //very slow- do this after the page has been loaded
		pgzp.is_loading_page = false;

		//make sure that the page load is working
		//if the doc height hasn't increased by >=100px, switch to compat mode
		if (!pgzp.in_compat_mode) {
			var updatedDocHeight = pgzp.jq(pgzp.doc).height();
			if ((updatedDocHeight - 100) <= docHeight) {
				pgzp.toggleCompatMode();	
			}
		}

		pgzp.mainBlock(); //continue the loop
	}
	
	this.buildPageFromData = function(url, data) {
		var page = pgzp.doc.createElement("div");
		page.id = "pgzp_page" + pgzp.pages.length;
		page.style.clear = 'both';
		page.innerHTML = data;
		return pgzp.buildPage(url, page);
	}
	
	/*----- Utils -----*/
	this.copyPage = function(body) {
		pgzp.doc.body.appendChild(body);
	}
	
	//switch position: absolute with position: relative
	this.removeAbsolutePositioning = function(body) {
		pgzp.jq( pgzp.doc.body ).children().each(function() {
															if (pgzp.jq(this).css("position") == "absolute") pgzp.jq(this).css("position", "static"); 
														});
		}
}