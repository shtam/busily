module.exports = function(app, passport) {
	app.post("/saverota", function(req, res)
	{
		console.log(req.user);
		if (req.user) {
			o = req.body.o;
			console.log(o);
			o.ownerid = req.user._id;
			var newrota = new Rota(o);
			console.log(newrota);
			//newrota.save();
			newrota.save(function (err) {
				  if (err) console.log(err);
				  console.log("WEFQWEFQWFWEQWEFWEF");
			});
		}
	});
}
