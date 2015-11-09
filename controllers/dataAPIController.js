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
	app.get("/api/rota/:rotaid", function(req, res) {
		if (req.user) {
			Rota.findById( req.params.rotaid,  function(err, docs) {
					if (err) res.json(null);
					if (docs.ownerid != req.user._id) res.json(null);
					res.json(docs);
			});
		} else {
			res.json(null);
		}
	});
	app.put("/api/rota/:rotaid", function(req, res)
	{
		if (req.user) {
			o = req.body.o;
			Rota.update( { _id: req.params.rotaid, ownerid: req.user._id }, o, function (err) {
				if (err) res.status(500).end();
				res.status(201).end();
			});
		} else {
			res.status(401).end();
		}
	});
	app.post("/api/rota/", function(req, res)
	{
		if (req.user) {
			o = req.body.o;
			o.ownerid = req.user._id;
			var newrota = new Rota(o);
			newrota.save(function (err) {
				if (err) res.status(500).end();
				res.status(201).end();
			});
		} else {
			res.status(401).end();
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
