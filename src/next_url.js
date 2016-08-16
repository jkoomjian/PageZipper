/*------------------------- Get Next Page URL ----------------------*/

// Get the 'next' link from the given html
PageZipper.prototype.getNextLink = function(body) {
	var allNextLinks = pgzp.getAllScoredLinks(body);
	if (allNextLinks.length <= 0) return null;

	var highestLink = pgzp.getHighestTotalScore(allNextLinks);

	//keep track of the matching next syn - if it changes, assume we are using a different link and have reached the end of the set
	//stop here if highestLink has a different syn than the first link
	if (pgzp.pages.length > 1 && //don't check on first page
		!pgzp.pages[0].nextLinkObj.isSynNumber() && !highestLink.isSynNumber() &&  //only compare if we are not using page bar
		pgzp.pages[0].nextLinkObj.syn != highestLink.syn)
		return null;
	return highestLink;
};

PageZipper.prototype.getAllScoredLinks = function(body) {
	var allNextLinks = pgzp.getAllNextLinks(body);
	var pageBarInfo = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
	if (pageBarInfo[1]) {
		pgzp.log("looking for page #: " + pageBarInfo[1].text + " w/confidence: " + pageBarInfo[2]);
		pgzp.nextSynonyms[pgzp.nextSynonyms.length-1].syn = pageBarInfo[1].text;	//update nextSynonyms
		pgzp.nextSynonyms[pgzp.nextSynonyms.length-1].weight = pageBarInfo[2];	//update weight/confidence
	}
	pgzp.linkTextIndex = pgzp.indexDuplicateLinks(allNextLinks);
	pgzp.filter(allNextLinks, function(link) {return link.alreadyLoaded;});	//filter out already loaded links, needed by pageBar, but not anymore
	pgzp.scoreLinks(allNextLinks);
	pgzp.normalizeLinks(allNextLinks);
	return allNextLinks;
};

//get all links and score them
PageZipper.prototype.scoreLinks = function(allNextLinks) {
	//if (pgzp.debug) var debugMsg = '';
	for (var trial in pgzp.trials) {
		if (pgzp.trials.hasOwnProperty(trial)) { //block out stuff added by site with Object.prototype
			for (var i=0; i<allNextLinks.length; i++) {
				allNextLinks[i].addScore(trial, pgzp.trials[trial].doScore(allNextLinks[i]));
				//if (pgzp.debug) debugMsg += "\nScore " + trial + " " + allNextLinks[i].text + ": " + allNextLinks[i].getScore(trial);
				//remove any links which scored 0 on containing a keyword - do it here so we don't have to continue scoring links we know are bad
				if (trial == 'contains_next_syn' && allNextLinks[i].getScore('contains_next_syn') <= 0) {
					allNextLinks.splice(i, 1);
					i--;
				}
			}
		}
	}
	//pgzp.log(debugMsg);
};

//normalize scores from 1-100
PageZipper.prototype.normalizeLinks = function(allLinks) {
	for (var trial in pgzp.trials) {
		//block out stuff added by site with Object.prototype, trials not meant to be normailzed
		if (pgzp.trials.hasOwnProperty(trial) && !pgzp.trials[trial].noNormailization) {
			pgzp.normalizeTrialSet(trial, allLinks);
		}
	}
};

//takes a trial name, normalizes all scores to between 0 and 100
PageZipper.prototype.normalizeTrialSet = function(trialName, allLinks) {
	//get highest and lowest scores
	var highest, lowest = 0; //add zero so we don't normalize to 0 and 100 for urls which are 1 char apart
	var i, score, nScore;
	for (i=0; i<allLinks.length; i++) {
		score = allLinks[i].getScore(trialName);
		if (!highest || score > highest) highest = score;
		if (!lowest || score < lowest) lowest = score;
	}

	//now normalize
	// if (pgzp.debug) var debugMsg = 'Normalizing Trial Set: ' + trialName;
	var curve = (highest == lowest) ? 0 : (100 / (highest - lowest));
	for (i=0; i<allLinks.length; i++) {
		score = allLinks[i].getScore(trialName);
		nScore = Math.floor((score - lowest) * curve);
		allLinks[i].addScore(trialName, nScore, true);
		// if (pgzp.debug) debugMsg += "\nNScore " + i + ": " + allLinks[i].text + ": score: " + score + " curve: " + curve + " higest: " + highest + " lowest: " + lowest + " nscore: " + nScore;
	}
	// pgzp.log(debugMsg);
};

