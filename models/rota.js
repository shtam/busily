var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sShifts = new mongoose.Schema ({
	name: String,
	startTime: [Number],
	endTime: [Number],
	colour: String,
	description: String,
	nonResident: Boolean,
	holiday: Boolean
});

var sPatterns = new mongoose.Schema ({
	v: [Number]
});

var rotaSchema = new mongoose.Schema ({
	ownerid: String,
	userID: Number,
	//location: {
	//	display-name: String
	//},
	startDate: { type: Date },
	endDate: { type: Date },
	//repeat-pattern: { type: Boolean, default: false },
	shifts: [sShifts],
	people: [
		{
			id: Number,
			name: String
		}
	],
	pattern: [sPatterns]
});

Rota = mongoose.model('Rota', rotaSchema);
