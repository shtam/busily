var app = angular.module("busilyApp");

app.controller("RotaViewer",
	["$scope", "$mdDialog", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, RotaStorage, localStorageService) {

			$scope.finalRota = RotaStorage.getRota(localStorageService);
			console.log($scope.finalRota);



		}
	]);
