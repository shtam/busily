
var app = angular.module('busilyApp', [
	'ngMaterial',
	'ngRoute',
	'ngResource',
	'LocalStorageModule'
	]);


app.controller('AppController', function($mdSidenav) {
	var vm = this;

	vm.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	};

});

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/rotariser.html',
			controller: 'MainRotariser'
		})
		.when('/rotaviewer', {
			templateUrl: 'views/rotaviewer.html',
			controller: 'RotaViewer'
		})
		.when('/salary', {
			templateUrl: 'views/salarycalc.html',
			controller: 'SalaryCalc'
		})
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'Login'
		})
		//.when('/admin', {
		//	templateUrl: 'views/admin.html',
		//	controller: 'AdminCtrl',
		//	resolve: {
		//		loggedin: checkLoggedin
		//	}
		//})
}]);

app.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).format('YYYY-MM-DD');
	};
}]);


/* http://codepen.io/kyleledbetter/pen/gbQOaV */
app.config(['$mdThemingProvider', function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
			.accentPalette('orange');
	}]);



app.factory('Security', ["$location", "$http", function ($location, $http) {

	var user = {};

	return {
		showLogin: function () {
			this.isSignupShown = false;
			this.isLoginShown = true;
		},
		isLoginShown: false,
		showSignup: function () {
			this.isLoginShown = false;
			this.isSignupShown = true;
		},
		isSignupShown: false,
		login: function (email, password) {
			this.isLoginShown = false;

			return $http.post("api/login", {email: email, password: password})
				.then(
				function (success) {
					user = success.data;
					$location.url('/');
				},
				function (error) {
				}
			)
		},
		signup: function (email, password) {
			this.currentUser = {username: username, email: email};
			this.isSignupShown = false;

			return $http.post("api/login", {email: email, password: password})
				.then(
				function (success) {
					user = success.data;
					$location.url('/');
				},
				function (error) {
				}
			)
		},
		logout: function () {
			this.user = {};

			return $http.post("api/logout")
				.then(
				function (success) {
					$location.url('/');
				},
				function (error) {
					$location.url('/');
				});
		},
		isAuthenticated: function () {
			if (user._id == undefined) {
				return $http.get("api/loggedin")
					.then(
					function (success) {
						user = success.data;
						this.isLoggedIn = true;
						console.log(user);
						return user;
					},
					function (error) {
						this.isLoggedIn = false;
						return false;
					});
			} else {
				return user;
			}
		},
		isLoggedIn: false
	};
}]);

//app.directive("login", function () {
//	return {
//		restrict: "E",
//		scope: {},
//		replace: true,
//		templateUrl: "views/login.html",
//		controller: function ($scope, Security) {
//			$scope.security = Security;
//		},
//		link: function (scope) {
//		}
//	}
//});
app.directive("loginToolbar", function () {
	return {
		restrict: "E",
		scope: {},
		replace: true,
		templateUrl: "views/login-toolbar.html",
		controller: function ($scope, Security) {
			$scope.security = Security;
			$scope.security.isAuthenticated();
			console.log("help",$scope.security.isLoggedIn);
		}
	}
});


app.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
	//================================================
	// Check if the user is connected
	//================================================
	var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
		// Initialize a new promise
		var deferred = $q.defer();

		// Make an AJAX call to check if the user is logged in
		$http.get('/api/loggedin').success(function(user){
			// Authenticated
			if (user !== '0')
			/*$timeout(deferred.resolve, 0);*/
				deferred.resolve();

			// Not Authenticated
			else {
				$rootScope.message = 'You need to log in.';
				//$timeout(function(){deferred.reject();}, 0);
				deferred.reject();
				$location.url('/login');
			}
		});

		return deferred.promise;
	};
	//================================================

	//================================================
	// Add an interceptor for AJAX errors
	//================================================
	$httpProvider.interceptors.push(function($q, $location) {
		return {
			response: function(response) {
				// do something on success
				return response;
			},
			responseError: function(response) {
				if (response.status === 401)
					$location.url('/login');
				return $q.reject(response);
			}
		};
	});
	//================================================
}]);