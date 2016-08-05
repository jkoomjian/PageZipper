/*-------------------- Background Variables -----------------*/
var loaded_tabs = {};
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

function updateActiveTab(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete" && loaded_tabs[tabId]) {
		// deactivate pgzp button on page load - restarting pgzp in this tab will require reloading everything
		delete loaded_tabs[tabId];
		chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL("icon19.png")});
	}
}

function autoRun(details) {
	//ensure pgzp is not already running in this tab
	if (loaded_tabs[details.tabId]) return;

	var url = details.url;
	var currTab = {id: details.tabId};
	getFromList(url, function(domainValue) {
		debugger;
		if (domainValue == "domain" || (domainValue == "nohome" && !is_homepage(url))) {
			runPgzp(currTab);
		}
	});
}


/*-------------------- Event Handlers -----------------*/

//Update media queries after page load
chrome.webNavigation.onDOMContentLoaded.addListener(autoRun);

// Run Pgzp when the toolbar button is clicked
chrome.browserAction.onClicked.addListener(runPgzp);

chrome.tabs.onUpdated.addListener(updateActiveTab);