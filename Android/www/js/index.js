angular.module('ionicApp', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('eventmenu', {
      url: "/event",
      abstract: true,
      templateUrl: "event-menu.html"
    })
    .state('eventmenu.home', {
      url: "/home",
      views: {
        'menuContent' :{
			templateUrl: "home.html",
			controller: "HomeCtrl"
        }
      }
    })
    .state('eventmenu.options', {
      url: "/options",
      views: {
        'menuContent' :{
          templateUrl: "templates/options.html",
		  controller: "OptionCtrl"
        }
      }
    })
    .state('eventmenu.map', {
      url: "/map",
      views: {
        'menuContent' :{
          templateUrl: "templates/map.html",
		  controller: "MapCtrl"
        }
      }
    })
    .state('eventmenu.about', {
      url: "/about",
      views: {
        'menuContent' :{
			templateUrl: "templates/about.html"
        }
      }
    })
  
  $urlRouterProvider.otherwise("/event/home");
})

.run(function($rootScope){
	$rootScope.xmlData = "";
	$rootScope.type = "";
    $rootScope.loadXML = function()
	{
        var client = new XMLHttpRequest();
		client.open('GET','http://www.canals.ny.gov/xml/locks.xml',true);
		client.onreadystatechange = function()
		{
			if(this.readyState === 4 && this.status === 200)
			{
				var parseXml = client.responseXML;
				var objList = parseXml.getElementsByTagName("locks");
				var lockList = objList[0].getElementsByTagName("lock");
				$rootScope.type = "Lock";
				
				var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
				$rootScope.xmlData = lockList;
				db.transaction($rootScope.recreateTable, $rootScope.errorDB, $rootScope.creationDone);
			}
		};
		client.send();
    };
	$rootScope.recreateTable = function(tx)
	{
		tx.executeSql('DROP TABLE IF EXISTS erie');
		tx.executeSql('CREATE TABLE IF NOT EXISTS erie ("type","mile" NUM,"name","lat" NUM,"lon" NUM,"phone","url")');
	};
	$rootScope.creationDone = function()
	{
		var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
		db.transaction($rootScope.populateData, $rootScope.errorDB, $rootScope.locksDone);
	};
	$rootScope.populateData = function(tx)
	{
		for(i=0;i<$rootScope.xmlData.length;i++)
		{
			if($rootScope.xmlData.item(i).getAttributeNode("bodyofwater").value == "Erie Canal")
			{
				var mile = parseFloat($rootScope.xmlData.item(i).getAttributeNode("mile").value);				
				var name = $rootScope.xmlData.item(i).getAttributeNode("name").value;
				if(name != $rootScope.xmlData.item(i).getAttributeNode("location").value)
				{
					name = name + " " + $rootScope.xmlData.item(i).getAttributeNode("location").value;
				}
				var xlat = parseFloat($rootScope.xmlData.item(i).getAttributeNode("latitude").value);
				var xlong = parseFloat($rootScope.xmlData.item(i).getAttributeNode("longitude").value);
				var phone = $rootScope.xmlData.item(i).getAttributeNode("phonenumber").value;
				if(phone=="NA")
				{
					phone = "";
				}
				tx.executeSql('INSERT INTO erie VALUES ("'+$rootScope.type+'","'+mile+'","'+name+'","'+xlat+'","'+xlong+'","'+phone+'","")');
			}
		}
	};
	$rootScope.locksDone = function()
	{
		var client = new XMLHttpRequest();
		client.open('GET','http://www.canals.ny.gov/xml/liftbridges.xml',true);
		client.onreadystatechange = function()
		{
			if(this.readyState === 4 && this.status === 200)
			{
				var parseXml = client.responseXML;
				var objList = parseXml.getElementsByTagName("liftbridges");
				var lockList = objList[0].getElementsByTagName("liftbridge");
				$rootScope.type = "Lift Bridge";
				
				var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
				$rootScope.xmlData = lockList;
				db.transaction($rootScope.populateData, $rootScope.errorDB, $rootScope.liftsDone);
			}
		};
		client.send();
	};
	$rootScope.liftsDone = function()
	{
		var client = new XMLHttpRequest();
		client.open('GET','http://www.canals.ny.gov/xml/guardgates.xml',true);
		client.onreadystatechange = function()
		{
			if(this.readyState === 4 && this.status === 200)
			{
				var parseXml = client.responseXML;
				var objList = parseXml.getElementsByTagName("guardgates");
				var lockList = objList[0].getElementsByTagName("guardgate");
				$rootScope.type = "Guard Gate";
				
				var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
				$rootScope.xmlData = lockList;
				db.transaction($rootScope.populateData, $rootScope.errorDB, $rootScope.guardsDone);
			}
		};
		client.send();
	};
	$rootScope.guardsDone = function()
	{
		var client = new XMLHttpRequest();
		client.open('GET','http://www.canals.ny.gov/xml/marinas.xml',true);
		client.onreadystatechange = function()
		{
			if(this.readyState === 4 && this.status === 200)
			{
				var parseXml = client.responseXML;
				var objList = parseXml.getElementsByTagName("marinas");
				var lockList = objList[0].getElementsByTagName("marina");
				
				var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
				$rootScope.xmlData = lockList;
				db.transaction($rootScope.populateMarina, $rootScope.errorDB, $rootScope.marinaDone);
			}
		};
		client.send();
	};
	$rootScope.populateMarina = function(tx)
	{
		for(i=0;i<$rootScope.xmlData.length;i++)
		{
			if($rootScope.xmlData.item(i).getAttributeNode("bodyofwater").value == "erie")
			{
				var mile = parseFloat($rootScope.xmlData.item(i).getAttributeNode("mile").value);
				var name = $rootScope.xmlData.item(i).getAttributeNode("marina").value;
				var xlat = parseFloat($rootScope.xmlData.item(i).getAttributeNode("latitude").value);
				var xlong = parseFloat($rootScope.xmlData.item(i).getAttributeNode("longitude").value);
				var phone = $rootScope.xmlData.item(i).getAttributeNode("phonenumber").value;
				var url = $rootScope.xmlData.item(i).getAttributeNode("marina_url").value;
				if(name.indexOf(" (")>0)
				{
					name = name.substring(0,name.indexOf(" ("));
				}
				else
				{
					tx.executeSql('INSERT INTO erie VALUES ("Marina","'+mile+'","'+name+'","'+xlat+'","'+xlong+'","'+phone+'","'+url+'")');
				}
			}
		}
	};
	$rootScope.marinaDone = function()
	{
		var client = new XMLHttpRequest();
		client.open('GET','http://www.canals.ny.gov/xml/canalwatertrail.xml',true);
		client.onreadystatechange = function()
		{
			if(this.readyState === 4 && this.status === 200)
			{
				var parseXml = client.responseXML;
				var objList = parseXml.getElementsByTagName("boatlaunches");
				var lockList = objList[0].getElementsByTagName("boatlaunch");
				
				var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
				$rootScope.xmlData = lockList;
				db.transaction($rootScope.populateLaunch, $rootScope.errorDB, $rootScope.launchDone);
			}
		};
		client.send();
	};
	$rootScope.populateLaunch = function(tx)
	{
		for(i=0;i<$rootScope.xmlData.length;i++)
		{
			if($rootScope.xmlData.item(i).getAttributeNode("bodyofwater").value == "erie")
			{
				var mile = parseFloat($rootScope.xmlData.item(i).getAttributeNode("mile").value);
				var name = $rootScope.xmlData.item(i).getAttributeNode("site_name").value;
				var xlat = parseFloat($rootScope.xmlData.item(i).getAttributeNode("latitude").value);
				var xlong = parseFloat($rootScope.xmlData.item(i).getAttributeNode("longitude").value);
				
				tx.executeSql('INSERT INTO erie VALUES ("Boat Launch","'+mile+'","'+name+'","'+xlat+'","'+xlong+'","","")');
			}
		}
	};
	$rootScope.launchDone = function()
	{
		$rootScope.$broadcast('dataLoaded');
	};
	$rootScope.errorDB = function(tx, err)
	{
		alert("Error processing SQL: "+err);
	};
})

