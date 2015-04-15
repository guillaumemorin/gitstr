Template.login.events({
	'click #twitter_signin': function () {
		Meteor.loginWithTwitter({}, function() {});
	},
	'click #github_signin': function () {
		Meteor.loginWithGithub({}, function() {});
	},
	'click #facebook_signin': function () {
		Meteor.loginWithFacebook({}, function() {});
	}
});

Template.login.rendered = function () {
	// document.title = doc_title + ' / login'
};