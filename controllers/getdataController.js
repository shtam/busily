module.exports = function(app) {
	app.post("/saverota", function(req, res)
	{
		o = JSON.parse(req.body.o);
		var newrota = new Rota(o);
		newrota.save(function (err)
		{
			res.redirect("/");
		});
	});
}
