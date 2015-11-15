
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
}]);

app.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).format('YYYY-MM-DD');
	};
}]);



app.factory('Security', function ($location) {
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
		login: function (username, password) {
			this.currentUser = {username: username, email: username+"@example.com" };
			this.isLoginShown = false;
		},
		signup: function (username, email, password1, password2) {
			this.currentUser = {username: username, email: email};
			this.isSignupShown = false;
		},
		logout: function () {
			delete this.currentUser;
		},
		isAuthenticated: function () {
			return !!this.currentUser;
		}
	};
});

app.directive("login", function () {
	return {
		restrict: "E",
		scope: {},
		replace: true,
		templateUrl: "views/login.html",
		controller: function ($scope, Security) {
			$scope.security = Security;
		},
		link: function (scope) {
		}
	}
});
app.directive("loginToolbar", function () {
	return {
		restrict: "E",
		scope: {},
		replace: true,
		templateUrl: "views/login-toolbar.html",
		controller: function ($scope, Security) {
			$scope.security = Security;
		},
		link: function (scope) {
		}
	}
});
