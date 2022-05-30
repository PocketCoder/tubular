'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;
const logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local');
const funct = require('./functions.js');
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: process.env.SECRET, name: 'uniqueSessionID', saveUninitialized: false, resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
	let err = req.session.error,
		msg = req.session.notice,
		success = req.session.success;
	delete req.session.error;
	delete req.session.success;
	delete req.session.notice;
	if (err) {
		res.locals.error = err;
		console.log({err});
	}
	if (msg) {
		res.locals.notice = msg;
		console.log({msg});
	}
	if (success) {
		res.locals.success = success;
		console.log({success});
	}
	next();
});
app.post('/register', (req, res, next) => {
	passport.authenticate('local-signup', (err, user, info) => {
		console.log(`[index.ts | /register] ${JSON.stringify({err, user, info})}`);
		if (user) {
			console.log(`[index.ts] User made with username: ${user.username}`);
			res.send({user});
			req.session.loggedIn = true;
		} else {
			res.send({failed: true});
		}
	})(req, res, next);
});
app.post('/login', (req, res, next) => {
	passport.authenticate('local-signin', (err, user, info) => {
		if (user) {
			console.log(`[index.ts] Found ${user.username}!`);
			req.session.loggedIn = true;
			res.send(user);
		} else {
			res.send({failed: true});
		}
	})(req, res, next);
});
app.get('/logout', (req, res) => {
	const name = req.user.username;
	console.log(`[index.ts] Logging out ${name}`);
	req.logout();
	res.redirect('/');
	req.session.notice(`You have successfully been logged out ${name}`);
});
app.get('/', (req, res, next) => {
	if (req.session.loggedIn) {
		console.log(`[index.ts | loggedIn] ${req.session.loggedIn}`);
		next();
	} else {
		console.log('[index.ts] Not logged in');
		next();
	}
});
passport.use(
	'local-signin',
	new LocalStrategy({passReqToCallback: true}, (req, username, password, done) => {
		funct
			.localAuth(username, password)
			.then((user) => {
				if (user) {
					console.log(`[index.ts | local-signin] Logged in as: ${user.username}`);
					req.session.success = `You are successfully logged in ${user.username}!`;
					done(null, user);
				}
				if (!user) {
					console.log('[index.ts | local-signin] Could not log in');
					req.session.error = 'Could not log user in. Please try again.';
					done(null, user);
				}
			})
			.fail((err) => {
				console.log(`[index.ts| local-signin] ${err.body}`);
			});
	})
);
passport.use(
	'local-signup',
	new LocalStrategy({passReqToCallback: true}, (req, username, password, done) => {
		funct
			.localReg(req, username, password)
			.then((user) => {
				if (user) {
					console.log(`[index.ts | local-signup] Registered ${user.username}`);
					req.session.success = `You are successfully logged in ${user.username}`;
					done(null, user);
				}
				if (!user) {
					console.log('[index.ts | local-signup] Could not register');
					req.session.error = 'That username is already in use, please try a different one.';
					done(null, user);
				}
			})
			.fail((err) => {
				console.log(`[index.ts| local-signin] ${err.body}`);
			});
	})
);
passport.serializeUser((user, done) => {
	console.log(`[index.ts] Serializing ${user.username}`);
	done(null, user);
});
passport.deserializeUser((obj, done) => {
	console.log(`[index.ts] Deserializing ${obj}`);
	done(null, obj);
});
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.error = 'Please sign in!';
	res.redirect('/?signin=true');
}
app.listen(port, () => {
	console.log('Listening on port 3000');
});
app.use('/', express.static(path.join(__dirname, 'public')));
