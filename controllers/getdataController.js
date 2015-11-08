module.exports = function(app, passport) {
	app.post("/saverota", function(req, res)
	{
		console.log(req.user);
		if (req.user) {
			o.ownerid = req.user._id;
			var newrota = new Rota(o);
			console.log(newrota);
			newrota.save(function (err) {
				  if (err) console.log(err);
			});
		}
	});
}
