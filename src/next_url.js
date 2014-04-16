/*------------------------- Get Next Page URL ----------------------*/
//NextLink object we will be scoring
//isReadableText = human readable content- not url
PageZipper.prototype.NextLink = function(text, link, alreadyLoaded, isHumanReadableText) {
	this.text = text;
	this.link = link;
	this.syn = '';
	this.isHumanReadableText = (isHumanReadableText == undefined) ? true : isHumanReadableText;
	this.isVisibleText = false;  //is this.text visible on the page?
	this.alreadyLoaded = alreadyLoaded;
	this.url = link.href;
	this.finalScore = null;
	this.trialScores = {};
	this.addScore = function(trialName, score, isNormalized) {
		var normalizedKey = isNormalized ? 'normalizedScore' : 'unnormalizedScore';
		if (!this.trialScores[trialName]) this.trialScores[trialName] = {};
		this.trialScores[trialName][normalizedKey] = score;
	}
	this.getScore = function(trialName, isNormalized) {
		//for trials which do not get normalized, just return unnormalized score
		if (isNormalized && pgzp().trials[trialName].noNormailization) isNormalized = false;
		var normalizedKey = isNormalized ? 'normalizedScore' : 'unnormalizedScore';
		return this.trialScores[trialName][normalizedKey];
	}
	this.calculateTotalScore = function() {
		this.finalScore = 0;
		if (pgzp().debug) var debugStr = "Calculate Final Score: " + this.text + ": " + this.url;
		for (var trial in this.trialScores) {
			if (pgzp().trials.hasOwnProperty(trial)) {
				var nScore = this.getScore(trial, true);
				var weight = pgzp().trials[trial].weight;
				this.finalScore += nScore * weight;
				if (pgzp().debug) debugStr += "\n\t" + trial + "\t\t\t" + nScore + "\tx\t" + weight + "\t=\t" + (nScore * weight);
			}
		}
		if (pgzp().debug) pgzp().log(debugStr + "\nFinal Score:\t" + this.finalScore);
		return this.finalScore;
	}
	this.isSynNumber = function() {
		return pgzp().isNumber(this.syn);
	}
}

