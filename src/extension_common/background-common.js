/*-------------------- Background Variables -----------------*/
var loaded_tabs = {};


/*-------------------- Event Handlers -----------------*/
function updateActiveTab(tabId, changeInfo, tab) {
	if (changeInfo.status == "complete" && loaded_tabs[tabId]) {
		// deactivate pgzp button on page load - restarting pgzp in this tab will require reloading everything
		delete loaded_tabs[tabId];
		chrome.browserAction.setIcon({tabId: tab.id, path: chrome.extension.getURL("extension_icons/icon19.png")});
	}
}

function autoRun(details) {
	//ensure pgzp is not already running in this tab
	if (loaded_tabs[details.tabId]) return;

	//ignore frames - tabId is important to keep - otherwise frames will break everything
  	if (details.frameId !== 0) return;

	var url = details.url;
	var currTab = {id: details.tabId};
	getFromList(url, function(domainValue) {
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