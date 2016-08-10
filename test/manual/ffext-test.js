var globalTime = new Date().toString();

function pgzpLaunchExtension() {
//	window.hello = "first window is the best";
//	window.content.window.hello = "window.content is the best"
//	alert("hello var: " + hello);

	alert("global time: " + globalTime);
	alert("local time: " + window.content["localTime"]);
	window.content.localTime = new Date().toString();
}

function sayHi() {
	alert("at say hi!");
}

function getRealWindow() {
	return hwindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
							.getService(Components.interfaces.nsIAppShellService)
							.hiddenDOMWindow;
}

var test = {
	pgzpLaunchExtension: function() {
		alert("real window: " + window.content);
		window.content.setInterval(test.sayHi, 2000);
	}
}
//test.sayHi = function() {
//	alert("at say hi!");
//}