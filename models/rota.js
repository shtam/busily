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

var sCalculated = new mongoose.Schema ({
	grade: Number,
	Pay: String,
	PayValue: Number,
	PayAsGrade: Number,
	Band: String,
	BandPercent: Number,
	BandValue: Number,
	Fulltime: Number,
	Deanery: Number,
	OnCallAllowance: Number,
	OnCallAllowanceText: String,
	OnCallAllowanceValue: Number,
	Specialty: String,
	SubSpecialty: String,
	Premia: Number,
	Node: String,
	NodePay: Number,
	LondonValue: Number,
	ExtraHoursValue: {
		additionalBasicHours: Number,
		nightHours: Number,
		satHours: Number,
		sunHours: Number,
	}
});

var sPatterns = new mongoose.Schema ({
	v: [Number]
});

var rotaSchema = new mongoose.Schema ({
	ownerid: String,
	userID: Number,
	email: String,
	canUseData: { type: Boolean, default: false },
	canContact: { type: Boolean, default: false },
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
	pattern: [sPatterns],
	calculated: sCalculated
});

Rota = mongoose.model('Rota', rotaSchema);
