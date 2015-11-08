module.exports = function(app, passport) {
	app.get("/getrota", function(req, res) {
		if (req.user) {
			Rota.find({ ownerid: req.user._id }).exec(function(err, docs)
					if (err) return false;
					return docs;
			});
		} else {
			return: false;
		}
	});
	app.get("/getuserrota/:userid", function(req, res) {
		if (req.params.userid) {
			Rota.find({ ownerid: req.params.userid }).exec(function(err, docs)
					if (err) return false;
					return docs;
			});
		} else {
			return: false;
		}
	});
	app.get("/getuser", function(req, res) {
		if (req.user) {
			return req.user;
		} else {
			return: false;
		}
	});
}
