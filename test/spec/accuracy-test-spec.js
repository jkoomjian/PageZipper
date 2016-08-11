//This is a big array of urls and the correct next url
//all the pages must be saved to /accuracy_test/pages
//add new pages with wget -O <filename> -k <url>
//order is [page_file_name, next_url, current_url
var bigUrlsArray = [
					["nytimes.html",
            "http://www.nytimes.com/slideshow/2008/10/30/travel/escapes/1031-AMERICAN_10.html",
            "http://www.nytimes.com/slideshow/2008/10/30/travel/escapes/1031-AMERICAN_9.html"],
					["icanhascheezburger.html",
            "http://dogs.icanhascheezburger.com/page/2/",
            "http://dogs.icanhascheezburger.com/"],
					["makeuseof.html",
            "http://www.makeuseof.com/page/2/",
            "http://www.makeuseof.com/"],
					["redferret.html",
            "http://www.redferret.net/?paged=2",
            "http://www.redferret.net/"],
					["freecycle.html",
            "http://groups.freecycle.org/Desmoinesfreecycle/posts/all?page=3&resultsperpage=10&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off",
            "http://groups.freecycle.org/Desmoinesfreecycle/posts/all?page=2&resultsperpage=10&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off"],
					["time.html",
            "http://www.time.com/time/specials/2007/article/0,28804,1809858_1809957_1811552,00.html",
            "http://www.time.com/time/specials/2007/article/1,28804,1809858_1809957,00.html"],
					["actionsquad.html",
            "http://www.actionsquad.org/hammshist.htm",
            "http://www.actionsquad.org/hammsoverview.htm"],
					["treehugger.html",
            "http://www.treehugger.com/files/2009/04/17-examples-of-pedal-power-and-propulsion.php?page=2",
            "http://www.treehugger.com/files/2009/04/17-examples-of-pedal-power-and-propulsion.php"],
					["eurogamer.html",
            "http://www.eurogamer.net/articles/2010-11-13-the-men-who-stare-at-protoss-article?page=2",
            "http://www.eurogamer.net/"],
					["bw.html",
            "http://images.businessweek.com/ss/10/01/0119_most_expensive_small_towns/3.htm",
            "http://images.businessweek.com/ss/10/01/0119_most_expensive_small_towns/2.htm"],
					["photoshopessentials.html",
            "http://www.photoshopessentials.com/photo-effects/photo-borders-photoshop-brushes/page-2.php",
            "http://www.photoshopessentials.com/photo-effects/photo-borders-photoshop-brushes/"],
					["howstuffworks1.html",
            "http://electronics.howstuffworks.com/gadgets/travel/gps1.htm",
            "http://electronics.howstuffworks.com/gadgets/travel/gps.htm"],
					["howstuffworks2.html",
            "http://electronics.howstuffworks.com/gadgets/travel/gps4.htm",
            "http://electronics.howstuffworks.com/gadgets/travel/gps3.htm"],
				];


describe("Verify pages continue working after changes", function () {

  it("no regressions", function (done) {

    var testPage = function(pageUrl, nextUrl, startUrl) {
      _initWithPage(startUrl);
      readInPageBody("accuracy_test/" + pageUrl, function(pageBody) {
        preparePage(pageBody, startUrl);
        var nextLinkObj = pgzp.getNextLink(pageBody);
        var resultUrl = nextLinkObj ? nextLinkObj.url : null;
        expect( resultUrl ).toBe( nextUrl );
        document.querySelector("#console").innerHTML += `${pageUrl} => expected: ${nextUrl} got: ${resultUrl}<br/>`;
        runTest();
      });
    };

    var runTest = function() {
      console.log("bigarraylength: " + bigUrlsArray.length);
      if (bigUrlsArray.length === 0) {
        done();
        return;
      }

      var curr_site = bigUrlsArray.shift();
      console.log("Running test: " + curr_site[0] + " # remaining tests to run: " + bigUrlsArray.length);
      testPage(curr_site[0], curr_site[1], curr_site[2]);
    };

    runTest();
  }, 5000 * bigUrlsArray.length);  //set timeout

});