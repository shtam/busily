'use strict';

/* Services */
angular.module('busilyApp')
	.factory("ShiftParseService",['$q',function($q){

		var worker = new Worker('scripts/services/shiftparser_worker.js');
		var defer;

		worker.addEventListener('message', function(e) {
			console.log('Worker said: ', e.data);
			defer.resolve(e.data);
			// defer.reject();
		}, false);

		return {
			doWork : function(myData){
				defer = $q.defer();
				defer.notify("working");
				worker.postMessage([myData]); // Send data to our worker.
				return defer.promise;
			}
		};

}]);
