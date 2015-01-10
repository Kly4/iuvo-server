/*
 This clusterfuck loads the courses in the included JSON files onto
 a running mongod instance, in the 'iuvo' database.
 */

// Mongo imports
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iuvo');
// mongoose.set('debug', true);

var cdata = require('./test-courses');
var edata = require('./test-events');


// Startup
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Is mongod running?"));
db.once('open', function (cb) {

    var schemas = require('./schemas.js')(mongoose);
    var Course = schemas.Course;
    var Event = schemas.Event;

    
    // Shadowing the global above
    var cdata = require('./Courses-Umass.json');
    cdata = cdata.results.collection1;
    
    initCourses(Course, cdata, [], function (courses) {
	initEvents(Event, edata, courses);
    });
});

function initCourses(Course, cdata, courses, done) {
    var left = cdata.length;
    if (0 == left)
	return done(courses);

    var raw = cdata.pop();
    // Shitty data element
    if (!raw || !raw["instructor"])
	return initCourses(Course, cdata, courses, done);

    raw = {
	school: "UMass-Amherst",
	subject: raw["subject"],
	code: raw["course-number"],
	title: raw["title"]["text"],
	instructor: raw["instructor"]
    };


    // // Remove duplicates (usually the same course, different times)
    // Course.findOne(raw, function (err, res) {
    // 	if (err) {
    // 	    console.log("Finding course failed");
    // 	    console.log(err);
    // 	}
	
    // 	else if(res == null) {
	    Course.create(raw, function (err, res) {
		if (left % 50 == 0)
		    console.log(left);

		if (err) {
		    console.log("Could not create Course");
		    console.log(err);
		    return;
		}
		courses.push(res);

		initCourses(Course, cdata, courses, done);
	    });
    // 	}
    // });
}

function initEvents(Event, edata, courses) {
    if (edata.length == 0) {
	console.log('done');
	return;
    }
	
    var obj = edata.pop();
    
    // Initialize with random dates and courses
    obj['course'] =
    	courses[Math.floor(Math.random() * courses.length)]._id;

    var s = new Date();
    // up to 20 days in the future
    s.setDate(s.getDate() + Math.floor(Math.random() * 20));
    
    var e = new Date(s.getTime());
    // up to 4 hours long
    e.setTime(e.getTime() + Math.floor(1 + Math.random() * 6)*1800000);

    obj['start_date'] = s;
    obj['end_date'] = e;
    
    
    Event.create(obj, function (err, res) {
	if (err) {
    	    console.log('wtfevent');
    	    console.log(err);
	}
	else {
	    initEvents(Event, edata, courses);
	}
    });
}
