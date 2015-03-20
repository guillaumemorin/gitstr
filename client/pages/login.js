Template.login.events({
	'click .btn-info': function () {
		Meteor.loginWithTwitter({}, function() {
			// Meteor.users.update(
			// 	{_id: Meteor.userId()},
			// 	{$set: {last_con: 1}}
			// );
		});
	},

	'click .btn-primary': function () {
		Meteor.loginWithTwitter({}, function() {});
	}
});

Template.login.rendered = function () {
	// document.title = doc_title + ' / login'
};