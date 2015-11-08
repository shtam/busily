/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
	.factory("RotaStorage", function () {

		var rotaObject = {};
		var config = {
			headers: {}
		};

		return {
			getRota: function($http, localStorageService) {
				//if ($http != undefined && rotaObject.people == undefined) {
					//$http.get("getrota").success(function(data) {
					//	// fetch
					//});
				//} else
				if (localStorageService != undefined && rotaObject.people == undefined) {
					rotaObject = localStorageService.get("rota") || {};
				}
				return rotaObject;
			},
			setRota: function(rota, $http, localStorageService) {
				rotaObject = rota;

				if ($http != undefined) {
					$http.post("saverota", {o: rotaObject}).success(function (data, status, headers) {
						// save
					});
				}
				if (localStorageService != undefined) {
					localStorageService.set("rota", rota);
				}
				return rotaObject;
			}
		};
	});