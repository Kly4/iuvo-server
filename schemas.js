module.exports = function (mongoose) {
    var ObjectId = mongoose.Schema.Types.ObjectId;
    
    var courseSchema = mongoose.Schema({
	'school': String,
	'subject': String,
	'course-code': String,
	'title': String,
	'instructor': String
    });

    var eventSchema = mongoose.Schema({
	'_course-id': ObjectId,

	'description': {
	    type: String,
	    validate: [maxLength(300), "Description too long"]
	},
	// Include geolocation?
	'location': {
	    type: String,
	    validate: [maxLength(60), "Location too long"]
	},
	// Should make this an array of IDs
	'num-attendees': {
	    type: Number,
	    default: 0
	},
	
	// What about comment replies?
	'comments': [{ text: String,
		       author: String,
		       date: Date
		     }],

	// Date of the event
	'start-date': Date,
	'end-date': Date
    });

    
    return {
	Course: mongoose.model('Course', courseSchema),
	Event: mongoose.model('Event', eventSchema)
    };
};


/** Validators **/

function maxLength(n) {
    return function (str) { return str.length <= n; };
}
