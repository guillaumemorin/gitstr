Template.login.events({
	'click .btn-info': function () {
		Meteor.loginWithTwitter({}, function() {
			Session.set('username', Meteor.user().services.twitter.screenName);
		});
	},

	'click .btn-primary': function () {
		Meteor.loginWithTwitter({}, function() {});
	}
});

Template.login.rendered = function () {
	// document.title = doc_title + ' / login'
};