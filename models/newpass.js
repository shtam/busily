var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passhashSchema = new mongoose.Schema ({
	userid: String,
	token: String,
});

Passhash = mongoose.model('Passhash', passhashSchema);
