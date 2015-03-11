Meteor.subscribe('files');

Template.repo.helpers({
	files: function () {
		return Images.find({});
	}
});

Template.repo.events({
	'change #inputFile': function(event, template) {
		console.log('change done');
		var files = event.target.files;
		for (var i = 0, ln = files.length; i < ln; i++) {
			Images.insert(files[i], function (err, fileObj) {
				// Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
			});
		}
	}
});

Template.repo.rendered = function () {
	document.title = 'to be defined';
};