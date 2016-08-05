var optionsApp = angular.module('optionsApp', ['ngRoute']);


/*----------- Routes ----------------*/
optionsApp.config(function($routeProvider){
  $routeProvider.when('/add-site', {
    templateUrl: '_add_site.html'
  });
  $routeProvider.otherwise({});
});


/*----------- Services ----------------*/
optionsApp.factory('chromeSync', function() {
  return {
    get: function(callback) {
      pgzpBP.browserStorage.get("whitelist", function(items) {
        items = items["whitelist"] || {};
        callback(items);
      });
    },
    saveToSync: function(siteUrl, callback, saveFlag) {
      saveChangeToList(siteUrl, callback, saveFlag);
    }
  };
});


/*----------- Controllers ----------------*/
optionsApp.controller('optionsController', function($scope, $route, $routeParams, $location, chromeSync, $timeout, $document) {
  $scope.whitelist = loadList();
  $scope.deleteSite = deleteSite;
  $scope.addSite = addSite;
  $scope.showAddNew = showAddNew;
  $scope.closeAddNew = closeAddNew;
  $scope.closeOptions = closeOptions;

  $document.bind("keyup", function(event) {
    if (event.keyCode == 27) {
      closeAddNew();
    }
  });

  function loadList() {
    var sites = [];
    chromeSync.get(function(items) {
      for (key in items) {
        if (isActiveDomain(items[key])) {
          sites.push(key);
        }
      }
      $scope.$digest(); //Force ang to check $scope for changes
    });
    return sites;
  }

  function deleteSite() {
    var siteUrl = this.site;
    var index = $scope['whitelist'].findIndex( elem => elem === siteUrl );
    $scope['whitelist'].splice(index, 1);
    chromeSync.saveToSync(siteUrl, null, "deleted");
  }

  function addSite() {
    var siteUrl = this.newSiteBox;
    var skipHome = this.skipHomeCheckbox;
    var saveFlag = "domain";
    if (skipHome) {
      saveFlag = "nohome";
    }

    chromeSync.saveToSync(siteUrl, function() {
      $scope.whitelist = loadList();
    }, saveFlag);
    $("#new-site").value = "";
    closeAddNew();
  }

  function showAddNew() {
    $location.path("/add-site"); //same as window.location
    $timeout(function () {
      //Supposedly this runs on ondomready when no timer arg is given - seems like it works
      $("#new-site").focus();
    });
  }

  function closeAddNew(event) {
    //Prevent bubbling - really difficult in angular :(
    if (!event || $(event.target).hasClass("lightbox") || $(event.target).hasClass("close") ) {
      window.location = "#";
    }
  }

  function closeOptions() {
    chrome.tabs.getCurrent( tab => {
      chrome.tabs.remove(tab.id);
    });
  }

});