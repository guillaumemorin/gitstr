// Meteor.subscribe('files');
// Meteor.subscribe('userData');
// Meteor.subscribe('repos');

Template.repo.helpers({
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	uploadCallback: function() {
		return {
			finished: function(index, fileInfo, context) {
				Meteor.call('moveRepo', {id: Meteor.userId(), repo:  Session.get('repo')}, fileInfo, function(error, result) {
					if (error) {
						console.log(error);
						Session.set("upload_error_message", error.reason);
					}
				});
			}
		}
	},
	formData: function () {
		var user_id = Meteor.userId();
		return {
			id: user_id
		};
	}
});

Template.repo.rendered = function () {
	document.title = 'to be defined';
};