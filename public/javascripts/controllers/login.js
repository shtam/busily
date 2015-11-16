var app = angular.module("busilyApp");

app.controller("Login",
	["$scope", "$http", "Security",

		function ($scope, $http, Security) {

			$scope.security = Security;
		}

	]);
