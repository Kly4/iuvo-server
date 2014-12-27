'use strict';

// Mongo imports
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iuvo');

var restify = require('restify');


// Startup
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Is mongod running?"));
db.once('open', function (callback) {

    var schemas = require('./schemas.js')(mongoose);
    var Course = schemas.Course;
    var Event = schemas.Event;

    
    var server = restify.createServer();

    // Generic error handler for Mongoose queries
    function dbErr(next, cb, code) {
	return function (err, res) {
	    if (err) {
		console.log(err);
		res.send({
		    error: code || E.idk
		});
	    }
	    else
		cb(res);
	    next();
	};
    }

    // Takes a sequence of failable mongoose queries,
    // followed by an array of error codes corresponding
    // to each failstate.
    //
    // *** Syntax ***
    // seq(next, {
    // 	course: Course.findOne({}),
    // 	event: Event.find({
    // 	    _id = obj.event1._id
    // 	}),
    // 	_order: [
    // 	    ['course', E.course404],
    // 	    ['event', E.event404]
    // 	]
    // })
    function seq(next, obj) {
	var order = obj._order;
	order.forEach(function (tup) {
	    var fn = tup[0], err = tup[1];
	    obj[fn].exec(dbErr(next, function (res) {
		obj[fn] = res;
	    }, err));
	});
    }

    function getCourse(req, res, next) {
	Course.findOne({
	    school: req.params.school,
	    subject: req.params.subject,
	    code: req.params.code
	}, dbErr(next, function (course) {
	    res.send(course);
	}));
    }
    
    function getEvents(req, res, next) {
	Event
	    .find({
		'_course-id': req.params.course
	    })
	    .where('start_date').gt(new Date())
	    .sort('start_date')
	    .select('-_course-id')
	    .exec(dbErr(next, function (events) {
		res.send(events);
	    }));
    }

    function createEvent(req, res, next) {
	Course.findOne({
	    _id: req.params._id
	}, dbErr(next, function (course) {

	    Event.create({
		course_id: course._id,
		title: req.params.title,
		description: req.params.description,
		location: req.params.location,
		comments: [],
		'start-date': req.params['start-date'],
		'end-date': req.params['end-date']
	    }, dbErr(next, function () {
		res.send(200);
	    }, E.create));

	}, E.course404));
    }

    server.get('/courses/:school/:subject/:code', getCourse);
    server.get('/events/:course', getEvents);
    
    server.get('/test', function (req, res, next) {
	res.send({ok: 'true'});
    });
    
    server.listen('80', function (){
	console.log("Restify listening at %s", server.url);
    });
});

// Error codes
var E = {
    idk: 1,
    course404: 2,
    event404: 4,
    create: 8
};
