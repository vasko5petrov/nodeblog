const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Models
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
	res.render('register');
});

// Register Proccess
router.post('/register', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('email', 'Email already in use').isEmailAvailable();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('username', 'Username already in use').isUsernameAvailable();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Password too short (min 5 symbols)').isLength({ min: 5 });
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	req.asyncValidationErrors().then(() => {
	    //no errors, create user
	  let newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if(err) {
					console.log(err);
				}
				newUser.password = hash;
				newUser.save((err) => {
					if(err) {
						console.log(err);
						return;
					} else {
						req.flash('success', 'You are now registered and can log in');
						res.redirect('/users/login');
					}
				});
			});
		});
	}).catch((errors) => {
		res.render('register', {
			errors: errors
		});
	});

	/*let errors = req.validationErrors();

	if(errors) {
		res.render('register', {
			errors: errors
		});
	} else {
		let newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if(err) {
					console.log(err);
				}
				newUser.password = hash;
				newUser.save((err) => {
					if(err) {
						console.log(err);
						return;
					} else {
						req.flash('success', 'You are now registered and can log in');
						res.redirect('/users/login');
					}
				});
			});
		});
	}*/
});

// Login Form 
router.get('/login', (req, res) => {
	res.render('login');
});

// Login Proccess
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;