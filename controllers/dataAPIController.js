module.exports = function(app, passport) {
	app.get("/api/rota", function(req, res) {
		if (req.user) {
			Rota.find({ ownerid: req.user._id }).exec(function(err, docs) {
					if (err) res.json(null);
					res.json(docs);
			});
		} else {
			res.json(null);
		}
	});
	app.post("/api/rota", function(req, res)
	{
		if (req.user) {
			o = req.body.o;
			o.ownerid = req.user._id;
			var newrota = new Rota(o);
			newrota.save(function (err) {
				  if (err) console.log(err);
			});
		}
	});
	app.get("/api/userrota/:userid", function(req, res) {
		if (req.params.userid) {
			Rota.find({ ownerid: req.params.userid }).exec(function(err, docs) {
					if (err) res.json(null);
					res.json(docs);
			});
		} else {
			res.json(null);
		}
	});
	app.get("/api/user", function(req, res) {
		if (req.user) {
			res.json(req.user);
		} else {
			res.json(null);
		}
	});
}