//Trials - These are the tests we will use to score the links
PageZipper.prototype.trials = {
	'contains_next_syn': {
						'doScore': function(nextLink) {
										var i, currWord, score = 0;
										for (i=0; i<pgzp().nextSynonyms.length; i++) {
											currWord = pgzp().nextSynonyms[i];
											//+ for containing a keyword
											if (nextLink.text.toLowerCase().indexOf(currWord.syn) >= 0) {
												if (currWord['humanReadableOnly']) {
													if (
														!nextLink.isHumanReadableText ||						//don't allow index as syn on urls
														nextLink.text.toLowerCase().indexOf("comment") >= 0		//blogs often say something link '2 comments' - ignore this
													) continue;  
												}
												//make sure syns are not included as part of something else - ex 'page 2', not '2009', 'older' not placeholder.jpg
												//for human readable, identify breaks by whitespace, for non-human readable, use any non a-z character
												//'next' is never used outside its meaning, so dont worry about it
												if (currWord.syn != "next" && !pgzp().isStandaloneWord(currWord.syn, nextLink.text, nextLink.isHumanReadableText)) continue;
												if (currWord['pageBar'] && !nextLink.isPageBar) continue; //if this is a # from page bar, make sure this link is actually in page bar
												//pgzp().log("adding syn: " + currWord.syn + " to " + nextLink.url);
												if (currWord.weight >= score) {
													score = currWord.weight; //assign weight for keyword used
													nextLink.syn = currWord.syn;
												}
											} else if (!currWord['humanReadableOnly'] && nextLink.url.toLowerCase().indexOf(currWord.syn) >= 0) {
												//also check urls
												if (!pgzp().isStandaloneWord(currWord.syn, nextLink.url, false)) continue;
												if (currWord.weight >= score) {
													score = currWord.weight; //assign weight for keyword used
													nextLink.syn = currWord.syn;
												}
											}
										}
										return score;
									},
						'weight': 100,
						'noNormailization': true
						},
	//urls similar to known next urls are more likely to be correct
	'url_similarity': {
						'doScore': function(nextLink) {
									var lastUrl, currUrl, shorter, longer, score = 0, notMatchingPos = -1, i;
									lastUrl = pgzp().pages[ pgzp().pages.length-1 ].url;
									currUrl = nextLink.url;
									if (lastUrl.length <= currUrl.length) {
										shorter = lastUrl;
										longer = currUrl;
									} else {
										shorter = currUrl;
										longer = lastUrl;
									}
									
									//subtract points for differences in length
									score = shorter.length - longer.length;
									
									//add points for matching chars, remove for different chars
									for (i=0; i<shorter.length; i++) {
										if (shorter.charAt(i) == longer.charAt(i)) {
											score++;
										} else {
											score--;
											if (notMatchingPos < 0) notMatchingPos = i;
										}
									}
									
									//if the two urls are the same except 1 number, which is off by 1, that is a dead giveaway
									if (notMatchingPos > 0 &&
										pgzp().isNumber(longer.charAt(notMatchingPos)) && pgzp().isNumber(shorter.charAt(notMatchingPos)) &&
										(Math.abs(pgzp().getNumberAtPos(shorter, notMatchingPos) - pgzp().getNumberAtPos(longer, notMatchingPos)) == 1)
										) {
											score += 100;
									}
									return score;
								},
						'weight': 70,
						'noNormailization': true
						},
	//if multiple links have the same text but point to different urls, they are not next links
	'duplicate_text': {
						'doScore': function(nextLink) {
									var score = 100;
									if (pgzp().linkTextIndex[nextLink.text] && pgzp().linkTextIndex[nextLink.text].length > 0) {
										//subtract 20 points for each additional url
										score = score - (pgzp().linkTextIndex[nextLink.text].length - 1) * 20;
									}
									return score;
								},
						'weight': 60
						},
	'url_ends_in_number': {
						'doScore': function(nextLink) {
										var results = nextLink.url.match(/^.*?(\d+)(\/+|\.\w+)?$/);
										//verify url ends in number & number is < 99 - we want /page=3 not /abx43923829
										if (results && (parseInt(results[1], 10) < 99))
											return 100;
										else
											return 0;
									},
						'weight': 20
						},
	'begins_or_ends_with_next_syn': {
						'doScore': function(nextLink) {
										if (nextLink.syn && (pgzp().startsWith(nextLink.syn, nextLink.text.toLowerCase()) || pgzp().endsWith(nextLink.syn, nextLink.text.toLowerCase())))
											return 100;
										else
											return 0;
									},
						'weight': 20
						},
	'text_size': {
					'doScore': function(nextLink) {
								//points for larger size per char
								return Math.floor( (nextLink.link.offsetWidth * nextLink.link.offsetHeight) / nextLink.text.length );
							},
					'weight': 10
					},
	'chars_in_text': {
					'doScore': function(nextLink) {
									//-1pt for each char in text
									return nextLink.text.length * -1;
								},
					'weight': 10
					}						
};

PageZipper.prototype.getNextLink = function(body) {
	var allNextLinks = pgzp().getAllScoredLinks(body)
	if (allNextLinks.length <= 0) return null;

	var highestLink = pgzp().getHighestTotalScore(allNextLinks);

	//keep track of the matching next syn - if it changes, assume we are using a different link and have reached the end of the set
	//stop here if highestLink has a different syn than the first link
	if (pgzp().pages.length > 1 && //don't check on first page
		!pgzp().pages[0].nextLinkObj.isSynNumber() && !highestLink.isSynNumber() &&  //only compare if we are not using page indexes
		pgzp().pages[0].nextLinkObj.syn != highestLink.syn)
		return null;
	return highestLink;
}

