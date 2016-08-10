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
  pgzp.pages.push(page);
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
  return div.children[0];
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