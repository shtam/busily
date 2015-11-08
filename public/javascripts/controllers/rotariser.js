var app = angular.module("busilyApp");

app.controller("MainRotariser",
    ["$scope", "$mdDialog", "$location", "$http", "GridObject", "localStorageService", "RotaStorage", "findincremental", "datefinder", "RosterObject",
      function ($scope, $mdDialog, $location, $http, GridObject, localStorageService, RotaStorage, findincremental, datefinder, RosterObject) {

        function readFailDialog(ev) {
          $mdDialog.show(
              $mdDialog.alert()
                  .parent(angular.element(document.querySelector('#popupContainer')))
                  .clickOutsideToClose(true)
                  .title("It didn't work :-(")
                  .content("Your rota is too damn complicated. Try enter it manually.")
                  .ariaLabel("Bad news dialog")
                  .ok("Manual Entry")
                  .targetEvent(ev)
          );
        }

        function readSuccessDialog(ev) {
          $mdDialog.show({
            controller: function () {
              this.parent = $scope;
            },
            controllerAs: 'ctrl',
            templateUrl: 'rota-options.dialog.html',
            targetEvent: ev,
            clickOutsideToClose: true
          })
              .then(function (answer) {
	            if ($scope.finalRota.userID == -1) {
		            $scope.finalRota.userID = 0;
	            } else {
		            $scope.finalRota.userID = parseInt($scope.finalRota.userID);
	            }
	            RotaStorage.setRota($scope.finalRota).then(
		            function (success) {
			            $location.path('rotaviewer');
		            },
		            function (error) {
			            // try again
		            }
	            );

              }, function () {
                $scope.status = 'You cancelled the dialog.';
              });
        }

        $scope.hideRotaDialog = function (answer) {
          $mdDialog.hide(answer)
        };


        $scope.parseShifts = function (ev) {
          var rostObj = new RosterObject();
          if ($scope.shifts != undefined) {
            var gridRaw = Papa.parse($scope.shifts);

            if (gridRaw.errors.length == 0) {
              var grid = new GridObject();

              grid.load(gridRaw.data, 0, 0, "right");

              var dates = [];
              var weekdays = [];
              var blankrows = [];

              for (var row = 0; row < grid.getNumRows(); row++) {
                if (grid.getRow("right", row).join('').trim() == "") {
                  blankrows[row] = true;
                }
              }

              do {
                if (!blankrows[grid.getRowNum()]) {
                  var cellObj = grid.get();

                  if (datefinder(cellObj.value)) {
                    var rowMaybe = grid.getRow();
                    var found = false;

                    var datesMaybe = findincremental.numbers(rowMaybe, 0);
                    // search right first
                    var weekdaysMaybe = findincremental.days(rowMaybe, 0);

                    var curPos = {
                      row: grid.getRowNum(),
                      col: grid.getColNum()
                    };

                    if (datesMaybe[0] != -1) {
                      found = true;

                      rostObj.add(datesMaybe, curPos.row, curPos.col, curPos.row, curPos.col + datesMaybe.length - 1, "dates");

                      grid.setVisited(curPos.row, curPos.col, curPos.row, curPos.col + datesMaybe.length - 1);

                      // check it finds more than one in case there's more in the 'down' direction
                    } else if (weekdaysMaybe.length > 2) {
                      found = true;

                      rostObj.add(weekdaysMaybe, curPos.row, curPos.col, curPos.row, curPos.col + weekdaysMaybe.length - 1, "weekdays");

                      grid.setVisited(curPos.row, curPos.col, curPos.row, curPos.col + weekdaysMaybe.length - 1);
                    }

                    // no joy looking right; look down
                    if (!found) {
                      rowMaybe = grid.getRow("down");
                      datesMaybe = findincremental.numbers(rowMaybe, 0);
                      weekdaysMaybe = findincremental.days(rowMaybe, 0);

                      if (datesMaybe[0] != -1) {
                        found = true;

                        rostObj.add(datesMaybe, curPos.row, curPos.col, curPos.row + datesMaybe.length - 1, curPos.col, "dates");

                        grid.setVisited(curPos.row, curPos.col, curPos.row + datesMaybe.length - 1, curPos.col);

                      } else if (weekdaysMaybe.length > 2) {
                        found = true;

                        rostObj.add(weekdaysMaybe, curPos.row, curPos.col, curPos.row + weekdaysMaybe.length - 1, curPos.col, "weekdays");

                        grid.setVisited(curPos.row, curPos.col, curPos.row + weekdaysMaybe.length - 1, curPos.col);
                      }
                    }
                  }
                }

                grid.next(true, true);

              } while (!grid.isEnd());

              rostObj.consolidate(grid);

              if (rostObj.winners.length > 0) {
                var colNames = [];
                for (var cols = 0; cols <= grid.maxCol; cols++)
                  colNames.push(cols);
//console.log(rostObj.winners);


                var finalRota = {
                  shifts: [],
                  people: [],
                  pattern: [],
                  startDate: new Date()
                };
                var maxDays = 0;

                if (rostObj.winners[0].stats.date.foundMonthsYears.months != -1 && rostObj.winners[0].stats.date.foundMonthsYears.years != -1) {

                  if (rostObj.winners[0].dates[0].type == "weekdays" && rostObj.winners[0].dates[0].linked == 1) {
                    var winningDay = rostObj.winners[0].dates[1].values[0].parsed;
                  } else {
                    winningDay = rostObj.winners[0].dates[0].values[0].parsed;
                  }

                  finalRota.startDate = new Date(
                      rostObj.winners[0].stats.date.foundMonthsYears.years,
                      rostObj.winners[0].stats.date.foundMonthsYears.months[0]-1,
                      winningDay,
	                  0,
	                  0,
	                  0,
	                  0
                  );
                }

                var shiftLookup = {};
                var peopleLookup = {};

                var peeps = {};

                for (var wins = 0; wins < rostObj.winners.length; wins++) {
                  for (var shiftName in rostObj.winners[wins].stats.body.values) {
                    if (shiftName != "" && !(shiftName in shiftLookup)) {

                      var rxShiftTime = /(\d{1,2}):?(\d{2})\s*-\s*(\d{1,2}):?(\d{2})/;
                      var shiftTimeMatches = shiftName.match(rxShiftTime);

                      var endTime = [];
                      var startTime = [];
                      if (shiftTimeMatches) {
                        startTime = [parseInt(shiftTimeMatches[1]), parseInt(shiftTimeMatches[2])];
                        endTime = [parseInt(shiftTimeMatches[3]), parseInt(shiftTimeMatches[4])];
                      }

	                  var skyGradient = "sky-gradient-00";
                      if (startTime.length > 0) {
	                      skyGradient = "sky-gradient-"+("0" + startTime[0]).slice(-2);
                      }

                      finalRota.shifts.push({
                        name: shiftName,
                        startTime: startTime,
                        endTime: endTime,
                        //colour: '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6),
                        colour: skyGradient,
                        description: "",
                        nonResident: false,
                        holiday: false
                      });
                      shiftLookup[shiftName] = finalRota.shifts.length - 1;
                    }
                  }
                  for (var peepCount = 0; peepCount < rostObj.winners[wins].edge.values.length; peepCount++) {
                    var peepName = rostObj.winners[wins].edge.values[peepCount].join(" ").trim();
                    var rxCleanName1 = /\([^\)]*\)|\[[^\]]*\]/g; // get rid of "John Smith (Blah)" brackets
                    var rxCleanName2 = /[^A-Za-z]/ig; // just leave the names behind
                    peepName = peepName.replace(rxCleanName1, "").replace(rxCleanName2, "");

                    if (!(peepName in peopleLookup)) {
                      finalRota.people.push({
                        id: finalRota.people.length,
                        name: peepName
                      });
                      peopleLookup[peepName] = finalRota.people.length - 1;
                      peeps[peepName] = [];
                    }
                    for (var dateCount = 0; dateCount < rostObj.winners[wins].dates[0].values.length; dateCount++) {
                      peeps[peepName].push(
                          [rostObj.winners[wins].dates[0].values[dateCount].original,
                            rostObj.winners[wins].body.values[peepCount][dateCount].trim().toUpperCase()
                          ]);

                      if (peeps[peepName].length > maxDays)
                        maxDays = peeps[peepName].length;
                    }
                  }
                }

                // could use median number of days for all people - for now let's just use the number of days the first person has
                for (var lengthInDays = 0; lengthInDays < maxDays; lengthInDays++) {
                  finalRota.pattern.push({v:[]}); // mongo doesn't allow nested arrays, but you can have array->object->array...
                  for (peepCount = 0; peepCount < finalRota.people.length; peepCount++) {

                    peepName = finalRota.people[peepCount].name;
                    finalRota.pattern[lengthInDays].v[peopleLookup[peepName]] = -1; // assume not working

                    if (peeps[peepName].length > lengthInDays) {
                      shiftName = peeps[peepName][lengthInDays][1];

                      if (shiftName != "") { // blank shift
	                      finalRota.pattern[lengthInDays].v[peopleLookup[peepName]] = shiftLookup[shiftName];
                      }
                    }
                  }
                }

                finalRota.userID = -1;
                if (finalRota.people.length > 1)
                  finalRota.userID = 0;

                $scope.finalRota = finalRota;

                console.log(finalRota);

                readSuccessDialog();

                /*            var winResults = [];
                 for (var winRow=0; winRow<=grid.maxRow; winRow++) {
                 winResults[winRow] = [];
                 for (var winCol=0; winCol<=grid.maxCol; winCol++) {
                 winResults[winRow][winCol] = {
                 value: grid.grid[winRow][winCol],
                 class: ""
                 };
                 }
                 }
                 for (var wins=0; wins<rostObj.winners.length; wins++) {
                 for (winRow=rostObj.winners[wins].body.startRow; winRow<=rostObj.winners[wins].body.endRow; winRow++) {
                 for (winCol=rostObj.winners[wins].body.startCol; winCol<=rostObj.winners[wins].body.endCol; winCol++) {
                 winResults[winRow][winCol].class = "rotabody";
                 }
                 }
                 if (rostObj.winners[wins].edge.startRow >= 0 && rostObj.winners[wins].edge.startCol >= 0) {
                 for (winRow = rostObj.winners[wins].edge.startRow; winRow <= rostObj.winners[wins].edge.endRow; winRow++) {
                 for (winCol = rostObj.winners[wins].edge.startCol; winCol <= rostObj.winners[wins].edge.endCol; winCol++) {
                 winResults[winRow][winCol].class = "rotaedge";
                 }
                 }
                 }
                 for (var winDates=0; winDates<rostObj.winners[wins].dates.length; winDates++) {
                 for (winRow=rostObj.winners[wins].dates[winDates].startRow; winRow<=rostObj.winners[wins].dates[winDates].endRow; winRow++) {
                 for (winCol=rostObj.winners[wins].dates[winDates].startCol; winCol<=rostObj.winners[wins].dates[winDates].endCol; winCol++) {
                 winResults[winRow][winCol].class = "rotadate";
                 }
                 }
                 }
                 }


                 var gridDisplay = {
                 rows:winResults,
                 cols:colNames,
                 };

                 $scope.importedRota = gridDisplay;
                 */
              } else { // no winners
                readFailDialog();
              }
            } else {
              readFailDialog();
            }
          } else {
            readFailDialog();
          }
        }

      }]);


function DialogController($scope, $mdDialog) {

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}