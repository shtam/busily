var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rotaSchema = new mongoose.Schema ({
	piss: String,
	//location: {
	//	display-name: String
	//},
	startdate: { type: Date },
	//end-date: { type: Date },
	//repeat-pattern: { type: Boolean, default: false },
	shifts: [
		{
			name: String,
			starttime: [Number],
			endtime: [Number],
			colour: String,
			Description: String
		}
	],
	people: [
		{
			id: String,
			name: String
		}
	],
	pattern: [
		[Number]
	]
});

Rota = mongoose.model('Rota', rotaSchema);
