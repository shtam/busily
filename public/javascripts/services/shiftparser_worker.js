/**
 * Created by Andy on 22/06/2014.
 */

self.addEventListener('message', function(e) {

	var lines = e.data[0].split(/\R/);
	var grid = [];
	for (var i=0; i<lines.length; i++) {
		grid[i] = lines[i].split(/\t/);
	}

	var counts = {};
	var dates = [];
	var names = [];

	grid.forEach(function(row) {
		row.forEach(function(cell) {
			counts[cell] = (counts[cell] || 0) + 1;

			if (cell.match("Black")) {
				names.push(cell);
			}
			if (cell.match(/\d{2}-\D{3}/)) {
				dates.push(cell);
			}
		});
	});

	self.postMessage({counts:counts, dates:dates, names:names});
}, false);