Template.feed.helpers({
	getFilesList: function (files, type) {
		var prop = [];
		_.each(files, function(id) {
			var file = Repos_files.findOne({_id: id});
			if (file.type.subtype === type) {
				prop.push({
					title: file.title,
					size: file.size,
					cover_url: file.cover_url
				});	
			}
		});

		return prop;
	}
});

Template.home.helpers({
	errorMessage: function () {
		return Session.get('submit_error_Message');
	}
	// repoList: function () {
	// 	var repos = Repos.find({user_id: Meteor.userId()}, {sort: {created_at : -1}});
	// 	var repo_count = repos.count();

	// 	//Redirect if creation is confirmed
	// 	if (Session.get('nb_repo') + 1 === repo_count) {
	// 		var path = Repos.findOne({}, {sort: {created_at : -1}}).url;
	// 		Router.go(path);
	// 	}

	// 	Session.set('nb_repo', repos.count());
	// 	return repos;
	// }
});

Template.home.events({
	'submit form': function (event, template) {
		var input_val = event.target.repo_input.value;
		if (input_val === '') {
			return false;
		}
		Meteor.call('createRepo', input_val, function (error, result) {
			if (error) {
				Session.set("submit_error_Message", error.reason);
				template.$('#repo_input_error').transition('fade left');
				return;
			}
			event.target.repo_input.value = '';
		});
		return false;
	},
	'keydown input': function (event, template) {
		if (template.$('#repo_input_error').is(':visible')) {
			template.$('#repo_input_error').transition('fade left');
		}
	}
});

Template.home.rendered = function () {
	// document.title = Meteor.user().profile.name;
	document.title = service_name;
};