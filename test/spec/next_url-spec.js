describe("page bar", function () {

  it("handles first page", function (done) {
    _initWithPage("http://electronics.howstuffworks.com/gadgets/travel/gps.htm");
    readInDom("inputs/page-bar-1.html", function(body) {
      var allNextLinks = pgzp.getAllNextLinks(body);
      var results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[0] ).toBe(null);
      expect( results[1].text ).toBe("2");
      //score = 80 when pageBar = 2, and 1 page has been loaded
      //score = 30 if pageBar = 2 but multiple pages have been loaded
      expect( results[2] ).toBe(80);
      pgzp.pages[0].nextLinkObj = results[1];
      pgzp.pages.push( {'url': window.location.href} );
      results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[2] ).toBe(30);
      pgzp.pages.pop();
      done();
    });
  });

  it("handles middle pages", function (done) {
    _initWithPage("http://electronics.howstuffworks.com/gadgets/travel/gps3.htm");
    readInDom("inputs/page-bar-2.html", function(body) {
      var allNextLinks = pgzp.getAllNextLinks(body);
      var results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[0].text ).toBe("3");
      expect( results[1].text ).toBe("5");
      expect( results[2] ).toBe(120);
      done();
    });
  });

  it("handles pages which have previously been seen correctly", function(done) {
    _initWithPage("http://www.pcmag.com/article2/0,2817,2361879,00.asp");
    pgzp.url_list.push("http://www.pcmag.com/article2/0,2817,2361878,00.asp");
    readInDom("inputs/page-bar-3.html", function(body) {
      var allNextLinks = pgzp.getAllNextLinks(body);
      var results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[1].text ).toBe("5");
      expect( results[2] ).toBe(120);
      expect( pgzp.getNextLink(body).url ).toBe("http://www.pcmag.com/article2/0,2817,2361880,00.asp");
      done();
    });
  });

});

describe("getAllNextLinks", function () {
  it("loads correct urls", function () {
    var assertLinks = function(html, length) {
      html = "<div>" + html + "</div>";
      expect( pgzp.getAllNextLinks(textToDom(html)).length ).toBe(length);
    };
    _initWithPage("http://www.test.com/test.hml");
    var html = "<a href='http://www.test.com/test2.hml'>adsf</a>";
    assertLinks(html, 1);

    //has href
    html = "<a>adsf</a>";
    assertLinks(html, 0);

    //points to origin domain
    html = "<a href='http://www.test2.com/test2.hml'>adsf</a>";
    assertLinks(html, 0);

    //not anchor link to current page
    html = "<a href='http://www.test.com/test.hml#anchor'>adsf</a>";
    assertLinks(html, 0);

  });

  it("gets all parts of the link", function (done) {
    _initWithPage("http://www.test.com/test.hml");
    readInDom("inputs/all-urls-1.html", function(body) {
      var nextLinks = [];
      body = body.childNodes[0];
      pgzp.addLinkComponents(body, nextLinks, false);
      expect( nextLinks.length ).toBe(5);
      expect( nextLinks[0].text.trim() ).toBe("Test3 Text");
      expect( nextLinks[1].text ).toBe("test4");
      expect( nextLinks[2].text ).toBe("test5");
      expect( !!nextLinks[3].text.match(/test5\.png$/) ).toBe(true);
      expect( nextLinks[4].text ).toBe("test2");
      // alt attr only valid on img
      // expect( nextLinks[1].text ).toBe("test3");
      expect( nextLinks[0].url ).toBe("http://www.test.com/test2.hml");
      expect( nextLinks[1].url ).toBe("http://www.test.com/test2.hml");
      expect( nextLinks[2].url ).toBe("http://www.test.com/test2.hml");
      expect( nextLinks[3].url ).toBe("http://www.test.com/test2.hml");
      expect( nextLinks[4].url ).toBe("http://www.test.com/test2.hml");
      done();
    });
  });

});