/*-------------------- Background Variables -----------------*/
//FF does not yet support chrome.storage.sync
var browserStorage = chrome.storage.local;

/*-------------------- Event Handlers -----------------*/
function runPgzp(tab) {
	var icon_src = "";

	if (!loaded_tabs[tab.id]) {
		chrome.tabs.executeScript(tab.id, {'file': 'jquery.js'}, function () {
			chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
					chrome.tabs.executeScript(tab.id, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
			});
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

	chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL(icon_src)});
}