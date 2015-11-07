/**
 * Created by Andy on 27/12/2014.
 */

angular.module("busilyApp")
  .service("findincremental", function () {

    var returnObject = {};

    var rxNum = /\d+/g;
    var rxDays = /\b(M|Mo|Mon|T|Tu|Tue|Tues|W|We|Wed|Wednes|Th|Thu|Thur|Thurs|F|Fr|Fri|S|Sa|Sat|Satur|Su|Sun)(day)?\b/i;

    // searches an array for neighbouring cells with a shared format that increment by 1, e.g.
    // 01-Jan,02-Jan,03-Jan
    // 1,2,3
    // 1/1/2015, 2/1/2015, 3/1/2015
    // 01Jan15,02Jan15,03Jan15

    function getRxNumMatch(str, num) {

      // regex looking for the pattern we've found
      var rxNumMatchStr = " " + str + " ";
      // account for ordinals, e.g. Fri 1st Jan becomes Fri 1(th|st|rd|nd) Jan
      rxNumMatchStr = rxNumMatchStr.replace( /(\d)(th|st|rd|nd)\b/i, "$1(th|st|rd|nd)");
      // replace the incrementing number, e.g. Fri 1(th|st|rd|nd) Jan becomes Fri (\d+)(th|st|rd|nd) Jan
      rxNumMatchStr = rxNumMatchStr.replace(new RegExp('(\\D)' + num + '(\\D)'), '$1(\\d+)$2');
      // get rid of any weekday names, e.g. Fri (\d+)(th|st|rd|nd) Jan becomes (\d+)(th|st|rd|nd) Jan
      rxNumMatchStr = rxNumMatchStr.replace(rxDays, "");
      rxNumMatchStr = rxNumMatchStr.trim();

      var rxNumMatch = new RegExp(rxNumMatchStr, 'i');

      return rxNumMatch;
    }

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

    function findNums(str) {
      var retArr = [];
      var myArray;
      while ((myArray = rxNum.exec(str)) !== null) {
        retArr.push(
          {
            original:myArray[0],
            parsed:parseFloat(myArray[0]),
            startIndex:myArray.index,
            endIndex:myArray.index+myArray[0].length,
            length:myArray[0].length
          });
      }
      return retArr;
    }

    function strFormat(str) {
      // http://jrgraphix.net/r/Unicode/0020-007F
      // currently just extended Latin up to Cyrillic
      if (typeof str != 'string') return false;
      return str.replace(/[A-z\u00C0-\u02AF\u0370-\u04FF']+/g, "w").replace(/\d+/g, "d").trim();
    }

    function isIncremental(cell1, cell2) {

      // store all matches in an array
      var matches = [findNums(cell1), findNums(cell2)];

      var retObj = {};

      var strFmt = strFormat(cell1);

      // TODO: is this really necessary? Revisit.
      // Will need to update for Chinese, Thai etc characters
      // https://meta.wikimedia.org/wiki/Date_formats_in_various_languages
      if (strFormat(cell2) == strFmt) {

        // matches, plus same number of numbers in first two cells
        if (matches[0].length > 0 && matches[0].length == matches[1].length) {

          // record which of the numbers increment by one, seven, stay the same, or do something different
          // [x+1, x+7, x, neither, 12->1 i.e. december->january]
          var numSnap = [[], [], [], [], []];

          var parsedNumber1, parsedNumber2;
          var allNums1 = [];
          var allNums2 = [];

          for (var i = 0; i < matches[0].length; i++) {

            parsedNumber1 = matches[0][i].parsed;
            parsedNumber2 = matches[1][i].parsed;

            allNums1.push(matches[0][i].parsed);
            allNums2.push(matches[1][i].parsed);

            var monthDay = isMonthDay(parsedNumber1, parsedNumber2);

            if (monthDay == 1) {
              // x+1
              numSnap[0].push([i, matches[0][i]]);
            } else if (monthDay == 7) {
              // x+7
              numSnap[1].push([i, matches[0][i]]);
            } else if (parsedNumber1 == parsedNumber2) {
              // x
              numSnap[2].push([i, matches[0][i]]);
            } else if (parsedNumber1 == 12 && parsedNumber2 == 1) {
              // 12 -> 1, i.e. december -> january
              numSnap[4].push([i, matches[0][i]]);
            } else {
              // neither
              numSnap[3].push([i, matches[0][i]]);
            }
          }

          // don't want no randomly different numbers
          if (numSnap[3].length == 0) {

            // one incrementing (by 1) number only
            if (numSnap[0].length == 1 && numSnap[1].length == 0) {
              retObj = {
                matchType: 1,
                matchPosition: numSnap[0][0][0],
                matchFormat: strFmt,
                originals: [cell1, cell2],
                matches: [numSnap[0][0][1], matches[1][numSnap[0][0][0]]],
                allNums: [allNums1, allNums2]
              };

              return retObj;

              // one incrementing (by 7) number only
            } else if (numSnap[1].length == 1 && numSnap[0].length == 0) {
              retObj = {
                matchType: 7,
                matchPosition: numSnap[1][0][0],
                matchFormat: strFmt,
                originals: [cell1, cell2],
                matches: [numSnap[1][0][1], matches[1][numSnap[1][0][0]]],
                allNums: [allNums1, allNums2]
              };

              return retObj;

              // one incrementing by 1, one incrementing by 7 - must be the end of a month or year
            } else if (numSnap[0].length == 1 && numSnap[1].length == 1) {
              retObj = {
                matchType: 7,
                matchPosition: numSnap[1][0][0],
                matchFormat: strFmt,
                originals: [cell1, cell2],
                matches: [numSnap[1][0][1], matches[1][numSnap[1][0][0]]],
                allNums: [allNums1, allNums2]
              };

              return retObj;

              // two incrementing by 1 - must be the end of a month or year
            } else if (numSnap[0].length == 2 && numSnap[1].length == 0) {
              for (var k=0; k<numSnap[0].length; k++) {
                if (numSnap[0][k][1].parsed >= 28 && numSnap[0][k][1].parsed <= 31) {
                  retObj = {
                    matchType: 1,
                    matchPosition: numSnap[0][k][0],
                    matchFormat: strFmt,
                    originals: [cell1, cell2],
                    matches: [numSnap[0][k][1], matches[1][numSnap[0][k][0]]],
                    allNums: [allNums1, allNums2]
                  };

                  return retObj;
                }
              }
            }
            // TODO: anything I've missed? e.g. stupid formats like week 1 01/01/2015, week 1 02/01/2015 ???
          }
        }
      }

      return false;
    }

    returnObject.numbers = function (arr, pos) {

      // initialise the return array
      var ret = [-1];

      if (typeof arr[pos+1] != 'undefined') {

        // store all matches in an array
        //var matches = [arr[pos].match(rxNum), arr[pos + 1].match(rxNum)];
        var matches = isIncremental(arr[pos], arr[pos+1]);

        if (matches != false) {
          // return array
          ret = [
            {
              original: matches.originals[0],
              parsed: matches.matches[0].parsed,
              position: pos,
              matchType: matches.matchType,
              matchPosition: matches.matchPosition,
              matchFormat: matches.matchFormat,
              weekday: "",
              startIndex: matches.matches[0].startIndex,
              endIndex: matches.matches[0].endIndex,
              allNums: matches.allNums[0]
            },
            {
              original: matches.originals[1],
              parsed: matches.matches[1].parsed,
              position: pos+1,
              matchType: matches.matchType,
              matchPosition: matches.matchPosition,
              matchFormat: matches.matchFormat,
              weekday: "",
              startIndex: matches.matches[1].startIndex,
              endIndex: matches.matches[1].endIndex,
              allNums: matches.allNums[1]
            }
          ];

          // if there's any weekdays hang on to 'em
          var days = arr[pos].match(rxDays);
          if (days) ret[0].weekday = days[0];
          days = arr[pos + 1].match(rxDays);
          if (days) ret[1].weekday = days[0];

          var prevNum = matches.matches[1].parsed;

          // loop through the remaining cells looking for the pattern we've found
          for (var j = pos + 2; j < arr.length; j++) {

            if (strFormat(arr[j]) == matches.matchFormat) {
              var tmpNums = findNums(arr[j]);
              var isMthNum = isMonthDay(prevNum, tmpNums[matches.matchPosition].parsed);

              var tmpAllNums = [];
              for (var k=0; k<tmpNums.length; k++)
                tmpAllNums.push(tmpNums[k].parsed);

              if (isMthNum == matches.matchType) {
                prevNum = tmpNums[matches.matchPosition].parsed;

                var tmpRet = {
                  original: arr[j],
                  parsed: prevNum,
                  position: j,
                  matchType: matches.matchType,
                  matchPosition: matches.matchPosition,
                  matchFormat: matches.matchFormat,
                  weekday: "",
                  startIndex: tmpNums[matches.matchPosition].startIndex,
                  endIndex: tmpNums[matches.matchPosition].endIndex,
                  allNums: tmpAllNums
                }

                // if there's a weekday keep it
                days = arr[j].match(rxDays);
                if (days) tmpRet.weekday = days[0];

                ret.push(tmpRet);
              }
            } else {
              return ret;
            }
          }
        }
      }

      return ret;
    }

    // searches an array for neighbouring cells with consecutive weekdays, e.g.
    // Mon,Tue,Wed
    // Monday,Tuesday,Wednesday
    // M,T,W
    // Sun 5th,Mon 6th,Tue 7th

    returnObject.days = function (arr, pos) {

      // initialise the return array
      var ret = [-1];

      if (typeof arr[pos+1] != 'undefined') {

        var rxDays = /\b(M|Mo|Mon|T|Tu|Tue|Tues|W|We|Wed|Wednes|Th|Thu|Thur|Thurs|F|Fr|Fri|S|Sa|Sat|Satur|Su|Sun)(day)?\b/i;
        // note 't' and 's' occur twice each
        var datesMap = {
          m: 1,
          t: 2,
          w: 3,
          th: 4,
          f: 5,
          s: 6,
          su: 7
        }

        var match1 = arr[pos].match(rxDays);
        var match2 = arr[pos + 1].match(rxDays);

        // keep track of previous cell's day
        var lastday = -1;

        if (match1) {
          var letter1 = match1[1].substr(0, 1).toLowerCase();
          var letter2 = "";

          if (match2)
            letter2 = match2[1].substr(0, 1).toLowerCase();

          // account for tuesday vs thursday, saturday vs sunday by looking at next letter
          if (letter1 == 't') {
            if (letter2 == 'w') {
              // do nothing
            } else if (letter2 == 'f') {
              letter1 = 'th';
            }
          } else if (letter1 == 's') {
            if (letter2 == 's') {
              // do nothing
            } else if (letter2 == 'm') {
              letter1 = 'su';
            }
          }

          lastday = datesMap[letter1];

          // return array is [original value, matched part, first letter, numeric day, array position], e.g.
          // [Sun 1st Jan, Sun, S, 7, 0]
          ret = [
            [arr[pos],
              match1[1],
              letter1,
              lastday,
              pos
            ]
          ];

          // found one, let's find more
          for (var i = pos + 1; i < arr.length; i++) {

            if (typeof arr[i] != 'undefined') {
              match1 = arr[i].match(rxDays);

              if (match1) {
                letter1 = match1[1].substr(0, 1).toLowerCase();

                if (letter1 == 't' && lastday == 3) {
                  letter1 = 'th';
                } else if (letter1 == 's' && lastday == 6) {
                  letter1 = 'su';
                }

                // hooray, next match = previous match + 1, or back to 1 (Monday) from 7 (Sunday)
                if (lastday + 1 == datesMap[letter1] || (lastday == 7 && datesMap[letter1] == 1)) {

                  lastday = datesMap[letter1];

                  ret.push(
                    [arr[i],
                      match1[1],
                      letter1,
                      lastday,
                      i
                    ]
                  );

                } else {
                  return ret;
                }

              } else {
                return ret;
              }
            } else {
              return ret;
            }
          }
        }
      }

      return ret;
    }

    return returnObject;
  }
);
