const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

// Connect to Database
mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', () => {
	console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
	console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');
let User = require('./models/user');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extend: false }));
// Parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
	secret: config.secret,
	resave: true,
	saveUnitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		let namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}, 
	customValidators: {
      isEmailAvailable(email) {
        return new Promise((resolve, reject) => {
          User.findOne({ email: email }, (err, user) => {
            if (err) throw err;
            if(user == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      },
      isUsernameAvailable(username) {
        return new Promise((resolve, reject) => {
          User.findOne({ username: username }, (err, user) => {
            if (err) throw err;
            if(user == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      }
    }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Enable Global User Variable
app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

// Home Route
app.get('/' , (req, res) => {
	res.render('index', {
		title: 'About me'
	});
});

// Articles Route
app.get('/articles' , (req, res) => {
	Article.find({}, (err, articles) => {
		if(err) {
			throw err;
		}
		res.render('articles', {
			title: 'Articles',
			articles: articles
		});
	});
});

// Route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start server
app.listen(3000, () => {
	console.log('Server started on port 3000');
});