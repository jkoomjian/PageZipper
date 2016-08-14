/*-------------------- Background Variables -----------------*/
//FF does not yet support chrome.storage.sync
var browserStorage = chrome.storage.sync;

/*-------------------- Event Handlers -----------------*/

//Handler for auto-run
function loadAndStartPgzp(tabId) {
	chrome.tabs.executeScript(tabId, {'file': 'pagezipper.js'}, function () {
			chrome.tabs.executeScript(tabId, {'code': '_pgzpInitExtension();_pgzpToggleBookmarklet();'});
		});
	loaded_tabs[tabId] = "on";
	var icon_src = "extension_icons/icon19-on.png";
	chrome.browserAction.setIcon({tabId: tabId, path: chrome.extension.getURL(icon_src)});
}