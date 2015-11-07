/**
 * Created by Andy on 23/09/2014.
 */

'use strict';

angular.module("busilyApp")
	.service("datefinder", function () {

		// TODO localisation / languages of date stuff

    var rxDays = /\b(M|Mo|Mon|T|Tu|Tue|Tues|W|We|Wed|Wednes|Th|Thu|Thur|Thurs|F|Fr|Fri|S|Sa|Sat|Satur|Su|Sun)(day)?\b/i;

    var rxTime = /\b(\d|[01]\d|2[0-4])(:?([0-6]\d)){1,2}\b/;

    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var monthsAll = monthsShort.concat(months);

    var rxMonths = new RegExp('([^A-z]|^)('+monthsAll.join("|")+')([^A-z]|$)','i');

    var currentYear = new Date().getFullYear();
    var year = [];
    for (var i=currentYear-2; i<=currentYear+2; i++) {
      year.push(i);
    }
    var rxYearStr = year.join("|");
    var rxYear = new RegExp("(\D|^)("+rxYearStr+")(\D|$)");

    // TODO in 2060, change 2-digit numbers to [0123456]... and in 2200 change the 4-digit numbers ;-)
    var rxDateNum = /(\D|^)((\d|[0123]\d)|(199\d|20\d{2}))(\D|$)/;
    if (currentYear >= 2040) {
      rxDateNum = /(\D|^)((\d|[0123456]\d)|(20\d{2}|21\d{2}))(\D|$)/;
    }

		var rxDate = /\b((\d{1,2}|\d{4})([-\\\/\. ](\d{1,2}|\d{4})){1,2})\b/;

    var dateFinder = function(cell, strongFlag) {

      var returnMatch = false;

      if (cell.match(rxDate)) {
        returnMatch = true;

      } else if (cell.match(rxMonths)) {
        returnMatch = true;

      } else if (cell.match(rxDays)) {
        returnMatch = true;

      } else if (cell.match(rxYear)) {
        returnMatch = true;

      } else if (cell.match(rxDateNum) && !strongFlag) {
        returnMatch = true;

      }

      return returnMatch;
    }

    return dateFinder;
	}
);
