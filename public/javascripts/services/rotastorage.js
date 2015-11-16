/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
	.factory("RotaStorage", ['$http', 'localStorageService', function ($http, localStorageService) {

		var rotaObject = {};
		var rotaStats = {};
		var calculatedSalary = {};

		var config = {
			headers: {}
		};

		return {
			getRota: function() {
				if (localStorageService != undefined && rotaObject.people == undefined) {
					rotaObject = localStorageService.get("rota") || {};
				}
				return rotaObject;
			},
			setRota: function(rota) {
				rotaObject = rota;

				if (localStorageService != undefined) {
					localStorageService.set("rota", rota);
				}
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
			},
			getCalculatedSalary: function(userID, rotaID) {
				if (localStorageService != undefined && calculatedSalary.grade == undefined) {
					calculatedSalary = localStorageService.get("calculatedSalary") || {};
				}
				return calculatedSalary;
			},
			setCalculatedSalary: function(calc) {
				calculatedSalary = calc;
				if (localStorageService != undefined) {
					localStorageService.set("calculatedSalary", calculatedSalary);
				}
			},
			getRotaDB: function() {
				return $http.get("api/rota")
					.then(
					function (success) {
						if (success.data != null) {
							rotaObject = success.data[success.data.length - 1];
							return rotaObject;
						} else {
						}
					},
					function (error) {
					}
				)
			},
			setRotaDB: function(rota) {
				rotaObject = rota;

				if (rotaObject._id != undefined) {
					return $http.put("api/rota/" + rotaObject._id, {o: rotaObject})
						.then(
						function (success) {
						},
						function (error) {
						});
				} else {

					return $http.post("api/rota", {o: rotaObject})
						.then(
						function (success) {
						},
						function (error) {
						}
					);
				}
			}
		};
	}]);