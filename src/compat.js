/* Handle Compatibility Mode */

PageZipper.prototype.toggleCompatMode = function() {
	pgzp().is_loading_page = true;	//don't load any more pages
	
	//scroll to top
	pgzp().win.scrollTo(0, 0);
	
	//update menupgzp().addIframePlaceholder();
	pgzp().menuIncrementPagesLoaded(1);
	
	//remove all loaded pages - except existing page!
	while (pgzp().pages.length > 1) {
		var currPage = pgzp().pages.pop();
		pgzp().jq( currPage.elemContent ).remove();
		pgzp().url_list.pop();
	}
	
	//set compat mode
	pgzp().in_compat_mode = !pgzp().in_compat_mode;
	
	//make sure we have the iframe placeholder
	if (pgzp().jq(pgzp().doc).find("#pgzp_iframe_placeholder").length == 0) {
		pgzp().addIframePlaceholder();
	}

	//update menu
	pgzp().updateButtonState(pgzp().in_compat_mode, 'compat');
	
	pgzp().is_loading_page = false;	//resume
}
