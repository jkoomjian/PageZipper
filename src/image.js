/*------------------------- Image Stuff ----------------------*/
//return array of all poster images on page
PageZipper.prototype.getPosterImagesOnPage = function(page) {
	var posterImgs = [], filteredImages = [];
	var okImgDomains = {"www.flickr.com": 1};
	var isFillerImg = function(img) {

		//ignore all images of size less than 100x100 - these can't possibly be big enough to be poster images
		if ( (img.offsetWidth * img.offsetHeight) < (100 * 100) ) {
			filteredImages.push(img);
			return true;
		}
		
		//ignore images which are links to different domains - ie ads, widgets, or logos pointing to home page
		var p = img.parentNode;
		if (p.nodeType == Node.ELEMENT_NODE && p.tagName.toLowerCase() == "a") {
			//pgzp().log("domain: " + pgzp().getDomain(p.href) + " diff domain: " + (pgzp().getDomain(p.href) != pgzp().currDomain) + " home: " + (p.href == ('http://' + pgzp().currDomain)));
			if (pgzp().getDomain(p.href) != pgzp().currDomain && okImgDomains[pgzp().getDomain(p.href)] != 1) {
				return true;
			}
		}
		
		return false;
	}
	
	var getBiggestImg = function(imgs) {
		var biggestImg = null;
		for (var i=0; i<imgs.length; i++) {
			if (biggestImg == null || ((imgs[i].offsetWidth * imgs[i].offsetHeight) > (biggestImg.offsetWidth * biggestImg.offsetHeight))) {
				biggestImg = imgs[i];
			}
		}
		return biggestImg;
	}

	//get all images on given page
	var imgs = pgzp().convertToArray( page.getElementsByTagName("img") );
	//pgzp().logList(imgs, "#imgs: " + imgs.length + " + urls", "#{o.src}: #{o.parentNode.tagName} url: #{o.parentNode.href}");
	
	//filter out unimportant images
	pgzp().filter(imgs, isFillerImg);
	//pgzp().logList(imgs, "#imgs: " + imgs.length + " + urls after filter", "#{o.src}: #{o.parentNode.tagName} url: #{o.parentNode.href}");

	if (imgs.length < 2) return imgs;  //if 0 or 1 imgs, just return 
					
	//sort by size
	imgs.sort(function(a, b) {
					var sizeA = a.offsetWidth * a.offsetHeight;
					var sizeB = b.offsetWidth * b.offsetHeight;
					return sizeB - sizeA;
				});
	//pgzp().logList(imgs, "imgs ordered by size", "#{o.offsetWidth * o.offsetHeight}\t#{o.src}");

	//if just 1 img per page, return biggest img
	if (pgzp().onePosterPerPageMode) return [ imgs[0] ];
	
	//Add back in the largest filtered image
	//the idea here is that we are looking for a series of large images, all about the same size
	//we find these by comparing to the sizes of the other images on the page, and finding the largest gaps between image sizes
	//so we need 1 image we know is outside the group to compare against
	//since biggestSmallImg image is smallest in imgs, it will always get filtered out
	var biggestSmallImg = getBiggestImg(filteredImages);
	if (biggestSmallImg) imgs.push(biggestSmallImg);
	
	//mark the largest gap in size between image sizes, then delete all images after the gap
	var biggestGap = [0, 1]; //gap, index of bigger elem
	for (var i=1; i<imgs.length; i++) {
		var bigger = imgs[i-1], biggerSize = bigger.offsetHeight * bigger.offsetWidth;
		var smaller = imgs[i], smallerSize = smaller.offsetHeight * smaller.offsetWidth;
		var relGap = (biggerSize == 0 || smallerSize == 0 ? 0 : (biggerSize / smallerSize)), absGap = (biggerSize - smallerSize), totalGap = (relGap * absGap);
		//pgzp().log("rel gap: " + relGap + " abs gap: " + absGap + " total gap: " + totalGap + " smallerSize: " + smallerSize + " biggerSize: " + biggerSize + " smaller img: " + imgs[i].src);
		if (totalGap >= biggestGap[0]) {
			biggestGap = [totalGap, i];
		}
	}
	
	//remove all images after the gap
	//pgzp().log("biggest gap: " + biggestGap[0] + " at img: " + imgs[biggestGap[1]].src);
	imgs.splice(biggestGap[1], (imgs.length - biggestGap[1]) );
	
	//return poster imgs, ordered by y position - top to bottom
	imgs.sort(function(a, b) {
				return pgzp().findPos(a).y - pgzp().findPos(b).y;
			});
	//pgzp().logList(imgs, "#poster imgs: " + imgs.length + " ordered by y", "#{pgzp().findPos(o).y}\t#{o.src}");
			
	return imgs;
}

