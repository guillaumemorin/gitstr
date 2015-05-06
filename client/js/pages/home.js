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

Template.repo_input.helpers({
	errorMessage: function () {
		return Session.get('submit_error_Message');
	}
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
			
			Session.set("submit_error_Message", null);
			event.target.repo_input.value = '';
		});
		return false;
	},
	'keydown input': function (event, template) {
		if (template.$('#repo_input_error').is(':visible')) {
			template.$('#repo_input_error').transition({
				transition: 'fade left',
				onComplete : function() {
					Session.set("submit_error_Message", null);
				}
			});
		}
	}
});

Template.home.rendered = function () {
	document.title = service_name;
};