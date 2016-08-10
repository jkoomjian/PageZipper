describe("page bar", function () {

  it("handles first page", function (done) {
    _initWithPage("http://electronics.howstuffworks.com/gadgets/travel/gps.htm");
    readInDom("inputs/page-bar-1.html", function(body) {
      var allNextLinks = pgzp.getAllNextLinks(body);
      var results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[0] ).toBe(1);
      expect( results[1] ).toBe(40);
      done();
    });
  });

  it("handles middle pages", function (done) {
    _initWithPage("http://electronics.howstuffworks.com/gadgets/travel/gps3.htm");
    readInDom("inputs/page-bar-2.html", function(body) {
      var allNextLinks = pgzp.getAllNextLinks(body);
      var results = pgzp.getCurrentPageNumberFromPageBar(allNextLinks);
      expect( results[0] ).toBe(4);
      expect( results[1] ).toBe(120);
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
      pgzp.addLinkComponents(body, nextLinks, false);
      expect( nextLinks.length ).toBe(5);
      expect( nextLinks[0].text ).toBe("test2");
      // alt attr only valid on img
      // expect( nextLinks[1].text ).toBe("test3");
      expect( nextLinks[1].text.trim() ).toBe("Test3 Text");
      expect( nextLinks[2].text ).toBe("test4");
      expect( nextLinks[3].text ).toBe("test5");
      expect( !!nextLinks[4].text.match(/test5\.png$/) ).toBe(true);
      done();
    });
  });

});