/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
	.factory("RotaStorage", ['$http', 'localStorageService', function ($http, localStorageService) {

		var rotaObject = {};
		var config = {
			headers: {}
		};

		return {
			getRota: function(userID, rotaID) {
				return $http.get("api/rota")
					.then(
						function (success) {
							console.log(success);
							rotaObject = success.data[0];
							return rotaObject;
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

				return $http.post("/api/rota", {o: rotaObject})
					.then(
						function (success) {

						},
						function (error) {

						}
				)
			}
		};
	}]);
