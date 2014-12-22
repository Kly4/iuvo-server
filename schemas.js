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
	
	'title': String,
	'description': String,
	'num-attendees': Number,
	'comments': [{ contents: String,
		       author: String,
		       date: Date
		     }],

	// Date of the event
	'start_date': Date,
	'end_date': Date
    });

    return {
	Course: mongoose.model('Course', courseSchema),
	Event: mongoose.model('Event', eventSchema)
    };
};
