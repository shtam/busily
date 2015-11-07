module.exports = function(app, passport) {
	app.get("/", function(req, res) {
		if (req.user) {
			console.log(req.user._id)
			Rota.find({ "people.id": req.user._id }).exec(function(err, docs)
			{
				res.render("index", { title : "Hello world", user: req.user, rota: docs });
			});

		}
		res.render("index", { title : "Hello world", user: req.user });
	});
}
