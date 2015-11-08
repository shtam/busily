var app = angular.module("busilyApp");

app.controller("JuniorDoctorCalculator",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			$scope.finalRota = RotaStorage.getRota($http, localStorageService);
			console.log($scope.finalRota);

		}
	]);