.directive('menuTap', ['$ionicGesture', function($ionicGesture) {
    return {
        link: function($scope, $element, $attr) {
            $ionicGesture.on('tap', function(e) {
				$scope.sideMenuController.toggleLeft();
            }, $element);
        }
    };
}])

.factory('DataBase', function() {
return {
	errorDB: function(tx, err)
	{
		alert("Error processing SQL: "+err);
	},
	successDB: function()
	{
	},
	runOnce: true,
	sortOrder: !(window.localStorage['sortOrder'] == 'false'),
	lastLoaded: window.localStorage['lastLoaded'],
	showLift: (window.localStorage['showLift'] != 'false'),
	showGuard: (window.localStorage['showGuard'] != 'false'),
	showMarina: (window.localStorage['showMarina'] != 'false'),
	showLaunch: (window.localStorage['showLaunch'] != 'false'),
	filterString: "LockLift BridgeGuard GateMarinaBoat Launch",
	createString: function()
	{
		this.filterString = "Lock";
		if(this.showLift)
		{
			this.filterString = this.filterString + "Lift Bridge";
		}
		if(this.showGuard)
		{
			this.filterString = this.filterString + "Guard Gate";
		}
		if(this.showMarina)
		{
			this.filterString = this.filterString + "Marina";
		}
		if(this.showLaunch)
		{
			this.filterString = this.filterString + "Boat Launch";
		}
	},
	currentLat: 43.121345,
	currentLon: -77.642609,
	currentZoom: 13
};
})

