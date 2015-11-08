var app = angular.module("busilyApp");

app.controller("RotaViewer",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			$scope.finalRota = RotaStorage.getRota(localStorageService);
			console.log($scope.finalRota);



		}
	]);
