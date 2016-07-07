var loaded_tabs = {}, icon_src = "";

//Pgzp icon is clicked
browser.browserAction.onClicked.addListener(function(tab) {

	if (!loaded_tabs[tab.id]) {
		browser.tabs.executeScript(tab.id, {'file': 'jquery.js'}, function () {
			browser.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
					browser.tabs.executeScript(tab.id, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
			});
		});
		loaded_tabs[tab.id] = "on";
		icon_src = "icon19-on.png";
	} else if (loaded_tabs[tab.id] == "on") {
		loaded_tabs[tab.id] = "off";
		icon_src = "icon19.png";
		browser.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	} else if (loaded_tabs[tab.id] == "off") {
		loaded_tabs[tab.id] = "on";
		icon_src = "icon19-on.png";
		browser.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	}

	browser.browserAction.setIcon({tabId: tab.id, path: browser.extension.getURL(icon_src)});
});

// New page is loaded in tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

	//deactivate pgzp button on page load
	delete loaded_tabs[tabId];

	//TODO on tab change
	// if (localStorage["extensions.pagezipper.autorun"] == "true" && changeInfo.status == "complete" && !loaded_tabs[tabId]) {
	// 	//load pgzp
	// 	loaded_tabs[tabId] = "off";
	// 	chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
	// 		chrome.tabs.executeScript(tab.id, {'code': '_pgzpAutorun()'});
	// 	});
	// }
});