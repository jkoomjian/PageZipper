/*------------------------ Menu Stuff ----------------------------*/
PageZipper.prototype.addMenu = function() {
	var css = "																																\
		#pgzp_menu a, #pgzp_menu a * {border: 0; text-decoration: none;}																	\
		#pgzp_menu {position: fixed; top: 0px; right: 8px; padding: 0px 5px; background-color: #D3D3D3; color: black; z-index: 2147483647;}	\
		.pgzp_block {display: block; float: left; line-height: 32px;}																		\
		.pgzp_button {display: block; width: 32px; height: 32px;}																			\
		a.pgzp_button_prev_active {background: transparent url('${media_path}32-gnome-prev.png') no-repeat scroll top left; }				\
		a:hover.pgzp_button_prev_active {background-image: url('${media_path}32-gnome-prev_red.png'); }										\
		a.pgzp_button_prev_inactive {background: transparent url('${media_path}32-gnome-prev_gray.png') no-repeat scroll top left; }		\
		a.pgzp_button_next_active {background: transparent url('${media_path}32-gnome-next.png') no-repeat scroll top left; }				\
		a:hover.pgzp_button_next_active {background-image: url('${media_path}32-gnome-next_red.png'); }										\
		a.pgzp_button_next_inactive {background: transparent url('${media_path}32-gnome-next_gray.png') no-repeat scroll top left; }		\
		#pgzp_button_compat {padding-left: 6px;}																							\
		.pgzp_button_compat_active {background: transparent url('${media_path}compat-mode.png') no-repeat scroll 4px 4px;}					\
		.pgzp_button_compat_inactive {background: transparent url('${media_path}compat-mode-inactive.png') no-repeat scroll 4px 4px;}		\
		#pgzp_curr_page {font-size: 24px;}																									\
		#pgzp_loaded_pages {font-size: 18px;}																								\
	";

	var html = "																																							\
		<div id='pgzp_menu'>																																				\
			<a href='#' id='pgzp_button_prev' class='pgzp_block pgzp_button pgzp_button_prev_active' title='Previous - Cntrl Up or Cntrl <'></a>	\
			<a href='#' id='pgzp_button_next' class='pgzp_block pgzp_button pgzp_button_next_active' title='Next - Cntrl Down or Cntrl >'></a>	\
			<div class='pgzp_block' style='padding-left: 5px;'><span id='pgzp_curr_page' title='Current Page'>1</span><span id='pgzp_loaded_pages' title='Pages Loaded'>/1</span></div>								\
			<a href='#' id='pgzp_button_compat' class='pgzp_block pgzp_button pgzp_button_compat_inactive' title='Compatibility Mode - Slower, but less likely to encounter problems'></a>	\
			<a href='http://www.printwhatyoulike.com/pagezipper' target='_blank' title='PageZipper Home' class='pgzp_block pgzp_button' style='margin-left: -6px'>			\
				<img src='${media_path}zipper_32.png' alt='PageZipper!' style='border-width: 0px' />										\
			</a>																																							\
		</div>																																								\
	";	
	
	//replace ${media_path} with actual value
	css = pgzp().jq.trim( css.replace(/\$\{media_path\}/g, pgzp().media_path) );
	html = pgzp().jq.trim( html.replace(/\$\{media_path\}/g, pgzp().media_path) );

	//insert css
	var cssElem = pgzp().doc.createElement('style');
	cssElem.setAttribute("type", "text/css");
	if (cssElem.styleSheet) {
		cssElem.styleSheet.cssText = css; //IE only
	} else {
		cssElem.appendChild( pgzp().doc.createTextNode(css) );	//everyone else
	}
	pgzp().doc.getElementsByTagName('head')[0].appendChild(cssElem);

	//insert html
	var div = pgzp().doc.createElement("div");
	div.innerHTML = html;
	div = div.childNodes[0];
	pgzp().doc.body.appendChild(div);

	//add event handlers
	var assignLinkHandler = function(linkId, eventHandler) {
		//require pgzp().doc for FF ext :-(
		var link = pgzp().doc.getElementById(linkId);
		pgzp().jq(link).bind("click", function(event) {
			eventHandler();
			event.preventDefault ? event.preventDefault() : event.returnValue = false;
			return false;
		});
	}
	assignLinkHandler("pgzp_button_prev", function(){pgzp().goToNext(-1)});
	assignLinkHandler("pgzp_button_next", function(){pgzp().goToNext(1)});
	assignLinkHandler("pgzp_button_compat", function(){pgzp().toggleCompatMode()});
}

PageZipper.prototype.removeMenu = function() {
	var menu = pgzp().doc.getElementById('pgzp_menu');
	if (menu) pgzp().doc.body.removeChild(menu);
}

