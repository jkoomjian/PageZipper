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