//calculate total score
PageZipper.prototype.getHighestTotalScore = function(allNextLinks) {
	var highestScoringLink = null;
	for (var i=0; i<allNextLinks.length; i++) {
		var score = allNextLinks[i].calculateTotalScore();
		if (!highestScoringLink || score >= highestScoringLink.finalScore) {
			highestScoringLink = allNextLinks[i];
		}
	}

	// if (pgzp.debug) {
	// 	var debugMsg = 'Final Score ' + allNextLinks.length;
	// 	allNextLinks.sort(function (a, b) {
	// 						return b.finalScore - a.finalScore;
	// 					});
	// 	for (i=0; i<allNextLinks.length; i++) {
	// 		debugMsg += "\n" + allNextLinks[i].finalScore + ": " + allNextLinks[i].text + ": " + allNextLinks[i].url;
	// 	}
	// 	pgzp.log(debugMsg);
	// }

	return highestScoringLink;
};

PageZipper.prototype.getAllNextLinks = function(body) {
	var allNextLinks = [];
	var links = body.getElementsByTagName("a"); //get all the links in the page

	var pageUrl = pgzp.getUrlWOutAnchors( pgzp.pages[ pgzp.pages.length-1 ].url );
	for (var i=0; i<links.length; i++) {
		// pgzp.log("Curr Domain: "  + pgzp.currDomain + " Link Domain: " + pgzp.getDomain(links[i].href) + " Link url: " + links[i].href + " relative: " + links[i].getAttribute("href"));
		// filter links which are obviously not the next link
		if (
			// has href
			links[i].href &&
			// link points to this domain
			pgzp.getDomain(links[i].href) == pgzp.currDomain &&
			// not an anchor link to the current page
			(links[i].href.indexOf("#") < 0 || pageUrl != pgzp.getUrlWOutAnchors(links[i].href))
			) {
			pgzp.addLinkComponents(links[i], allNextLinks, pgzp.contains(pgzp.url_list, links[i].href)); //mark links we've already loaded
		}
	}
	// pgzp.logList(links, "All Links", "#{o.text}\t#{o.href}");
	return allNextLinks;
};

//returns an array of all NextLink texts that could be derived from this link
PageZipper.prototype.addLinkComponents = function(link, allNextLinks, alreadyLoaded) {
	var NextLink = pgzp.NextLink;

	//depth-first search to find link targets which are children of the <a> elem (ex. an <img> wrapped in a <a>)
	var search = function(rootNode) {
		for (var i=0; i<rootNode.childNodes.length; i++) {
			var curr = rootNode.childNodes[i];

			//check if this node is useful
			if (curr.nodeType == Node.TEXT_NODE && curr.nodeValue && curr.nodeValue.trim().length) {
				var nl = new NextLink(curr.nodeValue, link, alreadyLoaded);
				nl.isVisibleText = true;
				allNextLinks.push(nl);
			//check for image link
			} else if (curr.nodeType == Node.ELEMENT_NODE && curr.tagName.toLowerCase() == "img") {
				if (curr.title) allNextLinks.push(new NextLink(curr.title, link, alreadyLoaded));
				if (curr.alt) allNextLinks.push(new NextLink(curr.alt, link, alreadyLoaded));
				if (curr.src) allNextLinks.push(new NextLink(curr.src, link, alreadyLoaded, false));
			} else {
				//continue
				search(curr);
			}
		}

		if (rootNode.title) allNextLinks.push(new NextLink(rootNode.title, rootNode));
		if (rootNode.alt) allNextLinks.push(new NextLink(rootNode.alt, rootNode));
	};

	search(link);
};


//---------------------------------- Page Bar ---------------------------------------