PageZipper.prototype.getAutorunNextLink = function(body) {
	var scoredLinks = [];
	var allNextLinks = pgzp().getAllScoredLinks(body)
	if (allNextLinks.length <= 0) return null;

	for (var i=0; i<allNextLinks.length; i++) {
		var score = allNextLinks[i].calculateTotalScore();
		scoredLinks.push( [score, allNextLinks[i]] );
	}
	
	//sort
	scoredLinks.sort(function(a, b){
			return b[0] - a[0];
		});

	pgzp().log(scoredLinks);

	//make sure the top link has a score of at least 15000
	if (scoredLinks[0][0] < 15000) return null;

	//check if the top link is 30% than the next link
	for (i=1; i<scoredLinks.length; i++) {
		
		if (scoredLinks[i][1].url == scoredLinks[0][1].url) {
			continue;
		}
		
		//next smallest link must be at least 30% smaller
		if ( (scoredLinks[i][0] / scoredLinks[0][0]) > .7) {
			return null;
		} else {
			return scoredLinks[0][1];
		}
	}
	
	//only 1 good link
	return scoredLinks[0][1];
}

PageZipper.prototype.getAllScoredLinks = function(body) {
	var allNextLinks = pgzp().getAllNextLinks(body);
	var pageBarInfo = pgzp().getCurrentPageNumberFromPageBar(allNextLinks);
	pgzp().log("looking for page #: " + (pageBarInfo[0] + 1) + " w/confidence: " + pageBarInfo[1]);
	pgzp().nextSynonyms[pgzp().nextSynonyms.length-1].syn = (pageBarInfo[0] + 1) + "";	//update nextSynonyms
	pgzp().nextSynonyms[pgzp().nextSynonyms.length-1].weight = pageBarInfo[1];	//update weight/confidence
	pgzp().linkTextIndex = pgzp().indexDuplicateLinks(allNextLinks);
	pgzp().filter(allNextLinks, function(link) {return link.alreadyLoaded;});	//filter out already loaded links, needed by pageBar, but not anymore
	pgzp().scoreLinks(allNextLinks);
	pgzp().normalizeLinks(allNextLinks);
	return allNextLinks;
}

//get all links and score them
PageZipper.prototype.scoreLinks = function(allNextLinks) {
	if (pgzp().debug) var debugMsg = '';
	for (var trial in pgzp().trials) {
		if (pgzp().trials.hasOwnProperty(trial)) { //block out stuff added by site with Object.prototype
			for (var i=0; i<allNextLinks.length; i++) {
				allNextLinks[i].addScore(trial, pgzp().trials[trial].doScore(allNextLinks[i]));
				if (pgzp().debug) debugMsg += "\nScore " + trial + " " + allNextLinks[i].text + ": " + allNextLinks[i].getScore(trial);
				//remove any links which scored 0 on containing a keyword - do it here so we don't have to continue scoring links we know are bad
				if (trial == 'contains_next_syn' && allNextLinks[i].getScore('contains_next_syn') <= 0) {
					allNextLinks.splice(i, 1);
					i--;
				}
			}
		}
	}
	if (pgzp().debug) pgzp().log(debugMsg);
}

//normalize scores from 1-100
PageZipper.prototype.normalizeLinks = function(allLinks) {
	for (var trial in pgzp().trials) {
		//block out stuff added by site with Object.prototype, trials not meant to be normailzed
		if (pgzp().trials.hasOwnProperty(trial) && !pgzp().trials[trial].noNormailization) {
			pgzp().normalizeTrialSet(trial, allLinks);
		}
	}
}

//takes a trial name, normalizes all scores to between 0 and 100
PageZipper.prototype.normalizeTrialSet = function(trialName, allLinks) {
	//get highest and lowest scores
	var highest, lowest = 0; //add zero so we don't normalize to 0 and 100 for urls which are 1 char apart
	for (var i=0; i<allLinks.length; i++) {
		var score = allLinks[i].getScore(trialName);
		if (highest == null || score > highest) highest = score;
		if (lowest == null || score < lowest) lowest = score;
	}

	//now normalize
	if (pgzp().debug) var debugMsg = 'Normalizing Trial Set: ' + trialName;
	var curve = (highest == lowest) ? 0 : (100 / (highest - lowest));
	for (var i=0; i<allLinks.length; i++) {
		var score = allLinks[i].getScore(trialName);
		var nScore = Math.floor((score - lowest) * curve);
		allLinks[i].addScore(trialName, nScore, true);
		if (pgzp().debug) debugMsg += "\nNScore " + i + ": " + allLinks[i].text + ": score: " + score + " curve: " + curve + " higest: " + highest + " lowest: " + lowest + " nscore: " + nScore;
	}
	if (pgzp().debug) pgzp().log(debugMsg);
}