PageZipper.prototype.menuIncrementPagesLoaded = function(numPages) {
	var loadedPages = pgzp().doc.getElementById("pgzp_loaded_pages"), num;
	if (loadedPages) {
		//just to make this more confusing, parseInt is in window, not window.content in ff-extension
		num = parseInt(loadedPages.textContent.replace("/", "", "g"), 10);
		num = numPages ? numPages : num+1;
		loadedPages.textContent = "/" + num;
	}
}

PageZipper.prototype.menuSetCurrPageNumber = function(currPage) {
	var currPageObj = pgzp().pages[currPage - 1];
	pgzp().doc.getElementById("pgzp_curr_page").textContent = currPage;
	
	//disable/enable arrows as required
	if (pgzp().displayMode == "text") {
		pgzp().updateButtonState((currPage != 1), "prev"); //if on first page, prev disabled, else enabled
		pgzp().updateButtonState((currPage != pgzp().pages.length), "next"); //if on last page next, disabled, else enabled
	} else {
		var top = pgzp().screen.getScrollTop();
		
		//for prev, only disable when we are above first img on first page
		var displayPrev = (pgzp().findPos(pgzp().pages[0].posterImgs[0]).y < top)
		pgzp().updateButtonState(displayPrev, "prev");
		//for next, disble if currPage == lastPage and we are below last image on page
		var disableNext = 	(currPage == pgzp().pages.length && 
							currPageObj.posterImgs && 
							pgzp().findPos( currPageObj.posterImgs[ currPageObj.posterImgs.length-1 ] ).y < (top+pgzp().poster_image_min_vmargin+1)
							);
		pgzp().updateButtonState(!disableNext, "next");
	}
}

//buttonName = 'prev' or 'next' or 'compat'
PageZipper.prototype.updateButtonState = function(enable, buttonName) {
	var button = pgzp().doc.getElementById("pgzp_button_" + buttonName);
	var activeClass = "pgzp_button_" + buttonName + "_active";
	var inactiveClass = "pgzp_button_" + buttonName + "_inactive";
	
	if (enable) {
		pgzp().css.replaceClass(button, inactiveClass, activeClass);
	} else {
		pgzp().css.replaceClass(button, activeClass, inactiveClass);
	}
	
	if (buttonName == 'compat') {
		button.title = enable ? button.title.replace('disabled', 'enabled') : button.title.replace('enabled', 'disabled');
	}
}

/*------------------------- Menu Events ----------------------*/
PageZipper.prototype.keyDown = function(event) {
	//pgzp().log("key down: " + event.which, true);
	switch (event.which) {
		//down arrow, >
		case 40:
		case 190:
			if (pgzp().ctrl_key_pressed) {
				pgzp().goToNext(1);
				pgzp().noBubble(event);
			}
			break;
		//up arrow, <
		case 38:
		case 188:
			if (pgzp().ctrl_key_pressed) {
				pgzp().goToNext(-1);
				pgzp().noBubble(event);
			}
			break;
		//seperate handler for cntrl
		//treat apple key like cntrl
		case 17:
		case 224:
			pgzp().ctrl_key_pressed = true;
			break;
	}
}

PageZipper.prototype.keyUp = function(event) {
	//pgzp().log("key up: " + event.which, true);
	switch (event.which) {
		//cntrl
		case 17:
		case 224:
			pgzp().ctrl_key_pressed = false;
			break;
	}
}

/*------------------------- Page Stuff ----------------------*/
PageZipper.prototype.goToNext = function(inc){
	var currPageIndex = pgzp().getViewableCurrentPage(pgzp().getCurrentPage());
	
	if (pgzp().displayMode == 'text') {
		pgzp().goToNextPage(inc, currPageIndex);
	} else {
		if (inc > 0)
			pgzp().goToNextPosterImage();
		else
			pgzp().goToPreviousPosterImage();
	}
}

PageZipper.prototype.goToNextPage = function(inc, currPageIndex) {
	var currPage, pos, amountToScroll, ps;
	currPageIndex += inc;
	if (currPageIndex in pgzp().pages) {
		currPage = pgzp().pages[currPageIndex].inPageElem;
		//if currPage has a p elem, scroll to first p
//		ps = currPage.getElementsByTagName("p");
//		//make sure this p is visible
//		if (ps.length > 0 && pgzp().css.getStyle(ps[0], "display") != "none" && pgzp().findPos(ps[0]).y > 10) {
//			amountToScroll = pgzp().findPos(ps[0]).y - pgzp().screen.getScrollTop() - 40;	//a little margin
//		} else {
			amountToScroll = pgzp().findPos(currPage).y - pgzp().screen.getScrollTop();
//		}
		pgzp().win.scrollBy(0, amountToScroll);
	}
}