.controller('HomeCtrl', function($scope, $ionicPlatform, $rootScope, DataBase)
{
	$scope.loadScreen = true;
	$scope.locationSuccess = function(position)
	{
		DataBase.currentLat = position.coords.latitude;
		DataBase.currentLon = position.coords.longitude;
	};
	$scope.locationError = function(error){};
	$ionicPlatform.ready(function()
	{
		if(DataBase.runOnce)
		{
			DataBase.runOnce = false;
			if(!DataBase.lastLoaded)
			{
				$rootScope.loadXML();
			}
			navigator.geolocation.getCurrentPosition($scope.locationSuccess, $scope.locationError);
		}
	});

	$scope.$on('dataLoaded', function(event, data)
	{
		var x = new Date();
		DataBase.lastLoaded = x.getTime();
		window.localStorage['lastLoaded'] = DataBase.lastLoaded;
		$scope.refresh();
	});
	
	$scope.DataBase = DataBase;
	$scope.allItems = [];
	$scope.refresh = function()
	{
		if(DataBase.lastLoaded)
		{
			DataBase.createString();
			$scope.loadScreen = false;
			var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
			db.transaction($scope.queryErie, DataBase.errorDB);
		}
	};
	$scope.queryErie = function(tx)
	{
		tx.executeSql('SELECT * FROM erie', [], $scope.erieSuccess, DataBase.errorDB);
	};
	$scope.erieSuccess = function(tx, results)
	{
		for(i=0;i<results.rows.length;i++)
		{
			var item = results.rows.item(i);
			$scope.allItems[$scope.allItems.length] = { name:item.name, mile:item.mile, type:item.type, lat:item.lat, lon:item.lon, phone:item.phone, url:item.url, urlShow:item.url.substring(7,item.url.length), expanded:false };
		}
		$scope.$apply();
	};
	
	$scope.refresh();
})

.controller('MainCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.leftButtons = [{
    type: 'button-icon button-clear ion-navicon',
    tap: function(e) {
      $ionicSideMenuDelegate.toggleLeft($scope.$$childHead);
    }
  }];
})

.controller('OptionCtrl', function($scope, $rootScope, DataBase) {
  $scope.canalOption = [
    { text: "West to East", value: true },
    { text: "East to West", value: false }
  ];
  $scope.radioChange = function()
  {
	DataBase.sortOrder = !DataBase.sortOrder;
	window.localStorage['sortOrder'] = ''+DataBase.sortOrder;
  };
  $scope.DataBase = DataBase;
  $scope.reloading = "";
  $scope.$on('dataLoaded', function(event, data)
  {
	$scope.reloading = "Data reload complete";
	$scope.$apply();
  });
  $scope.refreshData = function()
  {
	$scope.reloading = "Reloading data...";
	$scope.$apply();
	$rootScope.loadXML();
  };
  $scope.showLiftChange = function()
  {
	DataBase.showLift = !DataBase.showLift;
	window.localStorage['showLift'] = ''+DataBase.showLift;
	DataBase.createString();
  };
  $scope.showGuardChange = function()
  {
	DataBase.showGuard = !DataBase.showGuard;
	window.localStorage['showGuard'] = ''+DataBase.showGuard;
	DataBase.createString();
  };
  $scope.showMarinaChange = function()
  {
	DataBase.showMarina = !DataBase.showMarina;
	window.localStorage['showMarina'] = ''+DataBase.showMarina;
	DataBase.createString();
  };
  $scope.showLaunchChange = function()
  {
	DataBase.showLaunch = !DataBase.showLaunch;
	window.localStorage['showLaunch'] = ''+DataBase.showLaunch;
	DataBase.createString();
  };
})

.controller('MapCtrl', function($scope, DataBase) {
	$scope.requestMarkers = function(tx)
	{
		tx.executeSql('SELECT * FROM erie', [], $scope.addMarkers, DataBase.errorDB);
	};
	$scope.addMarkers = function(tx, results)
	{
		for(i=0;i<results.rows.length;i++)
		{
			var item = results.rows.item(i);
			
			if(DataBase.filterString.indexOf(item.type)>=0)
			{
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(item.lat, item.lon),
					map: $scope.map,
					title: item.name + " " + item.type
				});
				google.maps.event.addListener(marker, 'click', (function(marker){
					return function()
					{
						var newInfo = new google.maps.InfoWindow(
						{
							map: $scope.map,
							position: marker.position,
							content: marker.title
						});
					}
				})(marker));
			}
		}
		$scope.$apply();
		$scope.acceptClicks = true;
	};
	
	function initialize()
	{
		var mapOptions = {
			center: new google.maps.LatLng(DataBase.currentLat, DataBase.currentLon),
			zoom: DataBase.currentZoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		$scope.map = new google.maps.Map(document.getElementById("map"),mapOptions);
		
		google.maps.event.addListener($scope.map, 'center_changed', function()
		{
			DataBase.currentLat = $scope.map.getCenter().lat();
			DataBase.currentLon = $scope.map.getCenter().lng();
		});
		google.maps.event.addListener($scope.map, 'zoom_changed', function()
		{
			DataBase.currentZoom = $scope.map.getZoom();
		});
		
		var db = window.openDatabase("Database", "1.0", "CordovaDB", 100000);
		db.transaction($scope.requestMarkers, DataBase.errorDB);
	}
	google.maps.event.addDomListener(window, 'load', initialize); initialize();
})
