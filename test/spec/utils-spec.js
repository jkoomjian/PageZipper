describe("Pgzp Utils should", function() {

  it("filter", function() {
    	var testAr = [1, 2, 1, 2];
    	pgzp.filter(testAr, function(a) {return a == 1;});
    	assertEquals(testAr.length, 2);
    	assertEquals(testAr[0], 2);
    	assertEquals(testAr[1], 2);
  });

  it("getUrlWOutAnchors", function() {
    var url1 = "http://www.zeit.de/zeit-wissen/2009/02/3D-Fernsehen#exklusivData";
    var url2 = "http://www.zeit.de/zeit-wissen/2009/02/3D-Fernsehen";
    assertEquals(url2, pgzp.getUrlWOutAnchors(url1));
    assertEquals(url2, pgzp.getUrlWOutAnchors(url2));
  });

  it("isStandaloneWord", function() {
    assertFalse(pgzp.isStandaloneWord('older', 'update folder settings', true));
  	assertTrue(pgzp.isStandaloneWord('older', 'more older entries', true));
  	assertFalse(pgzp.isStandaloneWord('2', '2009', true));
  	assertTrue(pgzp.isStandaloneWord('2', '2', true));
  	assertTrue(pgzp.isStandaloneWord('2', 'page 2', true));
  	assertFalse(pgzp.isStandaloneWord('older', 'placeholder.jpg', false));
  	assertTrue(pgzp.isStandaloneWord('older', 'older', false));
  });

  it("getNumberAtPos", function() {
    assertEquals(pgzp.getNumberAtPos("asdf234asfd", 5), 234);
    assertEquals(pgzp.getNumberAtPos("asdf234asfd", 4), 234);
    assertEquals(pgzp.getNumberAtPos("asdf234asfd", 6), 234);
    assertEquals(pgzp.getNumberAtPos("asdf234asfd", 2), -1);
    assertEquals(pgzp.getNumberAtPos("234asfd", 2), 234);
    assertEquals(pgzp.getNumberAtPos("asfd234", 6), 234);
  });

  it("StringFunctions", function() {
    assertTrue(pgzp.startsWith("asd", "asdf"));
    assertFalse(pgzp.startsWith("x", "asdf"));
    assertTrue(pgzp.endsWith("df", "asdf"));
    assertFalse(pgzp.endsWith("sd", "asdf"));
  });

  it("getDomain", function() {
    assertEquals("brockpress.com", pgzp.getDomain("http://media.www.brockpress.com/media/storage/paper384/news/2010/03/02/Technology/Facebook.Knows.Your.Dirty.Secrets-3882810.shtml"));
  	assertEquals("krook.org", pgzp.getDomain("http://krook.org/jsdom/"));
  	assertEquals("jonathankoomjian.com", pgzp.getDomain("http://www.jonathankoomjian.com/wiki/index.php?n=Main.Links"));
  	assertEquals("pbworks.com", pgzp.getDomain("http://jonsie25.pbworks.com/Gear#view=page"));
  });

});