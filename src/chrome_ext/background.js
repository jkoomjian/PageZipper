var loaded_tabs = {}, icon_src = "";
chrome.browserAction.onClicked.addListener(function(tab) {		//browserAction = pgzp icon
	
	if (!loaded_tabs[tab.id]) {
		chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
				chrome.tabs.executeScript(tab.id, {'code': '_pgzpInitChromeExtension();_pgzpToggleBookmarklet();'});
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
	//deactivate pgzp button on page load
	delete loaded_tabs[tabId];
	
	if (localStorage["extensions.pagezipper.autorun"] == "true" && changeInfo.status == "complete" && !loaded_tabs[tabId]) {
		
		//load pgzp
		loaded_tabs[tabId] = "off";
		chrome.tabs.executeScript(tab.id, {'file': 'pagezipper.js'}, function () {
			chrome.tabs.executeScript(tab.id, {'code': '_pgzpAutorun()'});
		});
	}
});