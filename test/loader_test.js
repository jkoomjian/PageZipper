function _pgzpInitBookmarklet() {
	window.pgzp = new PageZipper();
	pgzp.win = window;
	pgzp.doc = window.document;
	pgzp.loader_type = "bookmarklet";
	pgzp.media_path = "http://www.printwhatyoulike.com/static/pagezipper/ui/";
  pgzp.displayMode = "text"; //can also be "image";
	// pgzp.loadPageZipper();
}

function _initWithPage(url) {
  pgzp.currDomain = pgzp.getDomain(url);
  pgzp.url_list = [url];
  var page = {'url': url};
  pgzp.pages[0] = page;
}

$(document).ready(function(){
  _pgzpInitBookmarklet();
  $ = pgzp.jq;
});

/*----------------- Testing Helpers --------------------*/

// Convert the given text to a dom tree
function textToDom(str) {
  var div = document.createElement("div");
  div.innerHTML = str;
  document.getElementById("test_dock").appendChild(div);
  return div;
}

// Get the text at url
function readIn(url, callback) {
  $.ajax(url, {
    dataType: "text",
    success: function(data) {
      callback(data);
    }
  });
}

// Get the text as url as a dom tree
function readInDom(url, callback) {
  readIn(url, function(data) {
    callback(textToDom(data));
  });
}

// Given a url to an html page, return the body as a dom tree
function readInPageBody(url, callback) {
	readIn(url, function(data) {
		var results = data.match(/<body.*?>([\w\W]*?)<\/body>/i);
		data = (results && results.length >= 2) ? results[1] : data;
    callback(textToDom(data));
  });
}

// Change relative urls to absolute
function preparePage(pageBody, startUrl) {
	//Convert relative urls to absolute
	document.querySelectorAll("a").forEach( elem => {
		if (elem.host.indexOf("localhost") >= 0) {
			let baseUri = elem.baseURI.replace('AccuracySpecRunner.html', '');
			let path = elem.href.replace(baseUri, '');
			elem.href = URI(path).absoluteTo(startUrl).toString();
		}
	});
}


function assertEquals(testValue, correctValue) {
  return expect( testValue ).toBe(correctValue);
}

function assertTrue(testValue) {
  return expect( testValue ).toBe(true);
}

function assertFalse(testValue) {
  return expect( testValue ).toBe(false);
}