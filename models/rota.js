var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rotaSchema = new Schema ({
	location: {
		display-name: String
	},
	start-date: { type: Date },
	end-date: { type: Date },
	repeat-pattern: { type: Boolean, default: false },
	shifts: [
		{
			name: String
			start-time: [Number],
			end-time: [Number],
			colour: String,
			Description: String
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
