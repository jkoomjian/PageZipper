var loaded_tabs = {};

//browserAction = pgzp icon
chrome.browserAction.onClicked.addListener(function(tab) {
	var icon_src = "";

	if (!loaded_tabs[tab.id]) {
		chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
				chrome.tabs.executeScript(tab.id, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
			});
		loaded_tabs[tab.id] = "on";
		icon_src = "icon19-on.png";
	} else if (loaded_tabs[tab.id] == "on") {
		loaded_tabs[tab.id] = "off";
		icon_src = "icon19.png";
		chrome.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	} else if (loaded_tabs[tab.id] == "off") {
		loaded_tabs[tab.id] = "on";
		icon_src = "icon19-on.png";
		chrome.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	}

	chrome.browserAction.setIcon({tabId: tab.id, path: icon_src});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete" && loaded_tabs[tabId]) {
		// deactivate pgzp button on page load - restarting pgzp in this tab will require reloading everything
		delete loaded_tabs[tabId];
		browser.browserAction.setIcon({tabId: tab.id, path: browser.extension.getURL("icon19.png")});
	}
});