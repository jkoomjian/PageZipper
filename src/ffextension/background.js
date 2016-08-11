/*-------------------- Background Variables -----------------*/
//FF does not yet support chrome.storage.sync
var browserStorage = chrome.storage.local;

/*-------------------- Event Handlers -----------------*/

//Handler for auto-run
function loadAndStartPgzp(tab) {
	chrome.tabs.executeScript(tab.id, {'file': 'jquery.js'}, function () {
		chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
				chrome.tabs.executeScript(tab.id, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
		});
	});
	loaded_tabs[tab.id] = "on";
	var icon_src = "extension_icons/icon19-on.png";
	chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL(icon_src)});
}