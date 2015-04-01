Template.home.helpers({
	errorMessage: function () {
		return Session.get('submit_error_Message');
	},
	repoList: function () {
		var repos = Repos.find({}, {sort: {timestamp : -1}});
		var repo_count = repos.count();

		//Redirect if creation is confirmed
		if (Session.get('nb_repo') + 1 === repo_count) {
			var path = Repos.findOne({}, {sort: {timestamp : -1}}).url;
			Router.go(path);
		}

		Session.set('nb_repo', repos.count());
		return repos;
	}
});

Template.home.events({
	'submit form': function (event, template) {
		var input_val = event.target.myInput.value;
		if (!input_val) {
			return false;
		}
		Meteor.call('createRepo', input_val, function (error, result) {
			if (error) {
				Session.set("submit_error_Message", error.reason);
			}
		});
		return false
	}
});

Template.home.rendered = function () {
	document.title = Meteor.user().profile.name;
};