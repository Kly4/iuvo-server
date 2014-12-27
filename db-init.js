/*
 This script loads the courses in the included JSON files onto
 a running mongod instance, in the 'iuvo' database.
 */

// Mongo imports
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iuvo');

var cdata = require('./test-courses');
var edata = require('./test-events');


// Startup
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Is mongod running?"));
db.once('open', function (cb) {

    var schemas = require('./schemas.js')(mongoose);
    var Course = schemas.Course;
    var Event = schemas.Event;

    Course.create(cdata, function (err) {
	if (err) {
	    console.log('Error creating a Course!');
	    console.log(err);
	}
	else {
	    var args = Array.prototype.slice.call(arguments);
	    args.shift();
	    var courses = args;
	    
	    for (i = 0; i < edata.length; i++) {
		var obj = edata[i];
		
    		// Initialize with random dates and courses
    		obj['_course-id'] =
    		    courses[Math.floor(Math.random() * courses.length)]._id;

		var s = new Date();
		// up to 20 days in the future
		s.setDate(s.getDate() + Math.floor(Math.random() * 20));
		
		var e = new Date(s.getTime());
		// up to 4 hours long
		e.setTime(e.getTime() + Math.floor(1 + Math.random() * 6)*1800000);

    		obj['start-date'] = s;
    		obj['end-date'] = e;
	    }
	    Event.create(edata, function (err) {
		if (err) {
    		    console.log('wtfevent');
    		    console.log(err);
		}
		else {
		    console.log('done');
		}
	    });
	    
	}
    });
});
