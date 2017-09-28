const express = require('express');
const router = express.Router();
// Models
let Article = require('../models/article');
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('add_article', {title: 'Add Article'});
});

// Add Submit POST Route
router.post('/add', (req, res) => {
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Get Errors
	let errors = req.validationErrors();

	if(errors) {
		res.render('add_article', {
			title: 'Add Article',
			errors: errors
		});
	} else {
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save((err) => {
			if(err) {
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article has been created');
				res.redirect('/');
			}
		});
	}
});

// Get Single Article Route
router.get('/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if(err) throw err;
		User.findById(article.author, (err, user) => {
			if(err) throw err;
			User.findOne({username: 'admin'}, (err, admin) => {
				res.render('article', {
					article: article,
					author: user,
					admin: admin
				});
			});
		});
	});
});

// Get Article Edit Route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if(err) throw err;
		User.findOne({username: 'admin'}, (err, admin) => {
			if(err) throw err;
			User.findById(req.user._id, (err, user) => {
				if(err) throw err;
				if(article.author != req.user._id && admin.username != user.username) {
					req.flash('danger', 'Not Authorized');
					res.redirect('/');
				}
				res.render('edit_article', {
					title: 'Edit Article',
					article: article
				});
			});
		});
	});
});

// Edit Submit POST Route
router.post('/edit/:id', (req, res) => {
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Get Errors
	let errors = req.validationErrors();

	if(errors) {
		Article.findById(req.params.id, (err, article) => {
			if(err) throw err;
			res.render('edit_article', {
				title: 'Edit Article',
				errors: errors,
				article: article
			});
		});
	} else {
		User.findOne({username: 'admin'}, (err, admin) => {
			if(err) throw err;
			User.findById(req.user._id, (err, user) => {
				if(err) throw err;
				let article = {};
				if(admin.username != user.username) {
					article.title = req.body.title;
					article.author = req.user._id;
					article.body = req.body.body;
				} else {
					article.title = req.body.title;
					article.body = req.body.body;
				}
				
				let query = {_id: req.params.id};

				Article.update(query, article, (err) => {
					if(err) {
						console.log(err);
						return;
					} else {
						req.flash('success', 'Article has been updated');
						res.redirect('/');
					}
				});
			});
		});
	}
});

// Delete Route
router.delete('/:id', (req, res) => {
	if(!req.user._id) {
		res.status(500).send();
	}

	let query = {_id:req.params.id};

	Article.findById(req.params.id, (err, article) => {
		User.findOne({username: 'admin'}, (err, admin) => {
			if(err) throw err;
			User.findById(req.user._id, (err, user) => {
				if(err) throw err;
				if(article.author != req.user._id && admin.username != user.username) {
					req.flash('danger', 'Not Authorized');
					res.redirect('/articles/'+req.params.id);
				} else {
					Article.remove(query, (err) => {
						if(err) {
							console.log(err);
							return;
						}
						req.flash('warning', 'Article has been deleted');
						res.send('Success');
					});
				}
			});
		});
	});
});

// Access Control
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

module.exports = router;