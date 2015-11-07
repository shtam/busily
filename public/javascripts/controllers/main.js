'use strict';

angular.module('busilyApp')
	.config(function() {

	})
	.controller('MainCtrl', ["$scope", "localStorageService", function ($scope, localStorageService) {

		var todosInStore = localStorageService.get('todos');

		$scope.todos = todosInStore && todosInStore.split('\n') || [];

		$scope.$watch('todos', function () {
			localStorageService.add('todos', $scope.todos.join('\n'));
		}, true);

		$scope.addTodo = function () {
			$scope.todos.push($scope.todo);
			$scope.todo = '';
		};

		$scope.removeTodo = function (index) {
			$scope.todos.splice(index, 1);
		};
	}]);