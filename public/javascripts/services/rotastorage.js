/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
	.factory("RotaStorage", function () {

		var rotaObject = {};

		return {
			getRota: function(localStorageService) {
				if (localStorageService != undefined && rotaObject.people == undefined) {
					rotaObject = localStorageService.get("rota") || {};
				}
				return rotaObject;
			},
			setRota: function(rota, localStorageService) {
				rotaObject = rota;

				if (localStorageService != undefined) {
					localStorageService.set("rota", rota);
				}
				return rotaObject;
			}
		};
	});