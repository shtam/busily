'use strict';

angular
	.module('busilyApp', [])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
      .when('/', {
        templateUrl: 'views/rotariser.html',
        controller: 'MainRotariser'
      })
	}]);
