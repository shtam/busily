/**
 * Created by Andy on 31/01/2015.
 */

angular.module("busilyApp")
  .factory("RosterObject", function () {
    function RosterObject() {
      this.dates = [];
      this.datesSortedByLength = [];
      this.key = [];

      this.possibles = {
        right:[],
        down:[]
      };
      this.winners = [];
    }

    RosterObject.prototype.add = function (values, row, col, endRow, endCol, type) {

      var direction = "right";
      var length = endCol - col + 1;
      if (col == endCol) {
        direction = "down";
        length = endRow - row + 1;
      }

      var tmpObj = {
        values:values,
        startRow:row,
        startCol:col,
        endRow:endRow,
        endCol:endCol,
        direction:direction,
        length:length,
        type:type
      };

      this.dates.push(tmpObj);

      for (var i=row; i<=endRow; i++) {
        for (var j=col; j<=endCol; j++) {
          if (typeof this.key[i] == 'undefined')
            this.key[i] = [];

          this.key[i][j] = this.dates.length-1;
        }
      }

      return true;
    };

    function sortByLength(a,b) {
      if (a.length > b.length) {
        return 1;
      } else if (a.length < b.length) {
        return -1;
      } else {
        return 0;
      }
    }

    RosterObject.prototype.consolidate = function(gridObject) {
      var dateObj = {};
      var nextCol = 0;
      var nextRow = 0;

      var done = [];

      for (var i = 0; i < this.dates.length; i++) {

        if (!done[i]) {

          done[i] = true;

          // LET'S LOOK RIGHT
          if (this.dates[i].direction == "right" || this.dates[i].length == 1) {
            nextRow = this.dates[i].endRow + 1;
            nextCol = this.dates[i].endCol + 1;

            if (typeof this.key[nextRow] != 'undefined' && typeof this.key[nextRow][this.dates[i].startCol] != 'undefined') {
              dateObj = this.dates[this.key[nextRow][this.dates[i].startCol]];

              if (dateObj.direction == "right" && this.dates[i].type != dateObj.type) {
                this.combine(dateObj.type == "dates" ? this.key[nextRow][this.dates[i].startCol] : i, dateObj.type == "weekdays" ? this.key[nextRow][this.dates[i].startCol] : i);
                done[this.key[nextRow][this.dates[i].startCol]] = true;
              }
            }

            var edgeEnd = this.dates[i].startCol - 1;
            var edgeStart = edgeEnd;
            var edge = {values:[]};
            var body = {values:[]};

            var startRow = this.dates[i].linked ? this.dates[i].startRow + 2 : this.dates[i].startRow + 1;

            if (typeof gridObject.grid[startRow][edgeEnd] != 'undefined' && gridObject.grid[startRow][edgeEnd] != "") {
              for (var j = edgeEnd; j >= 0; j--) {
                if ((typeof gridObject.grid[startRow][j] != 'undefined' && gridObject.grid[startRow][j] != "") &&
                  (typeof this.key[startRow-1] == 'undefined' || typeof this.key[startRow-1][j] == 'undefined' || this.dates[this.key[startRow-1][j]].direction != this.dates[i].direction)) {
                  edgeStart = j;
                } else {
                  break;
                }
              }
            } else {
              edgeEnd = -1;
            }

            if (edgeStart > -1) {
              startCol = edgeStart;
            } else {
              startCol = this.dates[i].startCol;
            }

            edge.startRow = startRow;
            edge.startCol = edgeStart;
            edge.endCol = edgeEnd;

            body.startRow = startRow;
            body.startCol = this.dates[i].startCol;

            for (j = startRow; j < gridObject.grid.length; j++) {

              if (gridObject.grid[j].length >= this.dates[i].endCol + 1) {

                edge.values.push([]);
                body.values.push([]);

                for (var k = startCol; k <= this.dates[i].endCol; k++) {
                  if (k <= edgeEnd) {
                    edge.values[edge.values.length - 1].push(gridObject.grid[j][k]);
                  } else {
                    body.values[body.values.length - 1].push(gridObject.grid[j][k]);
                  }
                }

                if (edgeStart > -1) {
                  if (edge.values[edge.values.length - 1].join('').trim() == '') {
                    edge.values.pop();
                    body.values.pop();
                    break;
                  }
                } else if (body.values[body.values.length - 1].join('').trim() == '') {
                  body.values.pop();
                  break;
                }

              } else {
                break;
              }
            }

            edge.endRow = edge.startRow+edge.values.length-1;
            body.endRow = body.startRow+body.values.length-1;
            if (body.values.length > 0) {
              body.endCol = body.startCol + body.values[0].length - 1;
            } else {
              body.endCol = body.startCol;
            }

            var tmpRetObj = {};

            if (this.dates[i].linked) {
              tmpRetObj.dates = [this.dates[i], this.dates[i + 1]];
            } else {
              tmpRetObj.dates = [this.dates[i]];
            }
            tmpRetObj.edge = edge;
            tmpRetObj.body = body;

            tmpRetObj.stats = calculateDateObjectStats((this.dates[i].linked ? this.dates[i+1] : this.dates[i]), edge, body, (this.dates[i].linked ? this.dates[i] : undefined));

            this.possibles.right.push(tmpRetObj);


            // LET'S LOOK DOWN
          } else {
            nextRow = this.dates[i].endRow + 1;
            nextCol = this.dates[i].endCol + 1;

            if (typeof this.key[this.dates[i].startRow][nextCol] != 'undefined') {
              dateObj = this.dates[this.key[this.dates[i].startRow][nextCol]];

              if (dateObj.direction == "down" && this.dates[i].type != dateObj.type) {
                this.combine(dateObj.type == "dates" ? this.key[this.dates[i].startRow][nextCol] : i, dateObj.type == "weekdays" ? this.key[this.dates[i].startRow][nextCol] : i);
                done[this.key[this.dates[i].startRow][nextCol]] = true;
              }
            }

            edgeEnd = this.dates[i].startRow - 1;
            edgeStart = -1;
            edge = {values:[]};
            body = {values:[]};

            var startCol = this.dates[i].linked ? this.dates[i].startCol + 2 : this.dates[i].startCol + 1;

            if (typeof gridObject.grid[edgeEnd] != 'undefined' && gridObject.grid[edgeEnd][startCol] != "") {
              for (j = edgeEnd; j >= 0; j--) {
                if ((typeof gridObject.grid[j][startCol] != 'undefined' && gridObject.grid[j][startCol] != "") &&
                  (typeof this.key[j] == 'undefined' || typeof this.key[j][startCol-1] == 'undefined' || this.dates[this.key[j][startCol-1]].direction != this.dates[i].direction)) {
                  edgeStart = j;
                } else {
                  break;
                }
              }
            } else {
              edgeEnd = -1;
            }

            if (edgeStart > -1) {
              startRow = edgeStart;
            } else {
              startRow = this.dates[i].startRow;
            }

            edge.startRow = edgeStart;
            edge.endRow = edgeEnd;
            edge.startCol = startCol;

            body.startRow = this.dates[i].startRow;
            body.startCol = startCol;

            for (j = startCol; j < gridObject.grid[this.dates[i].startRow].length; j++) {

              edge.values.push([]);
              body.values.push([]);

              for (k = startRow; k <= this.dates[i].endRow; k++) {
                if (k <= edgeEnd) {
                  edge.values[edge.values.length - 1].push(gridObject.grid[k][j]);
                } else {
                  body.values[body.values.length - 1].push(gridObject.grid[k][j]);
                }
              }

              if (edgeStart > -1) {
                if (edge.values[edge.values.length - 1].join('').trim() == '') {
                  edge.values.pop();
                  body.values.pop();
                  break;
                }
              } else if (body.values[body.values.length - 1].join('').trim() == '') {
                body.values.pop();
                break;
              }
            }

            edge.endCol = edge.startCol+edge.values.length-1;
            body.endCol = body.startCol+body.values.length-1;
            if (body.values.length > 0) {
              body.endRow = body.startRow + body.values[0].length - 1;
            } else {
              body.endRow = body.startRow;
            }

            tmpRetObj = {};

            if (this.dates[i].linked) {
              tmpRetObj.dates = [this.dates[i], this.dates[i + 1]];
            } else {
              tmpRetObj.dates = [this.dates[i]];
            }
            tmpRetObj.edge = edge;
            tmpRetObj.body = body;

            tmpRetObj.stats = calculateDateObjectStats((this.dates[i].linked ? this.dates[i+1] : this.dates[i]), edge, body, (this.dates[i].linked ? this.dates[i] : undefined));

            this.possibles.down.push(tmpRetObj);

          }
        }

      //  this.datesSortedByLength = this.dates.sort(sortByLength);

      }

      // Found the possibles; now let's find the probables

      var dateFmtCount = {};
      var tmpFmt = "";

      if (this.possibles.right.length > 0) {

        for (i = 0; i < this.possibles.right.length; i++) {
          // days+weekdays most likely
          // find periods finishing 28,29,30,31
          // find month names
          // find dd/dd formats
          // high counts?

          if (this.possibles.right[i].stats.date.type == 'weekdays') {
            tmpFmt = 'weekdays';
          } else {
            tmpFmt = this.possibles.right[i].stats.date.matchFormat;
            if (this.possibles.right[i].stats.date.linked.linked)
              tmpFmt = tmpFmt + "|linked";
          }

          tmpFmt = "right|" + tmpFmt;

          if (typeof dateFmtCount[tmpFmt] == 'undefined')
            dateFmtCount[tmpFmt] = {
              max:0,
              min:999999999,
              count:0,
              rows:[],
              rowCount:0,
              matchingBlocks:0,
              consecutive:0,
              lastDay:-1
            };

          dateFmtCount[tmpFmt].matchingBlocks++;

          dateFmtCount[tmpFmt].max = Math.max(dateFmtCount[tmpFmt].max, this.possibles.right[i].stats.date.max);
          dateFmtCount[tmpFmt].min = Math.min(dateFmtCount[tmpFmt].min, this.possibles.right[i].stats.date.min);
          dateFmtCount[tmpFmt].count += this.possibles.right[i].stats.date.count;

          if (dateFmtCount[tmpFmt].rows[this.possibles.right[i].stats.date.startRow] > 0) {
            dateFmtCount[tmpFmt].rows[this.possibles.right[i].stats.date.startRow]++;
          } else {
            dateFmtCount[tmpFmt].rowCount++;
            dateFmtCount[tmpFmt].rows[this.possibles.right[i].stats.date.startRow] = 1;
          }

          if (this.possibles.right[i].stats.date.type == 'weekdays') {
            dateFmtCount[tmpFmt].consecutive++;

          } else if (dateFmtCount[tmpFmt].lastDay > -1) {
            if (isMonthDay(dateFmtCount[tmpFmt].lastDay, this.possibles.right[i].stats.date.min) > -1) {
              dateFmtCount[tmpFmt].consecutive++;
            }
          }
          dateFmtCount[tmpFmt].lastDay = this.possibles.right[i].stats.date.max;
        }
      }

      if (this.possibles.down.length > 0) {

        for (i = 0; i < this.possibles.down.length; i++) {

          if (this.possibles.down[i].stats.date.type == 'weekdays') {
            tmpFmt = 'weekdays';
          } else {
            tmpFmt = this.possibles.down[i].stats.date.matchFormat;
            if (this.possibles.down[i].stats.date.linked.linked)
              tmpFmt = tmpFmt + "|linked";
          }

          tmpFmt = "down|" + tmpFmt;

          if (typeof dateFmtCount[tmpFmt] == 'undefined')
            dateFmtCount[tmpFmt] = {
              max:0,
              min:999999999,
              count:0,
              cols:[],
              colCount:0,
              matchingBlocks:0,
              consecutive:0,
              lastDay:-1
            };

          dateFmtCount[tmpFmt].matchingBlocks++;

          dateFmtCount[tmpFmt].max = Math.max(dateFmtCount[tmpFmt].max, this.possibles.down[i].stats.date.max);
          dateFmtCount[tmpFmt].min = Math.min(dateFmtCount[tmpFmt].min, this.possibles.down[i].stats.date.min);
          dateFmtCount[tmpFmt].count += this.possibles.down[i].stats.date.count;

          if (dateFmtCount[tmpFmt].cols[this.possibles.down[i].stats.date.startCol] > 0) {
            dateFmtCount[tmpFmt].cols[this.possibles.down[i].stats.date.startCol]++;
          } else {
            dateFmtCount[tmpFmt].colCount++;
            dateFmtCount[tmpFmt].cols[this.possibles.down[i].stats.date.startCol] = 1;
          }

          if (this.possibles.down[i].stats.date.type == 'weekdays') {
            dateFmtCount[tmpFmt].consecutive++;

          } else if (dateFmtCount[tmpFmt].lastDay > -1) {
            if (isMonthDay(dateFmtCount[tmpFmt].lastDay, this.possibles.down[i].stats.date.min) > -1) {
              dateFmtCount[tmpFmt].consecutive++;
            }
          }
          dateFmtCount[tmpFmt].lastDay = this.possibles.down[i].stats.date.max;
        }
      }

      var scores = {};
      var scoreMax = {
        score:-1000,
        index:"",
        count:0
      };

      for(var index in dateFmtCount) {
        if (dateFmtCount.hasOwnProperty(index)) {
          var attr = dateFmtCount[index];

          var indexSplit = index.split('|');

          scores[index] = 0;

          if (attr.max >= 28 && attr.max <= 31) {
            scores[index] += 50;
          } else if (indexSplit[1] != 'weekdays' && (attr.count > attr.max || attr.count < attr.min)) {
            scores[index] -= 25;
          }
          if (indexSplit[indexSplit.length-1] == 'linked') {
            scores[index] += 50;
          }
          if (indexSplit[1] == 'weekdays') {
            scores[index] += 25;
          }
          if (attr.colCount > attr.matchingBlocks) {
            scores[index] -= 15;
          }
          if (indexSplit[1] != 'd') { // more interesting if not just an integer?
            scores[index] += 10;
          }
          scores[index] += 10 * attr.consecutive;

          if (scores[index] > scoreMax.score) {
            scoreMax.score = scores[index];
            scoreMax.index = indexSplit;
            scoreMax.count = attr.count;

          } else if (scores[index] == scoreMax.score) {
            if (attr.count > scoreMax.count) {
              scoreMax.score = scores[index];
              scoreMax.index = indexSplit;
              scoreMax.count = attr.count;

            } else {
              // TODO: jesus
            }
          }
        }
      }

      if (scoreMax.score > 0) {
        var linkRequired = false;
        if (scoreMax.index[scoreMax.index.length - 1] == 'linked') {
          linkRequired = true;
          tmpFmt = scoreMax.index.slice(1, -1).join('|');
        } else {
          tmpFmt = scoreMax.index.slice(1).join('|');
        }

        for (i = 0; i < this.possibles[scoreMax.index[0]].length; i++) {
          if (this.possibles[scoreMax.index[0]][i].stats.date.matchFormat == tmpFmt) {
            if (!linkRequired || this.possibles[scoreMax.index[0]][i].stats.date.linked.linked) {
              this.winners.push(this.possibles[scoreMax.index[0]][i]);
            }

          } else if (this.possibles[scoreMax.index[0]][i].stats.date.type == tmpFmt) {
            this.winners.push(this.possibles[scoreMax.index[0]][i]);
          }
        }
      }
    };

    function isMonthDay(num1, num2) {

      var isMonthDay = -1;
      if (num2 == num1 + 1) {
        isMonthDay = 1;
      } else if (num2 == num1 + 7) {
        isMonthDay = 7;
      } else if ((num1 == 30 || num1 == 31 || num1 == 28 || num1 == 29) && num2 == 1) {
        isMonthDay = 1;
      } else if (30 - num1 + num2 == 7) {
        isMonthDay = 7;
      } else if (31 - num1 + num2 == 7) {
        isMonthDay = 7;
      } else if (28 - num1 + num2 == 7) {
        isMonthDay = 7;
      } else if (29 - num1 + num2 == 7) {
        isMonthDay = 7;
      }

      return isMonthDay;
    }

    function calculateDateObjectStats(date, edge, body, dateLinked) {
      var stats = {};

      stats.date = {};
      stats.date.type = date.type;
      stats.date.min = 9999999999;
      stats.date.max = -1;
      if (date.type != "weekdays") {
        stats.date.increment = date.values[0].matchType;
        stats.date.matchFormat = date.values[0].matchFormat;
        for (var i=0;i<date.values.length;i++) {
          stats.date.min = Math.min(stats.date.min, date.values[i].parsed);
          stats.date.max = Math.max(stats.date.max, date.values[i].parsed);
        }
      } else {
        for (i=0;i<date.values.length;i++) {
          stats.date.min = Math.min(stats.date.min, date.values[i][3]);
          stats.date.max = Math.max(stats.date.max, date.values[i][3]);
        }
      }
      stats.date.count = date.values.length;
      stats.date.startRow = date.startRow;
      stats.date.startCol = date.startCol;
      stats.date.endRow = date.endRow;
      stats.date.endCol = date.endCol;
      stats.date.linked = {};
      if (typeof dateLinked != 'undefined') {
        stats.date.linked.linked = true;
        stats.date.linked.startRow = dateLinked.startRow;
        stats.date.linked.startCol = dateLinked.startCol;
        stats.date.linked.endRow = dateLinked.endRow;
        stats.date.linked.endCol = dateLinked.endCol;
      } else {
        stats.date.linked.linked = false;
      }

      stats.edge = {};
      if (edge.values.length > 0 && edge.values[0].length > 0) {
        stats.edge.edge = true;
        stats.edge.startRow = edge.startRow;
        stats.edge.startCol = edge.startCol;
        stats.edge.endRow = edge.endRow;
        stats.edge.endCol = edge.endCol;
      } else {
        stats.edge.edge = false;
      }

      stats.body = {};
      stats.body.startRow = body.startRow;
      stats.body.startCol = body.startCol;
      stats.body.endRow = body.endRow;
      stats.body.endCol = body.endCol;

      stats.body.values = {};
      for (var j=0; j<body.values.length; j++) {
        for (var k=0; k<body.values[j].length; k++) {
          if (stats.body.values[body.values[j][k]] > 0) {
            stats.body.values[body.values[j][k]]++;
          } else {
            stats.body.values[body.values[j][k]] = 1;
          }
        }
      }

      return stats;
    }

    RosterObject.prototype.split = function (a, pos) {
      var obj1 = this.dates[a];
      var obj2 = {};

      if (pos > 0 && pos < obj1.length) {

        if (obj1.direction == "right") {
          obj2 = {
            values: obj1.values.slice(pos),
            startRow: obj1.startRow,
            startCol: obj1.startCol + pos,
            endRow: obj1.endRow,
            endCol: obj1.endCol,
            direction: "right",
            length: obj1.length - pos,
            type: obj1.type
          }
          obj1.endCol -= pos;
          obj1.values = obj1.values.slice(0, pos)
        } else {
          obj2 = {
            values: obj1.values.slice(pos),
            startRow: obj1.startRow + pos,
            startCol: obj1.startCol,
            endRow: obj1.endRow,
            endCol: obj1.endCol,
            direction: "right",
            length: obj1.length - pos,
            type: obj1.type
          }
          obj1.endRow -= pos;
          obj1.values = obj1.values.slice(0, pos)
        }

        this.dates.push(obj2);

        for (var i = obj2.startRow; i <= obj2.endRow; i++) {
          for (var j = obj2.startCol; j <= obj2.endCol; j++) {
            this.key[i][j] = this.dates.length - 1;
          }
        }

        return true;

      } else {
        return false;

      }
    };

    RosterObject.prototype.join = function(a,b) {
      var obj1 = this.dates[a];
      var obj2 = this.dates[b];

      var newObj = {
        values:obj1.values.concat(obj2.values),
        startRow:obj1.startRow,
        startCol:obj1.startCol,
        endRow:obj2.endRow,
        endCol:obj2.endCol,
        direction:(obj1.direction == "right" || obj1.length == 1) ? "right" : "down",
        length:obj1.length+obj2.length,
        type:obj1.type
      };

      for (var i=obj2.startRow; i<=obj2.endRow; i++) {
        for (var j=obj2.startCol; j<=obj2.endCol; j++) {
          this.key[i][j] = a;
        }
      }

      this.dates[a] = newObj;
      this.dates[b] = {
        values:[],
        startRow:-1,
        startCol:-1,
        endRow:-1,
        endCol:-1,
        direction:"",
        length:0,
        type:"",
        deleted:true
      };

      //while (typeof this.key[this.dates[i].startRow][nextCol] != 'undefined') {
      //  dateObj = this.dates[this.key[this.dates[i].startRow][nextCol]];
      //
      //  if (dateObj.direction == "right") {
      //    this.join(i, this.key[this.dates[i].startRow][nextCol]);
      //    nextCol = dateObj.endCol+1;
      //
      //  } else {
      //    break;
      //  }
      //}
    };

    RosterObject.prototype.combine = function(dates,weekdays) {

      if (this.dates[weekdays].length > this.dates[dates].length) {
        this.split(weekdays, this.dates[dates].length);
      }

      var datesArr = JSON.parse(JSON.stringify(this.dates[dates]));
      var weekdaysArr = JSON.parse(JSON.stringify(this.dates[weekdays]));

      if (weekdaysArr.length < datesArr.length) {
        return false;
      }

      for (var i=0; i<datesArr.values.length; i++) {
        datesArr.values[i].weekday = weekdaysArr.values[i][2]; // m,t,w,th,f,s,su
      }
      datesArr.linked = Math.min(dates,weekdays);
      datesArr.linkMaster = true;

      this.dates[Math.min(dates,weekdays)].linked = Math.max(dates,weekdays);
      this.dates[Math.min(dates,weekdays)].linkMaster = false;

      this.dates[Math.max(dates,weekdays)] = datesArr;

      return true;
    };


    return RosterObject;

  });