//calculate total score
PageZipper.prototype.getHighestTotalScore = function(allNextLinks) {
	var highestScoringLink = null;
	for (var i=0; i<allNextLinks.length; i++) {
		var score = allNextLinks[i].calculateTotalScore();
		if (highestScoringLink == null || score >= highestScoringLink.finalScore) {
			highestScoringLink = allNextLinks[i];
		}
	}
	
	if (pgzp().debug) {
		var debugMsg = 'Final Score ' + allNextLinks.length;
		allNextLinks.sort(function (a, b) {
							return b.finalScore - a.finalScore;
						});
		for (i=0; i<allNextLinks.length; i++) {
			debugMsg += "\n" + allNextLinks[i].finalScore + ": " + allNextLinks[i].text + ": " + allNextLinks[i].url;
		}
		pgzp().log(debugMsg);
	}
	
	return highestScoringLink;
}

PageZipper.prototype.getAllNextLinks = function(body) {
	var allNextLinks = [];
	var links = body.getElementsByTagName("a"); //get all the links in the page

	var pageUrl = pgzp().getUrlWOutAnchors( pgzp().pages[ pgzp().pages.length-1 ].url );
	for (var i=0; i<links.length; i++) {
		//ignore all links which point to a different domain than the existing domain
		//pgzp().log("currdomain: "  + pgzp().currDomain + " currLink: " + pgzp().getDomain(links[i].href) + " full Link: " + links[i].href + " relative: " + links[i].getAttribute("href"));
		if (
			links[i].href &&
			pgzp().getDomain(links[i].href) == pgzp().currDomain &&  //link points to this domain
			(links[i].href.indexOf("#") < 0 || pageUrl != pgzp().getUrlWOutAnchors(links[i].href)) //avoid links to an anchor in current page, but include normal links curr page
			) {
			pgzp().addLinkComponents(links[i], allNextLinks, pgzp().contains(pgzp().url_list, links[i].href)); //mark links we've already loaded
		}
	}
	//pgzp().logList(links, "All Links", "#{o.text}\t#{o.link}");
	return allNextLinks;
}

//returns an array of all NextLink texts that could be derived from this link
PageZipper.prototype.addLinkComponents = function(link, allNextLinks, alreadyLoaded) {
	var NextLink = pgzp().NextLink;
	var search = function(rootNode) {
		for (var i=0; i<rootNode.childNodes.length; i++) {
			var curr = rootNode.childNodes[i];
		
			//check if this node is useful
			if (curr.nodeType == Node.TEXT_NODE && curr.nodeValue && pgzp().jq.trim(curr.nodeValue).length > 0) {
				var nl = new NextLink(curr.nodeValue, link, alreadyLoaded); 
				nl.isVisibleText = true;
				allNextLinks.push(nl);
			//check for image link
			} else if (curr.nodeType == Node.ELEMENT_NODE && curr.tagName.toLowerCase() == "img") {
				if (curr.alt) allNextLinks.push(new NextLink(curr.alt, link, alreadyLoaded));
				if (curr.title) allNextLinks.push(new NextLink(curr.title, link, alreadyLoaded));
				if (curr.src) allNextLinks.push(new NextLink(curr.src, link, alreadyLoaded, false));
			} else {
				//continue
				search(curr);
			}
		}
	}
	
	if (link.title) allNextLinks.push(new NextLink(link.title, link));
	if (link.alt) allNextLinks.push(new NextLink(link.alt, link));
	search(link);
}


//---------------------------------- Page Bar ---------------------------------------

