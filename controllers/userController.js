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
				var newhash = new Passhash();
				newhash.token = Math.random().toString(36).slice(-8);
				newhash.userid = user._id;
				newhash.save(function(err)
				{
					var o = {};
					o.to = user.email;
					o.subject = "Busily password reset";
					o.token = newhash.token;
					app.mailer.send('pwmail', o, function(err)
					{
						if(err){
							console.log(err);return
						}
						res.render("unforgotten", { message : "Instructions for resetting your password have been emailed to you." });
					});
				});
			}
		});
	});

	app.get("/newpass/:token", function(req, res)
	{
		res.render("newpass", { token: req.params.token });	
	});
	app.post("/newpass", function(req, res)
	{
		Passhash.findOne( { token: req.body.token } ).exec(function(err, passhash)
		{
			User.findOne( { _id: passhash.userid } ).exec(function(err, user)
			{
				if (err) res.redirect("/");
				user.password = user.generateHash(req.body.password);
				user.save(function(err)
				{
					Passhash.remove( { userid: passhash.userid } );
					res.redirect("/login");
				});
			});
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
