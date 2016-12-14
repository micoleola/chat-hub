 var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	app = express(),
	http = require('http'),
	pg = require('pg'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

var api = require('./routes/api');
var server_logic = require('./routes/server');

var port = 5005;
	server.listen(process.env.PORT || port);
	
	// Set .html as the default template extension
	app.set('view engine', 'html');	
	app.engine('html', require('ejs').renderFile);
	app.set('views', __dirname + '/views');

	// app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	server_logic(app, io);
	api(app, pg);

console.log('Your application is running on http://localhost:' + port);

// var express = require('express'),
// 	path = require('path'),
// 	app = express(),
// 	hbs = require('express-handlebars'),
// 	http = require('http'),
// 	server = http.createServer(app),
// 	io = require('socket.io').listen(server);

// var server_logic = require('./routes/server');


// var port = 5005;
// 	server.listen(process.env.PORT || port);
	
// 	// Set .html as the default template extension
// 	app.engine('.hbs', hbs({extname:'.hbs', defaultLayout: 'layout'}));
// 	app.set('view engine', '.hbs');	

// 	app.use(express.static(path.join(__dirname, 'public')));

// 	server_logic(app, io);
 	
// console.log('Your application is running on http://localhost:' + port);