//determine the current page number from a list of page numbers on the page ie. 1 2 3 4 5
//returns [currPageLink, nextPageLink, confidence]
PageZipper.prototype.getCurrentPageNumberFromPageBar = function(allNextLinks) {
	var allSequences = [], i = 0, currSeq = [], currNextLink, pageBar, pageBarScore = 0, pageNum, tmpPageBarScore;
	var currPageUrl = pgzp.pages[ pgzp.pages.length-1 ].url;

	// returns the next link in pageBar, or null if index is the end
	var nextLinkInPagebar = function(index, pageBar) {
			return (index < pageBar.length - 1) ? pageBar[index + 1] : null;
	};

	var pushCurrSeq = function() {
		if (currSeq.length > 0) {
			allSequences.push(currSeq);
			currSeq = [];
		}
	};

	//first find all consecutive numerical links, put them in allSequences array
	for (i=0; i<allNextLinks.length; i++) {
		currNextLink = allNextLinks[i];

		//only want text which actually appears on the page (one link may have multiple entries in allNextLinks)
		if (!currNextLink.isVisibleText) continue;

		if (!pgzp.isPageBarNumber(currNextLink.text)) {
			pushCurrSeq();
			continue;
		}

		// is a reasonable number
		pageNum = parseInt(currNextLink.text, 10);
		if (pageNum < 0 || pageNum > 1000) {
			pushCurrSeq();
			continue;
		}

		// if this number is less than previous page number, start a new sequence
		if (currSeq.length > 0 && pageNum <= currSeq[ currSeq.length -1 ].pageNum) {
			pushCurrSeq();
			continue;
		}

		currNextLink.pageNum = pageNum;
		currSeq.push(currNextLink);
	}

	if (currSeq.length > 0) allSequences.push(currSeq);

	//now find the sequence numerical links most likely to be the page bar
	for (i=0; i<allSequences.length; i++) {
		tmpPageBarScore = pgzp.__scorePageBar(allSequences[i]);
		if (tmpPageBarScore >= pageBarScore) {
			pageBarScore = tmpPageBarScore;
			pageBar = allSequences[i];
		}
	}
	if (!pageBar) return [null, null, 0];	//no page bar on this page

	//sort pageBar lowest to highest
	pageBar.sort(	function(a,b){
						return a.pageNum - b.pageNum;
					});
	// pgzp.logList(pageBar, "indexes ordered by size", "#{o.pageNum}\t#{o.text}");

	//mark each link in pageBar for later
	for (i=0; i<pageBar.length; i++) pageBar[i].isPageBar = true;

	//some page bars include links for the current page- ex. 1 2 3 4 where 1 is a link which is highlighted
	for (i=0; i<pageBar.length; i++) {
		if (pageBar[i].url == currPageUrl) {
			return [pageBar[i], nextLinkInPagebar(i, pageBar), 120];
		}
	}

	//there are 3 possibilities

	//curr page is at beginning - detect if first # in sequence is 2 or 1 (page bar starts at 1 or 0)
	if (pageBar[0].pageNum == 2) return [null, pageBar[0], 40];

	//curr page is in the middle - detect by finding missing page
	if (pageBar.length >= 2) {
		var currPageNum, prevPageNum = pageBar[0].pageNum;
		for (i=1; i<pageBar.length; i++) {
			currPageNum = pageBar[i].pageNum;

			if (Math.abs(currPageNum - prevPageNum) == 2) {
				//currPage should not have been visited yet - it is the next page.
				//check this to avoid getting tripped up by bad page bars - ex. 1, 2, 3, 5, 6, 8, 9, 12, 13, 14
				// pgzp.log("currNextPage " + currPageNum + " url: " + pageBar[i].url + " visited previously: "  + pgzp.contains(pgzp.url_list, pageBar[i].url));
				if (!pgzp.contains(pgzp.url_list, pageBar[i].url)) {
					return [pageBar[i - 1], nextLinkInPagebar(i - 1, pageBar), 120];
				}
			} else {
				prevPageNum = currPageNum;
			}
		}
	}

	//curr page is last page
	return [pageBar[pageBar.length-1], null, 30];
};

//score page bar
PageZipper.prototype.__scorePageBar = function(pageBar) {
	var similarityScore = pgzp.trials['url_similarity'].doScore(pageBar[0]);
	var totalScore = pageBar.length + (similarityScore / 20);
	// pgzp.log("page bar length: " + pageBar.length + " sim score: " + similarityScore + " total score: " + totalScore);
	return totalScore;
};

//if multiple links have the same text but point to different urls, they are not next links
//make an array of all text on how many unique urls they point to
PageZipper.prototype.indexDuplicateLinks = function(allNextLinks) {
	var textIndex = {}; //{text, [urls]}
	var currLink;
	for (var i=0; i<allNextLinks.length; i++) {
		currLink = allNextLinks[i];
		if (textIndex[currLink.text]) {
			if (!pgzp.contains(textIndex[currLink.text], currLink.url)) {
				textIndex[currLink.text].push(currLink.url);
			}
		} else {
			textIndex[currLink.text] = [currLink.url];
		}
	}
	return textIndex;
};