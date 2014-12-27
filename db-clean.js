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

    var i=0;
    function done() {
	console.log("done " + i++);
    }
    Course.find({}).remove(done);
    Event.find({}).remove(done);
});
