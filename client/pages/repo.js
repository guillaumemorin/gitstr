Template.repo.helpers({
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	isOwner: function () {
		return UI.getData().user_id === Meteor.userId();
	},
	setIcon: function (directory) {
		return (directory) ? 'folder' : 'file';
	},
	setSize: function (size) {
		return filesize(size);
	},
	setDate: function (timestamp) {
		return moment(timestamp).fromNow();
	},
	setLastUpdate: function (timestamp) {
		if (!timestamp) {
			return '';
		}
		return 'Updated ' + moment(timestamp).fromNow();
	},
	tmpNewFiles: function() {
		return Session.get('tmp_new_files');
	},
	nbFiles: function() {
		return Session.get('repo_nb').files;
	},
	nbFolder: function() {
		return Session.get('repo_nb').folder;
	},
	uploadCallback: function() {
		return {
			finished: function(index, fileInfo, context) {
console.log('fileinfo', fileInfo);

				var tmp = Session.get('tmp_new_files') || [];
				tmp.push({title: fileInfo.name, directory: 0, size: fileInfo.size, timestamp: new Date().getTime()});
				Session.set('tmp_new_files', tmp);

				// Meteor.call('moveRepo', {id: Meteor.userId(), repo_id: Session.get('repo_id')}, fileInfo, function(error, result) {
				// 	if (error) {
				// 		console.log(error);
				// 		Session.set("upload_error_message", error.reason);
				// 	}
				// });
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
		var tmp = Session.get('tmp_new_files') || [];
		var nb_folder = Session.get('nb_folder');

		var title = 'new_folder' + (nb_folder > 0 ? '_' + nb_folder : '');
		tmp.push({title: title, directory: 1, children: [], size: 0, timestamp: new Date().getTime()})
		Session.set('tmp_new_files', tmp);
		Session.set('nb_folder', nb_folder + 1);
	},
	'click #cancel': function (event, template) {
		Session.set('tmp_new_files', []);
		Session.set('nb_folder', UI.getData().nb_folder);
		
	},
	'click #publish': function (event, template) {
		Meteor.call('commit', {id: Meteor.userId(), repo_id: Session.get('repo_id')}, Session.get('tmp_new_files'), function(error, result) {
			if (error) {
				console.log(error);
				// error message to set
			}
		});
		Session.set('tmp_new_files', []);
		Session.set('nb_folder', UI.getData().nb_folder);
	}
});

Template.repo.rendered = function () {
	var data = UI.getData();
	Session.set('nb_folder', data.nb_folder);
	Session.set('repo_id', data._id);
	document.title = data.url;
};