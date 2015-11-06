module.exports = function(app, passport) {

	app.get("/login", function(req, res)
	{
		res.render("login", { message : req.flash("loginMessage") });
	});

	app.post("/login", passport.authenticate("local-login", {
		successRedirect : "/",
		failureRedirect : "/login",
		failureFlash : true
	}));

	app.get("/forgotten", function(req, res)
	{
		res.render("forgotten", { message : req.flash("forgotMessage") });
	});

	app.post("/forgotten", function(req, res) 
	{
		User.findOne( { email: req.body.email} ).exec(function(err, user)
		{
			if(!user) {
				res.render("forgotten", { message : "Email address is not regsitered." });
			} else if (user) {
				var newpw = Math.random().toString(36).slice(-8);
				user.password = user.generateHash(newpw);
				user.save(function(err)
				{
					var o = {};
					o.to = user.email;
					o.subject = "Busily password reset";
					o.password = newpw;
					console.log(o);
					app.mailer.send('pwmail', o, function(err)
					{
						if(err){
							console.log(err);return
						}
						res.render("unforgotten", { message : "A new password has been emailed to you." });
					});
				});
			}
		});
	});

	app.get("/signup", function(req, res)
	{
		res.render("signup", { message : req.flash("signupMessage") });
	});

	app.post("/signup", passport.authenticate("local-signup", {
		successRedirect : "/",
		failureRedirect : "/signup",
		failureFlash : true
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/");
}
