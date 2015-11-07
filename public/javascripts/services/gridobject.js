/**
 * Created by Andy on 21/05/2014.
 */

'use strict';

angular.module("busilyApp")
	.factory("GridObject", function () {

		function GridObject () {
			this.grid = [];
			this.visited = [];
			this.path = {};
      this.maxRow = -1;
      this.maxCol = -1;
		}

		GridObject.prototype.load = function(array, startRow, startCol, direction) {
			if (array.length > 0 && array[0].length > 0) {
				this.grid = array;

				this.visited = [];
				for (var i=0; i<this.grid.length; i++) {
					this.visited[i] = [];
				}

				this.setPath(direction, -1, -1, -1, -1, startRow, startCol);
        this.maxRow = this.path.maxRow;
        this.maxCol = this.path.maxCol;
			}
		}

    GridObject.prototype.setPath = function(direction, maxRow, maxCol, minRow, minCol, startRow, startCol, skipVisited, nestflag) {
      var tempPath = {
        curRow: 0,
        curCol: 0,
        minRow: 0,
        minCol: 0,
        maxRow: this.grid.length-1,
        maxCol: this.grid[0].length-1,
        direction: "right",
        nextPath: {},
        skipVisited: true,
        end: false
      };

      for (var i=0; i<=this.grid.length-1; i++) {
        if (this.grid[i].length-1 > tempPath.maxCol) {
          tempPath.maxCol = this.grid[i].length - 1;
        }
      }

      if (nestflag == true)
        tempPath.nextPath = this.path;
      if (direction == "right" || direction == "down")
        tempPath.direction = direction;
			if (maxRow > 0)
				tempPath.maxRow = Math.min(tempPath.maxRow, maxRow);
			if (maxCol > 0)
				tempPath.maxCol = Math.min(tempPath.maxCol, maxCol);
			if (minRow > 0)
				tempPath.minRow = Math.min(tempPath.maxRow, minRow);
			if (minCol > 0)
				tempPath.minCol = Math.min(tempPath.maxCol, minCol);
			if (startRow > 0)
				tempPath.curRow = Math.min(tempPath.maxRow, startRow);
			if (startCol > 0)
				tempPath.curCol = Math.min(tempPath.maxCol, startCol);
			if (skipVisited in [true, false])
				tempPath.skipVisited = skipVisited;

			if (tempPath.curCol == tempPath.maxCol && tempPath.curRow == tempPath.maxRow)
				tempPath.end = true;

			this.path = tempPath;

			return true;
		}

		GridObject.prototype.goto = function(row, col) {
			if (row >= this.path.minRow && row <= this.path.maxRow)
				this.path.curRow = row;
			if (col >= this.path.minCol && col <= this.path.maxCol)
				this.path.curCol = col;

			if (this.path.curCol == this.path.maxCol && this.path.curRow == this.path.maxRow)
				this.path.end = true;

			return this.get();
		}

		GridObject.prototype.isEnd = function() {
			if (!this.path.end) {
				if (this.path.curCol == this.path.maxCol && this.path.curRow == this.path.maxRow)
					this.path.end = true;
			}
			return this.path.end;
		}

		GridObject.prototype.get = function(row, col) {
			if (row > 0 && col > 0) {
				return {
					value: this.grid[row][col],
					row: row,
					col: col
				};
			} else {
				return {
					value: this.grid[this.path.curRow][this.path.curCol],
					row: this.path.curRow,
					col: this.path.curCol
				};
			}
		}

    GridObject.prototype.getNumRows = function () {
      return this.grid.length;
    }

    // TODO getNumCols? Maximum?

		GridObject.prototype.getRowNum = function () {
			return this.path.curRow;
		}

		GridObject.prototype.getColNum = function () {
			return this.path.curCol;
		}

		GridObject.prototype.next = function(moveFlag, skipVisited, secretVisit) {
			var
				gridend = false,
				foundnext = false,
				next,
				col = this.path.curCol,
				row = this.path.curRow
			;

			do {
				if (this.path.direction == "right") {
					if (col < this.grid[row].length - 1 && col < this.path.maxCol) {
						col++;

					} else if (row < this.grid.length - 1 && row < this.path.maxRow) {
						row++;
						col = this.path.minCol;

					} else {
						gridend = true;
					}

				} else if (this.path.direction == "down") {
					if (row < this.grid.length - 1 && row < this.path.maxRow) {
						row++;

					} else if (col < this.grid[row].length - 1 && col < this.path.maxCol) {
						col++;
						row = this.path.minRow;

					} else {
						gridend = true;
					}
				}

				next = this.grid[row][col];

				if (this.visited[row][col] != true) {
					if (!secretVisit)
						this.visited[row][col] = true;

					foundnext = true;

				} else if (skipVisited === false || !this.path.skipVisited) {
					foundnext = true;

				}

			} while (!gridend && !foundnext);

			if (foundnext && moveFlag) {
				this.path.curCol = col;
				this.path.curRow = row;
			}
			if (gridend) {
				this.path = this.path.nextPath;
			}

			return {
				value: next,
				row: row,
				col: col,
				end: gridend
			};

			/* TODO up and left */

		}

    GridObject.prototype.setVisited = function(row, col, lastRow, lastCol) {

      if (typeof row == 'undefined')
        row = this.path.curRow;
      if (typeof col == 'undefined')
        col = this.path.curCol;
      if (typeof lastRow == 'undefined')
        lastRow = this.grid.length-1;
      if (typeof lastCol == 'undefined')
        lastCol = this.grid[0].length-1;

      if (Math.min(row,col,lastRow,lastCol) < 0
        || row > lastRow
        || col > lastCol) {

        return false;
      }

      for (var i=row; i<=lastRow; i++) {
        for (var j=col; j<=lastCol; j++) {
          this.visited[i][j] = true;
        }
      }

      return true;
    }

		GridObject.prototype.prev = function(moveFlag) {
			/* TODO prev */
		}

		GridObject.prototype.getRow = function(direction, row, col, lastRow, lastCol) {
			var
				returnRow = [],
				curRow = this.path.curRow,
				curCol = this.path.curCol
			;

			if (typeof lastRow == 'undefined')
				lastRow = this.grid.length-1;
			if (typeof lastCol == 'undefined')
				lastCol = this.grid[0].length-1;
			if (typeof row != 'undefined' && row < lastRow && row >= 0)
				curRow = row;
			if (typeof col != 'undefined' && col < lastCol && col >= 0)
				curCol = col;
			if (typeof direction == 'undefined')
				direction = this.path.direction;

			if (direction == "right") {
				for (var i=curCol; i<this.grid[curRow].length; i++) {
					returnRow.push(this.grid[curRow][i]);
				}
			} else if (direction == "down") {
				for (var i=curRow; i<=lastRow; i++) {
					returnRow.push(this.grid[i][curCol]);
				}
			}

			return returnRow;
		}

		return GridObject;
	});