//determine the current page number from a list of page numbers on the page ie. 1 2 3 4 5
//returns [page #, confidence]
PageZipper.prototype.getCurrentPageNumberFromPageBar = function(allNextLinks) {
	var allSequences = [], i = 0, currSeq = [], currNextLink, pageBar, pageBarScore = 0, pageNum, tmpPageBarScore;
	var currPageUrl = pgzp().pages[ pgzp().pages.length-1 ].url;

	//first find all consecutive numerical links, put them in arrays
	for (i=0; i<allNextLinks.length; i++) {
		currNextLink = allNextLinks[i];
		if (currNextLink.isVisibleText) {  //only want text which actually appears on the page (one link may have multiple entries in allNextLinks)
			if (pgzp().isNumber(currNextLink.text)) {
				pageNum = parseInt(currNextLink.text, 10);
				if (pageNum >= 0 && pageNum < 1000) {
					currNextLink.pageNum = pageNum;
					currSeq.push(currNextLink);
				}
			} else {
				if (currSeq.length > 0) {
					allSequences.push(currSeq);
					currSeq = [];
				}
			}
		}
	}
	if (currSeq.length > 0) allSequences.push(currSeq);
	
	//now find the sequence numerical links most likely to be the page bar
	for (i=0; i<allSequences.length; i++) {
		tmpPageBarScore = pgzp().__scorePageBar(allSequences[i]);
		if (tmpPageBarScore >= pageBarScore) {
			pageBarScore = tmpPageBarScore;
			pageBar = allSequences[i];
		}
	}
	
	if (!pageBar) return [-1, 0];	//no page bar on this page
	
	//sort pageBar lowest to highest
	pageBar.sort(	function(a,b){
						return a.pageNum - b.pageNum;
					});
	pgzp().logList(pageBar, "indexes ordered by size", "#{o.pageNum}\t#{o.text}");
	
	//mark pageBar for later
	for (i=0; i<pageBar.length; i++) pageBar[i].isPageBar = true;
	
	//some page bars include links for the current page- ex. 1 2 3 4 where 1 is a link which is highlighted
	for (i=0; i<pageBar.length; i++) {
		if (pageBar[i].url == currPageUrl) {
			return [pageBar[i].pageNum, 120];
		}
	}
	
	//there are 3 possibilities
	
	//curr page is in the middle - detect by finding missing page
	if (pageBar.length >= 2) {
		var currPageNum, prevPageNum = pageBar[0].pageNum;
		for (i=1; i<pageBar.length; i++) {
			currPageNum = pageBar[i].pageNum;
	
			if (Math.abs(currPageNum - prevPageNum) == 2) {
				//currPage should not have been visited yet - it is the next page.  
				//check this to avoid getting tripped up by bad page bars - ex. 1, 2, 3, 5, 6, 8, 9, 12, 13, 14
				//pgzp().log("currNextPage " + currPageNum + " url: " + pageBar[i].url + " visited previously: "  + pgzp().contains(pgzp().url_list, pageBar[i].url));
				if (!pgzp().contains(pgzp().url_list, pageBar[i].url)) {
					return [currPageNum - 1, 120];
				}
			} else {
				prevPageNum = currPageNum;
			}
		}
	}
	
	//curr page is at beginning - detect if first # in sequence is 2 or 1 (page bar starts at 1 or 0)
	if (pageBar[0].pageNum == 2) return [1, 40];
	// if (pageBar[0].pageNum == 1) return [0, 10];
	
	//curr page is last page
	return [pageBar[pageBar.length-1].pageNum, 30];
}

//score page bar
PageZipper.prototype.__scorePageBar = function(pageBar) {
	var similarityScore = pgzp().trials['url_similarity'].doScore(pageBar[0]);
	var totalScore = pageBar.length + (similarityScore / 20);
	pgzp().log("page bar length: " + pageBar.length + " sim score: " + similarityScore + " total score: " + totalScore);
	return totalScore;
}

//if multiple links have the same text but point to different urls, they are not next links
//make an array of all text on how many unique urls they point to
PageZipper.prototype.indexDuplicateLinks = function(allNextLinks) {
	var textIndex = {}; //{text, [urls]}
	var currLink;
	for (var i=0; i<allNextLinks.length; i++) {
		currLink = allNextLinks[i];
		if (textIndex[currLink.text]) {
			if (!pgzp().contains(textIndex[currLink.text], currLink.url)) {
				textIndex[currLink.text].push(currLink.url);
			}
		} else {
			textIndex[currLink.text] = [currLink.url];
		}
	}
	return textIndex;
}