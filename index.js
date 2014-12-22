'use strict';

// Mongo imports
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iuvo');

var restify = require('restify');


// Startup
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Is mongod running?"));
db.once('open', function (cb) {

    var schemas = require('./schemas.js')(mongoose);
    var Course = schemas.Course;
    var Event = schemas.Event;

    
    var server = restify.createServer();

    // Generic error handler for Mongoose queries
    function dbErr(cb) {
	return function (err, res) {
	    if (err)
		console.log(err);
	    else
		cb(res);
	};
    }

    function getCourse(req, res, next) {
	Course.findOne({
	    school: req.params.school,
	    subject: req.params.subject,
	    code: req.params.code
	}, dbErr(function (course) {
	    res.send(course);
	}));
	next();
    }
    
    function getEvents(req, res, next) {
	Event
	    .find({
		'_course-id': req.params.course
	    })
	    .where('start_date').gt(new Date())
	    .sort('start_date')
	    .select('-_course-id')
	    .exec(dbErr(function (events) {
		res.send(events);
	    }));
	next();
    }

    server.get('/courses/:school/:subject/:code', getCourse);
    server.get('/events/:course', getEvents);
    
    server.listen('8080', function (){
	console.log("Restify listening at %s", server.url);
    });
});

