module.exports = function(app, passport) {
	app.get("/api/rota", function(req, res) {
		Rota.find({ ownerid: req.user._id }).exec(function(err, docs) {
				if (err) res.json(null);
				res.json(docs);
		});
	});
	/*app.get("/api/rota/:rotaid", function(req, res) {
		Rota.findById( req.params.rotaid,  function(err, docs) {
				if (err) res.json(null);
				res.json(docs);
		});
	});*/
	app.put("/api/rota/:rotaid", function(req, res)
	{
		o = req.body.o;
		Rota.update( { _id: req.params.rotaid }, o, function (err) {
			if (err) res.status(500).end();
			res.status(201).end();
		});
	});
	app.post("/api/rota/delete/:rotaid", function(req, res)
	{
		Rota.remove( { _id: req.params.rotaid }, function (err) {
			if (err) res.status(500).end();
			res.status(201).end();
		});
	});
	app.post("/api/rota/", function(req, res)
	{
		o = req.body.o;
		var newrota = new Rota(o);
		newrota.save(function (err, doc) {
			if (err) res.status(500).end();
			//res.status(201).end();
			// return id
			res.json({"rotaid": doc._id});
		});
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
