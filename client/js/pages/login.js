Template.login.events({
	'click #twitter_signin': function () {
		Meteor.loginWithTwitter({}, function() {});
	},
	'click #github_signin': function () {
		Meteor.loginWithGithub({}, function() {});
	},
	'click #facebook_signin': function () {
		Meteor.loginWithFacebook({}, function() {});
	},
	'keypress #search_repo': function (event, template) {
		console.log('call');
		Meteor.call('search', event.target.value, function(error, result) {
			console.log('call', result);
			$('#search_repo')
			.search({
				source: result,
				searchFields: ['title']
			})
		})
	}
});

Template.login.rendered = function () {
	// document.title = doc_title + ' / login'
};