//if a given image is taller than the viewport, resize the image to fit perfectly in the viewport
PageZipper.prototype.resizeImageToViewport = function(img) {
	var usableViewport = pgzp().screen.getViewportHeight() - pgzp().poster_image_margin_top - pgzp().poster_image_margin_bottom;
	if (img.offsetHeight > usableViewport) {
		//scale image
		img.style.width = ( usableViewport / img.offsetHeight ) * img.offsetWidth + 'px';
		img.style.height = usableViewport + 'px';
	}
}

//go to the next poster image
//TODO combine goToNext and goToPrevious
PageZipper.prototype.goToNextPosterImage = function() {
	var browserBorderTop = pgzp().screen.getScrollTop() + pgzp().poster_image_margin_top + 1; //start looking for next poster image below this line
	var top_margin;
	
	for (var i=0; i<pgzp().pages.length; i++) {
		//calculate the largest image here - we leave this as late as possible b/c all images on page have to be loaded
		if (pgzp().pages[i].posterImgs == null) pgzp().pages[i].posterImgs = pgzp().getPosterImagesOnPage(pgzp().pages[i].elemContent);
		
		for (var j=0; j<pgzp().pages[i].posterImgs.length; j++) {
			var currPosterImg = pgzp().pages[i].posterImgs[j];
			var pos = pgzp().findPos(currPosterImg);
			//pgzp().log("page " + i + " of " + pgzp.pages.length + " : " + pos.y + " body: " + pgzp.pages[i].page + " " + pgzp.pages[i].page.id);
			//array should be ordered top to bottom
			if (pos.y > browserBorderTop) {
				
				//make sure this is not a centered image
				if (currPosterImg["pgzpCenterOffset"] && ((parseInt(currPosterImg["pgzpCenterOffset"], 10) + browserBorderTop) >= pos.y)) continue; 
				
				pgzp().resizeImageToViewport(currPosterImg);
				
				//center image
				var center_margin = (pgzp().screen.getViewportHeight() - currPosterImg.offsetHeight) / 2
				if (center_margin > pgzp().poster_image_margin_top) {
					top_margin = center_margin;
					currPosterImg["pgzpCenterOffset"] = center_margin;
				} else {
					top_margin = pgzp().poster_image_margin_top;
				}
				
				var amountToScroll = pos.y - top_margin - pgzp().screen.getScrollTop();
				pgzp().win.scrollBy(0, amountToScroll);
				return;
			}
		}
	}
}

PageZipper.prototype.goToPreviousPosterImage = function() {
	var browserBorderBottom = pgzp().screen.getScrollTop() + pgzp().screen.getViewportHeight() - pgzp().poster_image_margin_top - 1; //start looking for next poster above below this line
	var top_margin;
	
	//iterate from bottom to top- find first image w/top above browser top
	for (var i=(pgzp().pages.length-1); i>=0; i--) {
		if (pgzp().pages[i].posterImgs == null) pgzp().pages[i].posterImgs = pgzp().getPosterImagesOnPage(pgzp().pages[i].elemContent);
		
		for (var j=(pgzp().pages[i].posterImgs.length-1); j>=0; j--) {
			var currPosterImg = pgzp().pages[i].posterImgs[j];
			var pos = pgzp().findPos(currPosterImg);
			//array should be ordered top to bottom
			if (pos.y < browserBorderBottom) {
				
				//make sure this is not a centered image
				if (currPosterImg["pgzpCenterOffset"] && ((parseInt(currPosterImg["pgzpCenterOffset"], 10) + pgzp().screen.getScrollTop() - 1) <= pos.y)) continue;
				
				pgzp().resizeImageToViewport(currPosterImg);

				//center image
				var center_margin = (pgzp().screen.getViewportHeight() - currPosterImg.offsetHeight) / 2
				if (center_margin > pgzp().poster_image_margin_top) {
					top_margin = center_margin;
					currPosterImg["pgzpCenterOffset"] = center_margin;
				} else {
					top_margin = pgzp().poster_image_margin_top;
				}

				var amountToScroll = (pos.y - top_margin) - pgzp().screen.getScrollTop();
				pgzp().win.scrollBy(0, amountToScroll);
				return;
			}
		}
	}
}