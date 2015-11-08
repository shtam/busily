var app = angular.module("busilyApp");

app.controller("RotaViewer",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService) {

			RotaStorage.getRota().then(
				function (success) {
					$scope.finalRota = success;
					$scope.finalRota.startDate = new Date($scope.finalRota.startDate);

					console.log($scope.finalRota);
				}
			);

			$scope.formatDate = function (date, $index) {
				var dateOut = new Date(date);
				dateOut = dateOut.setDate(dateOut.getDate() + $index);
				return dateOut;
			}


			$scope.times = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

			$scope.editShift = function(shiftID) {

				$mdDialog.show({
					controller: function() {
						this.parent = $scope;
						this.shiftID = shiftID;

						this.name = $scope.finalRota.shifts[shiftID].name;
						this.nonResident = $scope.finalRota.shifts[shiftID].nonResident;
						this.holiday = $scope.finalRota.shifts[shiftID].holiday;

						this.startTime = 0;
						this.endTime = 0;
						if ($scope.finalRota.shifts[shiftID].startTime.length > 0) {
							this.startTime = $scope.finalRota.shifts[shiftID].startTime[0]*2;
							if ($scope.finalRota.shifts[shiftID].startTime[1] == 30)
								this.startTime++;
						}
						if ($scope.finalRota.shifts[shiftID].endTime.length > 0) {
							this.endTime = $scope.finalRota.shifts[shiftID].endTime[0]*2;
							if ($scope.finalRota.shifts[shiftID].endTime[1] == 30)
								this.endTime++;
						}
					},
					controllerAs: 'ctrl',
					templateUrl: 'edit-shift.dialog.html',
					clickOutsideToClose: true
				})
				.then(
					function (success) {

					},
					function (error) {
						$scope.status = 'You cancelled the dialog.';
					}
				);


				//$scope.finalRota.shifts[1].colour = '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
			}
			$scope.hideEditShift = function (answer) {
				$mdDialog.hide(answer);
				console.log(answer);

				$scope.finalRota.shifts[answer.shiftID].name = answer.name;
				$scope.finalRota.shifts[answer.shiftID].nonResident = answer.nonResident;
				$scope.finalRota.shifts[answer.shiftID].holiday = answer.holiday;

				var startTime = parseInt(answer.startTime);
				var endTime = parseInt(answer.endTime);

				if (startTime % 2) {
					$scope.finalRota.shifts[answer.shiftID].startTime[1] = 30;
					startTime -= 1;
				}
				startTime /= 2;
				$scope.finalRota.shifts[answer.shiftID].startTime[0] = startTime;

				if (endTime % 2) {
					$scope.finalRota.shifts[answer.shiftID].endTime[1] = 30;
					endTime -= 1;
				}
				endTime /= 2;
				$scope.finalRota.shifts[answer.shiftID].endTime[0] = endTime;

				$scope.finalRota.shifts[answer.shiftID].colour = "sky-gradient-"+("0" + startTime).slice(-2);
			};

		}
	]);
