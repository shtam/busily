/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
	.factory("RotaStorage", ['$http', 'localStorageService', function ($http, localStorageService) {

		var rotaObject = {};
		var rotaStats = {};
		var config = {
			headers: {}
		};

		return {
			getRota: function(userID, rotaID) {
				return $http.get("api/rota")
					.then(
					function (success) {
						if (success.data != null) {
							rotaObject = success.data[success.data.length-1];
							return rotaObject;
						} else {
							if (localStorageService != undefined && rotaObject.people == undefined) {
								rotaObject = localStorageService.get("rota") || {};
							}
							return rotaObject;
						}
					},
					function (error) {
						if (localStorageService != undefined && rotaObject.people == undefined) {
							rotaObject = localStorageService.get("rota") || {};
						}
						return rotaObject;
					}
				)
			},
			setRota: function(rota) {
				rotaObject = rota;

				if (localStorageService != undefined) {
					localStorageService.set("rota", rota);
				}

				return $http.post("api/rota", {o: rotaObject})
					.then(
					function (success) {

					},
					function (error) {

					}
				)
			},
			getRotaStats: function(userID, rotaID) {
				if (localStorageService != undefined && rotaStats.weeks == undefined) {
					rotaStats = localStorageService.get("rotaStats") || {};
				}
				return rotaStats;
			},
			setRotaStats: function(stats) {
				rotaStats = stats;
				if (localStorageService != undefined) {
					localStorageService.set("rotaStats", rotaStats);
				}
			}
		};
	}]);