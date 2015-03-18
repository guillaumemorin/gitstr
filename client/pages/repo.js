Template.repo.helpers({
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	owner: function () {
		return UI.getData().user_id === Meteor.userId();
	},
	icon: function () {
		return (this.directory) ? 'folder' : 'file';
	},
	size: function () {
		return filesize(this.size);
	},
	date: function () {
		return moment(this.timestamp).fromNow();
	},
	uploadCallback: function() {
		return {
			finished: function(index, fileInfo, context) {
				Meteor.call('moveRepo', {id: Meteor.userId(), repo_id: Session.get('repo_id')}, fileInfo, function(error, result) {
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

Template.repo.events({
	'click #upload_button': function (event, template) {
		$('#upload_modal')
			.modal('setting', 'transition', 'fade up')
			.modal('show');
	},
	'click #add_folder_button': function (event, template) {
		Meteor.call('addFolder', {id: Meteor.userId(), repo_id: UI.getData()._id}, function(error, result) {
			if (error) {
				console.log(error);
				Session.set("upload_error_message", error.reason);
			}
		});
	}
});

Template.repo.rendered = function () {
	var data = UI.getData();
	Session.set('repo_id', data._id);
	document.title = data.url;
};