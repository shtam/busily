module.exports = function(app, passport) {
	app.get("/", function(req, res) {
		res.render("index", { title : "Hello world", user: req.user });
	});
}
