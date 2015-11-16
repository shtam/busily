var app = angular.module("busilyApp");

app.controller("RotaViewer",
	["$scope", "$mdDialog", "$http", "RotaStorage", "localStorageService", "Security",

		function ($scope, $mdDialog, $http, RotaStorage, localStorageService, Security) {

			var dbRota = {};
			var rotaStats = {};

			Security.isAuthenticated();

			RotaStorage.getRota().then(
				function (success) {
					$scope.finalRota = success;
					$scope.finalRota.startDate = new Date($scope.finalRota.startDate);

					dbRota = $scope.finalRota;

					$scope.prepareRota();

					console.log(dbRota);
				}
			);

			// returns overlap between [a1,a2] and [b1,b2]
			function getTimeOverlap(a1,a2,b1,b2) {
				if (b1 > b2) {
					return getTimeOverlap(a1,a2,0,b2) + getTimeOverlap(a1,a2,b1,24);
				}
				return Math.max(Math.min(a2,b2) - Math.max(a1,b1), 0);
			}

			function getTimeCategories(a,b,day) {
				var totalTime = 0;
				var plainTime = 0;  // 7am-10pm Mon-Fri, 7am-7pm Sat-Sun
				var satTime = 0;    // 7pm-10pm Sat
				var sunTime = 0;    // 7am-10pm Sun
				var nightTime = 0;  // 10pm-7am

				var plainTimeStart = 7;
				var plainTimeEnd = 22;
				var nightTimeStart = 22;
				var nightTimeEnd = 7;
				var satTimeStart = 19;
				var satTimeEnd = 22;
				var sunTimeStart = 7;
				var sunTimeEnd = 22;
				if (day == 0) plainTimeEnd = 7;
				if (day == 6) plainTimeEnd = 19;

				if (a <= b) {
					totalTime = b - a;
					plainTime = getTimeOverlap(a,b, plainTimeStart,plainTimeEnd);
					nightTime = getTimeOverlap(a,b, nightTimeStart,nightTimeEnd);
					if (day == 6) satTime = getTimeOverlap(a,b, satTimeStart,satTimeEnd);
					if (day == 0) sunTime = getTimeOverlap(a,b, sunTimeStart,sunTimeEnd);

					return {
						totalTime: totalTime,
						plainTime: plainTime,
						nightTime: nightTime,
						satTime: satTime,
						sunTime: sunTime
					};
				} else {
					var early = getTimeCategories(0, b, (day+1)%7);
					var late = getTimeCategories(a, 24, day);

					return {
						totalTime: early.totalTime + late.totalTime,
						plainTime: early.plainTime + late.plainTime,
						nightTime: early.nightTime + late.nightTime,
						satTime: early.satTime + late.satTime,
						sunTime: early.sunTime + late.sunTime
					};
				}
			}

			$scope.prepareRota = function() {
				// expand format stored in DB into something a bit more useful
				// [ {date:, day:, shiftType: }, ... ]

				var newRota = dbRota.pattern.map(function(elem, index) {
					var newDate = new Date(dbRota.startDate);
					newDate.setDate(newDate.getDate() + index);
					var day = newDate.getDay(); // Sunday = 0, Saturday = 6
					var onCall = false;
					var holiday = false;

					var timeCategories = getTimeCategories(0,0,day);

					var shift = elem.v[dbRota.userID];
					var shiftType = {};

					if (shift > -1) {
						shiftType = dbRota.shifts[shift];

						holiday = (shiftType.holiday) ? true : false;

						if (!holiday && shiftType.startTime.length > 0 && shiftType.endTime.length > 0) {

							onCall = (shiftType.nonResident) ? true : false;

							var startTime = shiftType.startTime[0] + (shiftType.startTime[1] == 30 ? 0.5 : 0);
							var endTime = shiftType.endTime[0] + (shiftType.endTime[1] == 30 ? 0.5 : 0);

							timeCategories = getTimeCategories(startTime, endTime, day);
						}
					}

					return {
						date: newDate,
						day: day,
						timeCategories: timeCategories,
						onCall: onCall,
						holiday: holiday,
						shift: shift,
						shiftType: shiftType
					}
				});

				$scope.rotaSummary = newRota.reduce(function (prev, cur, index) {
					if (index == 1) {
						return {
							firstDate: prev.date,
							lastDate: cur.date,
							totalDays: 2,
							workDays: (prev.timeCategories.totalTime > 0 ? 1 : 0) + (cur.timeCategories.totalTime > 0 ? 1 : 0),
							onCallDays: (prev.onCall ? 1 : 0) + (cur.onCall ? 1 : 0),
							holidayDays: (prev.holiday ? 1 : 0) + (cur.holiday ? 1 : 0),
							timeCategories: {
								totalTime: prev.timeCategories.totalTime + cur.timeCategories.totalTime,
								plainTime: prev.timeCategories.plainTime + cur.timeCategories.plainTime,
								nightTime: prev.timeCategories.nightTime + cur.timeCategories.nightTime,
								satTime: prev.timeCategories.satTime + cur.timeCategories.satTime,
								sunTime: prev.timeCategories.sunTime + cur.timeCategories.sunTime
							}
						}
					}

					return {
						//hoursPerWeek: /**/,
						//hoursPerWeekMax: /**/,
						//hoursPerWeekMin: /**/,
						firstDate: prev.firstDate,
						lastDate: cur.date,
						totalDays: prev.totalDays + 1,
						workDays: prev.workDays + (cur.timeCategories.totalTime > 0 ? 1 : 0),
						onCallDays: prev.onCallDays + (cur.onCall ? 1 : 0),
						holidayDays: prev.holidayDays + (cur.holiday ? 1 : 0),
						timeCategories: {
							totalTime: prev.timeCategories.totalTime + cur.timeCategories.totalTime,
							plainTime: prev.timeCategories.plainTime + cur.timeCategories.plainTime,
							nightTime: prev.timeCategories.nightTime + cur.timeCategories.nightTime,
							satTime: prev.timeCategories.satTime + cur.timeCategories.satTime,
							sunTime: prev.timeCategories.sunTime + cur.timeCategories.sunTime
						}
					}
				});

				$scope.rotaSummary.weeklyStats = calculateWeeklyStats($scope.rotaSummary);

				RotaStorage.setRota($scope.finalRota);
				RotaStorage.setRotaStats($scope.rotaSummary);
			};

			function calculateWeeklyStats(rotaSummary) {

				var weeks = rotaSummary.totalDays / 7;
				var totalHours = rotaSummary.timeCategories.totalTime / weeks;
				var plainHours = (rotaSummary.timeCategories.plainTime > 0) ? rotaSummary.timeCategories.plainTime / weeks : 0;
				var additionalRosteredHours = Math.max(0, plainHours - 40);
				var saturdayHours = (rotaSummary.timeCategories.satTime > 0) ? rotaSummary.timeCategories.satTime / weeks : 0;
				var sundayHours = (rotaSummary.timeCategories.sunTime > 0) ? rotaSummary.timeCategories.sunTime / weeks : 0;
				var nightHours = (rotaSummary.timeCategories.nightTime > 0) ? rotaSummary.timeCategories.nightTime / weeks : 0;
				var onCallDays = (rotaSummary.onCallDays > 0) ? rotaSummary.totalDays / rotaSummary.onCallDays : 0;

				var weeklyStats = {
					weeks: weeks,
					totalHours: totalHours,
					plainHours: plainHours,
					additionalRosteredHours: additionalRosteredHours,
					saturdayHours: saturdayHours,
					sundayHours: sundayHours,
					nightHours: nightHours,
					onCallDays: onCallDays
				}

				return weeklyStats;
			}

			$scope.formatDate = function (date, $index) {
				var dateOut = new Date(date);
				dateOut = dateOut.setDate(dateOut.getDate() + $index);
				return dateOut;
			}


			$scope.times = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

			function getTimeStr(h,m) {
				return time = h*2 + (m == 30) ? 1 : 0;
			}
			function getTimeNum(v) {
				var h = parseInt(v);
				var m = 0;

				if (h % 2) {
					m = 30;
					h -= 1;
				}
				h /= 2;
				return  h;
			}

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
						$scope.prepareRota();
					},
					function (error) {
						$scope.status = 'You cancelled the dialog.';
					}
				);


				//$scope.finalRota.shifts[1].colour = '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
			};

			$scope.hideEditShift = function (answer) {
				$mdDialog.hide(answer);

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
