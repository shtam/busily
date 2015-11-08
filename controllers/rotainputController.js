module.exports = function(app, passport) {
	app.get("/", function(req, res) {
		if (req.user) {
			Rota.find({ ownerid: req.user._id }).exec(function(err, docs)
			{
				res.render("index", { title : "Hello world", user: req.user, rota: docs });
			});

		}
		res.render("index", { title : "Hello world", user: req.user });
	});
}
