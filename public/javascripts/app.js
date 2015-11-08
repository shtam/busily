
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
		.when('/juniordoctorcalculator', {
			templateURL: 'views/juniordoctorcalculator.html',
			controller: 'JuniorDoctorCalculator'
		})
}]);

app.config(function($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function(date) {
		return moment(date).format('YYYY-MM-DD');
	};
});
