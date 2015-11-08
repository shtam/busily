var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rotaSchema = new mongoose.Schema ({
	ownerid: String,
	//location: {
	//	display-name: String
	//},
	startDate: { type: Date },
	//end-date: { type: Date },
	//repeat-pattern: { type: Boolean, default: false },
	shifts: [
		{
			name: String,
			startTime: [Number],
			endTime: [Number],
			colour: String,
			description: String
		}
	],
	people: [
		{
			id: Number,
			name: String
		}
	],
	pattern: [
		[Number]
	]
});

Rota = mongoose.model('Rota', rotaSchema);
