var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer')
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
//var mailer = require('express-mailer');

//var routes = require('./routes/index');
//var users = require('./routes/users');

var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;
app.use(session({ secret: 'triggerf00l' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//app.use('/', routes);
//app.use('/users', users);

// passport config
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use('local-signup', new LocalStrategy({
	usernameField : 'email',
	passwordField : 'password',
	passReqToCallback : true
},
function(req, email, password, done) {
	process.nextTick(function() {
	User.findOne({ 'email' :  email }, function(err, user) {
		if (err)
			return done(err);
		if (user) {
			return done(null, false, req.flash('signupMessage', 'That email is already registered.'));
		} else {
			var newUser            = new User();
			newUser.email    = email;
			newUser.password = newUser.generateHash(password);
			newUser.save(function(err) {
				if (err)
					throw err;
				return done(null, newUser);
			});
		}

	});    

	});

}));
passport.use('local-login', new LocalStrategy({
	usernameField : 'email',
	passwordField : 'password',
	passReqToCallback : true
},
function(req, email, password, done) {
	User.findOne({ 'email' :  email }, function(err, user) {
		if (err)
			return done(err);
		if (!user)
			return done(null, false, req.flash('loginMessage', 'User doesn\'t exist. Please try again.'));
		if (!user.validPassword(password))
			return done(null, false, req.flash('loginMessage', 'Password Incorrect, please try again.'));
		return done(null, user);
	});

}));

mongoose.connect('mongodb://localhost/busily');

require('./models/user');
require('./controllers/rotainputController')(app, passport);
require('./controllers/userController')(app, passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
