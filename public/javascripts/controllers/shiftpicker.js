/**
 * Created by Andy on 21/05/2014.
 */

'use strict';

angular.module("busilyApp")
	.value("FixDates", function(str) {
		return str.replace(/\b(TUE|WED|THU)R?S?\b/gi, "$1");
	})
	.controller("MainShiftPicker", ["$scope", "PapaParser", "Rotator", "GridObject", function ($scope, PapaParser, Rotator, GridObject) {

		$scope.message = {
			text: 'hello world!',
			time: new Date()
		};


		var count = 0;
		var testGrid = [];
		for(var i=0; i<10; i++) {
			for (var j=0; j<10; j++) {
				count++;
				if (j == 0) testGrid[i] = [];
				testGrid[i][j] = count;
			}
		}
		var grid = new GridObject();
		grid.load(testGrid, 0, 0, "right");

		console.log(grid.get());
		console.log(grid.next(true));
		console.log(grid.next(true));
		console.log(grid.next(false));
		console.log(grid.next(false));
		console.log(grid.next(true));

		grid.setPath("down", 3, 3, 0, 0, 0, 0, true, true);
		console.log("blah");
		for (var i=0; i<20; i++) {
			var a = grid.next(true);
			console.log(a);
		}


		function countDates (grid, firstRow, firstCol, direction) {

			var min = 0;
			var max = 0;
			var cell = "";
			var dateFormat = "";
			var dates = [];
			var dateFormats = [];
			var date;
			var count = 0;
			var blankCount = 0;
			var daysCount = 0;
			var totalCount = 0;
			var increasing = true;

			if (direction == "down") {
				min = firstRow;
				max = grid.length;
			} else {
				min = firstCol;
				max = grid[firstRow].length;
			}

			for (var i=min; i<max; i++) {
				if (direction == "down") {
					cell = grid[i][firstCol].trim();
				} else {
					cell = grid[firstRow][i].trim();
				}

				if (!(cell == "" || cell.length <= 0)) {

					dateFormat = moment.parseFormat(cell);
					date = moment(cell, dateFormat);

					if (dateFormat.match(/^(d+|do)$/)) {
						count++;
						daysCount++;

						dateFormats.push(dateFormat);

					} else if (date.format(dateFormat).toLowerCase() == cell.toLowerCase()) {
						count++;
						dates.push(date);
						dateFormats.push(dateFormat);

						if (count > 1 && !increasing) {
							if (dates[count-1].isBefore(dates[count-2])) {
								increasing = false;
							}
						}
					} else {
						break;
					}

				} else {
					blankCount++;
				}
			}

			return {
				dates: dates,
				increasing: increasing,
				count: count,
				blankCount: blankCount,
				daysCount: daysCount,
				totalCount: count+blankCount+daysCount,
				dateFormats: dateFormats,
				firstRow: firstRow,
				firstCol: firstCol,
				lastRow: (direction == "down" ? max : firstRow),
				lastCol: (direction == "down" ? firstCol : max)
			};
		}


		var testDates = [['18-Mar','','19-Mar','','20-Mar','21-Mar','22-Mar','23-Mar','24-Mar']];
		var testDates2 = [['Mon','Tue','Wed','Thu','Fri','Sat','Sun']];
		var testDates3 = [['01/01'],['02/01'],['03/01'],['04/01']];

//		console.log(countDates (testDates3, 0, 0, "down"));

		$scope.parseShifts = function () {

			var parser = new PapaParser();
			var grid = parser.parse($scope.shifts);

			if (grid.errors.length == 0) {
				var gridObj,
					counts = {},
					date,
					dates = [],
					tempDates = {},
					names = [],
					blankrows = [],
					ignoreRow = [],
					ignoreCol = [],
					dateFormat,
					dateFormatR,
					dateFormatB,
					cell,
					cellObj,
					tempRow,
					cellR,
					cellB;

				counts.all = {};
				counts.dates = {};

				for (var row=0; row<grid.results.length; row++) {
					if (grid.results[0].join('').trim() == "") {
						blankrows[row] = true;
					}
				}

				gridObj = new GridObject();
				gridObj.load(grid.results, 0, 0, "right");

				do {
					if (!blankrows[gridObj.getRowNum()]) {
						cellObj = gridObj.get();
						cell = moment.fixWeekDays(cellObj.value.trim());
						cellR = moment.fixWeekDays(gridObj.get(cellObj.row, cellObj.col+1).value.trim());
						cellB = moment.fixWeekDays(gridObj.get(cellObj.row+1, cellObj.col).value.trim());

						dateFormat = moment.parseFormat(cell);
						dateFormatR = moment.parseFormat(cellR);
						dateFormatB = moment.parseFormat(cellB);

						date = moment(cell, dateFormat);

						if (date.format(dateFormat).toLowerCase() == cell.toLowerCase()) {
							if (dateFormat == dateFormatR || dateFormat == dateFormatB) {
								if (dateFormat == dateFormatR) {
									tempRow = gridObj.getRow("right", cellObj.row, cellObj.col + 1);
								} else {
									tempRow = gridObj.getRow("down", cellObj.row + 1, cellObj.col);
								}
								for (var col=0; col<tempRow.length; col++) {
									if (moment(tempRow[col], dateFormat).format(dateFormat).toLowerCase() == tempRow[col].toLowerCase()) {

									}
								}
							}
							// TODO: numeric-only or weekday-only, i.e. 1 2 3 or M T W
						}
					}
					gridObj.next(true);

				} while (!gridObj.isEnd());



//				for (var row=0; row<grid.results.length; row++) {
//					if (!blankrows[row]) {
//						for (var col = 0; col < grid.results[row].length; col++) {
//
//							if ((ignoreCol.length > 0 && (ignoreCol[0] != col || row > ignoreCol[1])) ||
//								(ignoreRow.length > 0 && (ignoreRow[0] != row || col > ignoreRow[1])) ||
//								(ignoreRow.length == 0 && ignoreCol.length == 0)) {
//
//								if (col < grid.results[row].length - 2 && row < grid.results.length - 2) {
//									cell = grid.results[row][col].trim();
//									cellR = grid.results[row][col + 1].trim();
//									cellB = grid.results[row + 1][col].trim();
//
//									dateFormat = moment.parseFormat(cell);
//									dateFormatR = moment.parseFormat(cellR);
//									dateFormatB = moment.parseFormat(cellB);
//
//									date = moment(cell, dateFormat);
//
//									if (date.format(dateFormat).toLowerCase() == cell.toLowerCase()) {
//										if (dateFormat == dateFormatR) {
//											tempDates = countDates(grid.results, row, col, "right");
//
//											if (tempDates.increasing && tempDates.count > tempDates.daysCount) {
//												dates.push(tempDates);
//												ignoreRow = [row, col + tempDates.totalCount];
//											}
//											/* TODO: weekday only rotas */
//										} else if (dateFormat == dateFormatB) {
//											tempDates = countDates(grid.results, row, col, "down");
//
//											if (tempDates.increasing && tempDates.count > tempDates.daysCount) {
//												dates.push(tempDates);
//												ignoreCol = [col, row + tempDates.totalCount];
//											}
//										}
//									} else {
//										counts.all[cell] = (counts.all[cell] || 0) + 1;
//									}
//								}
//
//							} else {
//								if (ignoreCol[1] == row)
//									ignoreCol = [];
//								if (ignoreRow[1] == col)
//									ignoreRow = [];
//							}
//						}
//					}
//				}
console.log(dates);
console.log(grid);
			}

		};
	}]);
