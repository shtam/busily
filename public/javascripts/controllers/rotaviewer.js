var app = angular.module("busilyApp");

app.controller("RotaViewer",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			RotaStorage.getRota().then(
				function (success) {
					$scope.finalRota = success;
					console.log($scope.finalRota);
				}
			);

			$scope.formatDate = function (date, $index) {
				var dateOut = new Date(date);
				dateOut = dateOut.setDate(dateOut.getDate() + $index);
				return dateOut;
			}

		}
	]);
