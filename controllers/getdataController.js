module.exports = function(app) {
	app.post("/saverota", function(req, res)
	{
		if (req.user) {
			o = JSON.parse(req.body.o);
			o.ownerid = req.user._id;
			var newrota = new Rota(o);
			newrota.save(function (err)
			{
				res.redirect("/");
			});
		}
	});
}
