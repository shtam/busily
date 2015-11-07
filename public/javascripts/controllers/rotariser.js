var app = angular.module("busilyApp");

app.controller("MainRotariser",
    ["$scope", "GridObject", "findincremental", "datefinder", "RosterObject",
      function ($scope, GridObject, findincremental, datefinder, RosterObject) {

        $scope.parseShifts = function () {
          var rostObj = new RosterObject();
          var gridRaw = Papa.parse($scope.shifts);

          if (gridRaw.errors.length == 0) {
            var grid = new GridObject();

            grid.load(gridRaw.data, 0, 0, "right");

            var dates = [];
            var weekdays = [];
            var blankrows = [];

            for (var row=0; row<grid.getNumRows(); row++) {
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

                  // search right first
                  var datesMaybe = findincremental.numbers(rowMaybe, 0);
                  var weekdaysMaybe = findincremental.days(rowMaybe, 0);

                  var curPos = {
                    row:grid.getRowNum(),
                    col:grid.getColNum()
                  };

                  if (datesMaybe[0] != -1) {
                    found = true;

                    rostObj.add(datesMaybe, curPos.row, curPos.col, curPos.row, curPos.col+datesMaybe.length-1, "dates");

                    grid.setVisited(curPos.row, curPos.col, curPos.row, curPos.col+datesMaybe.length-1);

                  // check it finds more than one in case there's more in the 'down' direction
                  } else if (weekdaysMaybe.length > 2) {
                    found = true;

                    rostObj.add(weekdaysMaybe, curPos.row, curPos.col, curPos.row, curPos.col+weekdaysMaybe.length-1, "weekdays");

                    grid.setVisited(curPos.row, curPos.col, curPos.row, curPos.col+weekdaysMaybe.length-1);
                  }

                  // no joy looking right; look down
                  if (!found) {
                    rowMaybe = grid.getRow("down");
                    datesMaybe = findincremental.numbers(rowMaybe, 0);
                    weekdaysMaybe = findincremental.days(rowMaybe, 0);

                    if (datesMaybe[0] != -1) {
                      found = true;

                      rostObj.add(datesMaybe, curPos.row, curPos.col, curPos.row+datesMaybe.length-1, curPos.col, "dates");

                      grid.setVisited(curPos.row, curPos.col, curPos.row+datesMaybe.length-1, curPos.col);

                    } else if (weekdaysMaybe.length > 2) {
                      found = true;

                      rostObj.add(weekdaysMaybe, curPos.row, curPos.col, curPos.row+weekdaysMaybe.length-1, curPos.col, "weekdays");

                      grid.setVisited(curPos.row, curPos.col, curPos.row+weekdaysMaybe.length-1, curPos.col);
                    }
                  }
                }
              }

              grid.next(true, true);

            } while (!grid.isEnd());

            rostObj.consolidate(grid);

            var colNames = [];
            for (var cols=0; cols<=grid.maxCol; cols++)
              colNames.push(cols);
console.log(rostObj.winners);


            var finalRota = {
              shifts:[],
              people:[],
              pattern:[],
              startDate:new Date()
            };

            if (rostObj.winners[0].stats.date.foundMonthsYears.months != -1 && rostObj.winners[0].stats.date.foundMonthsYears.years != -1) {

              if (rostObj.winners[0].dates[0].type == "weekdays" && rostObj.winners[0].dates[0].linked == 1) {
                var winningDay = rostObj.winners[0].dates[1].values[0].parsed;
              } else {
                winningDay = rostObj.winners[0].dates[0].values[0].parsed;
              }

              finalRota.startDate.setFullYear(
                  rostObj.winners[0].stats.date.foundMonthsYears.years,
                  rostObj.winners[0].stats.date.foundMonthsYears.months[0],
                  winningDay
              );
            }

            var shiftLookup = {};
            var peopleLookup = {};

            var peeps = {};

            for (var wins=0; wins<rostObj.winners.length; wins++) {
              for (var shiftName in rostObj.winners[wins].stats.body.values) {
                if (shiftName != "" && !(shiftName in shiftLookup)) {
                  finalRota.shifts.push({
                    name: shiftName,
                    startTime: [],
                    endTime: [],
                    colour: "",
                    description: ""
                  });
                  shiftLookup[shiftName] = finalRota.shifts.length-1;
                }
              }
              for (var peepCount = 0; peepCount < rostObj.winners[wins].edge.values.length; peepCount++) {
                var peepName = rostObj.winners[wins].edge.values[peepCount].join(" ").trim();
                if (!(peepName in peopleLookup)) {
                  finalRota.people.push({
                    id: finalRota.people.length,
                    name: peepName
                  });
                  peopleLookup[peepName] = finalRota.people.length-1;
                  peeps[peepName] = [];
                }
                for (var dateCount = 0; dateCount < rostObj.winners[wins].dates[0].values.length; dateCount++) {
                  peeps[peepName].push(
                      [rostObj.winners[wins].dates[0].values[dateCount].original,
                        rostObj.winners[wins].body.values[peepCount][dateCount].trim().toUpperCase()
                      ]);
                }
              }
            }
            // could use median number of days for all people - for now let's just use the number of days the first person has
            for (var lengthInDays=0; lengthInDays < peeps[finalRota.people[0].name].length; lengthInDays++) {
              finalRota.pattern.push([]);
              for (peepCount = 0; peepCount < finalRota.people.length; peepCount++) {
                peepName = finalRota.people[peepCount].name;
                shiftName = peeps[peepName][lengthInDays][1];

                if (shiftName != "") { // blank shift
                  finalRota.pattern[lengthInDays][peopleLookup[peepName]] = shiftLookup[shiftName];
                }
              }
            }

console.log(finalRota);

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
          }
        }

      }]);
