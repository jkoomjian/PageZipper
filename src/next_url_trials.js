//Trials - These are the tests used to score the links

PageZipper.prototype.Trial = class {
	constructor(doScore, weight, noNormailization=false) {
		this.doScore = doScore;
		this.weight = weight;
		this.noNormailization = noNormailization;
	}
}

PageZipper.prototype.trials = {

	'contains_next_syn': new PageZipper.prototype.Trial(
		function(nextLink) {
			var i, currWord, score = 0;
			for (i=0; i<pgzp.nextSynonyms.length; i++) {
				currWord = pgzp.nextSynonyms[i];
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
					if (currWord.syn != "next" && !pgzp.isStandaloneWord(currWord.syn, nextLink.text, nextLink.isHumanReadableText)) continue;
					if (currWord['pageBar'] && !nextLink.isPageBar) continue; //if this is a # from page bar, make sure this link is actually in page bar
					pgzp.log("adding syn: " + currWord.syn + " to " + nextLink.url);
					if (currWord.weight >= score) {
						score = currWord.weight; //assign weight for keyword used
						nextLink.syn = currWord.syn;
					}
				} else if (!currWord['humanReadableOnly'] && nextLink.url.toLowerCase().indexOf(currWord.syn) >= 0) {
					//also check urls
					if (!pgzp.isStandaloneWord(currWord.syn, nextLink.url, false)) continue;
					if (currWord.weight >= score) {
						score = currWord.weight; //assign weight for keyword used
						nextLink.syn = currWord.syn;
					}
				}
			}
			return score;
		}, 100, true),

	//urls similar to known next urls are more likely to be correct
	'url_similarity': new PageZipper.prototype.Trial(
		function(nextLink) {
			var lastUrl = pgzp.pages[ pgzp.pages.length-1 ].url;
			var currUrl = nextLink.url;

			var l = new Levenshtein(lastUrl, currUrl);
			var lDistance = l.distance;
			return lastUrl.length - lDistance;
		}, 70, true),

	//if multiple links have the same text but point to different urls, they are not next links
	'duplicate_text': new PageZipper.prototype.Trial(
		function(nextLink) {
			var score = 100;
			if (pgzp.linkTextIndex[nextLink.text] && pgzp.linkTextIndex[nextLink.text].length > 0) {
				//subtract 20 points for each additional url
				score = score - (pgzp.linkTextIndex[nextLink.text].length - 1) * 20;
			}
			return score;
		}, 60),

	'url_ends_in_number': new PageZipper.prototype.Trial(
		function(nextLink) {
			var results = nextLink.url.match(/^.*?(\d+)(\/+|\.\w+)?$/);
			//verify url ends in number & number is < 99 - we want /page=3 not /abx43923829
			if (results && (parseInt(results[1], 10) < 99))
				return 100;
			else
				return 0;
		}, 20),

	'begins_or_ends_with_next_syn': new PageZipper.prototype.Trial(
		function(nextLink) {
			if (nextLink.syn && (pgzp.startsWith(nextLink.syn, nextLink.text.toLowerCase()) || pgzp.endsWith(nextLink.syn, nextLink.text.toLowerCase())))
				return 100;
			else
				return 0;
		}, 20),

	'text_size': new PageZipper.prototype.Trial(
		function(nextLink) {
			//points for larger size per char
			return Math.floor( (nextLink.link.offsetWidth * nextLink.link.offsetHeight) / nextLink.text.length );
		}, 10),

	'chars_in_text': new PageZipper.prototype.Trial(
		function(nextLink) {
			//-1pt for each char in text
			return nextLink.text.length * -1;
		}, 10)

};