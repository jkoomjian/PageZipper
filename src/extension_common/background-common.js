/*-------------------- Background Variables -----------------*/
var loaded_tabs = {};


/*-------------------- Event Handlers -----------------*/
function autoRun(details) {
	//ignore frames - tabId is important to keep - otherwise frames will break everything
	if (details.frameId !== 0) return;

	var url = details.url;
	var currTab = {id: details.tabId};
	getFromList(url, function(domainValue) {
		if (domainValue == "domain" || (domainValue == "nohome" && !is_homepage(url))) {
			loadAndStartPgzp(currTab);
		}
	});
}

//Handler for button
function runPgzp(tab) {
	var icon_src = "";

	if (!loaded_tabs[tab.id]) {
		loadAndStartPgzp(tab);
		icon_src = "extension_icons/icon19-on.png";
	} else if (loaded_tabs[tab.id] == "on") {
		loaded_tabs[tab.id] = "off";
		icon_src = "extension_icons/icon19.png";
		chrome.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	} else if (loaded_tabs[tab.id] == "off") {
		loaded_tabs[tab.id] = "on";
		icon_src = "extension_icons/icon19-on.png";
		chrome.tabs.executeScript(tab.id, {'code': '_pgzpToggleBookmarklet()'});
	}

	chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL(icon_src)});
}

// On refresh, the script injected into the tab context will be lost
function updateActiveTab(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete" && loaded_tabs[tabId]) {
    debugger;
		// deactivate pgzp button on page load - restarting pgzp in this tab will require reloading everything
		delete loaded_tabs[tabId];
		chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL("extension_icons/icon19.png")});
	}
}

/*-------------------- Event Handlers -----------------*/

// Update media queries after page load
chrome.webNavigation.onDOMContentLoaded.addListener(autoRun);

// Run Pgzp when the toolbar button is clicked
chrome.browserAction.onClicked.addListener(runPgzp);

// Update after page refresh - the script injected into the tab context will be lost
chrome.tabs.onUpdated.addListener(updateActiveTab);