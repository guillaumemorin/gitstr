var tmpFilesinit = function() {
	Session.set('tmp_files', []);
	Session.set('nb_tmp_folder', 0);
	Session.set('nb_tmp_files', 0);
};

var isUserLogged = function() {
	return Meteor.loggingIn() && Meteor.user();
};

Template.repo.helpers({
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	isOwner: function () {
		return UI.getData().repo.user_id === Meteor.userId();
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
	subscribed: function() {
		return true;
	},
	tmpFiles: function() {
		return Session.get('tmp_files');
	},
	nbTmpFiles: function() {
		return Session.get('nb_tmp_files');
	},
	nbTmpFolder: function() {
		return Session.get('nb_tmp_folder');
	}
});

Template.repo.events({
	'click #add_dropdown': function (event, template) {
		console.log('add', $('#add_dropdown'), $('#add_dropdown').dropdown());
		$('#add_dropdown')
		.dropdown({
			action: 'combo',
			transition: 'horizontal flip'
		});
	},
	'click #filter_dropdown': function (event, template) {
		$('#filter_dropdown')
		.dropdown({
			transition: 'horizontal flip'
		});
	},
	'click #history_dropdown': function (event, template) {
		$('#history_dropdown')
		.dropdown({
			transition: 'fade up'
		});
	},
	'click #add:first-child:has(#upload_button)': function (event, template) {
		$('#upload_modal')
		.modal('setting', 'transition', 'fade up')
		.modal('show');
	},
	'click #add:first-child:has(#add_folder_button)': function (event, template) {
		var tmp = Session.get('tmp_files') || [];
		var nb_folder = Session.get('nb_folder');

		var title = 'new_folder' + (nb_folder > 0 ? '_' + nb_folder : '');
		tmp.push({title: title, directory: 1, children: [], size: 0, timestamp: new Date().getTime()})
		Session.set('tmp_files', tmp);
		Session.set('nb_folder', nb_folder + 1);
		Session.set('nb_tmp_folder', Session.get('nb_tmp_folder') + 1);
	},
	'click #subscribe': function (event, template) {
		if (!Meteor.user()) {
			$('#signin')
			.modal('setting', 'transition', 'fade up')
			.modal('show');
		}	
	},
	'click #cancel': function (event, template) {
		tmpFilesinit();
	
	},
	'click #publish': function (event, template) {
		Meteor.call('commit', {id: Meteor.userId(), repo_id: Session.get('repo_id')}, Session.get('tmp_files'), function(error, result) {
			if (error) {
				console.log(error);
				// error message to set
			}
		});
		tmpFilesinit();
		Session.set('nb_folder', UI.getData().repo.nb_folder); // to remove ??
	}
});

Template.repo.rendered = function () {
	var data = UI.getData();
	Session.set('nb_folder', data.repo.nb_folder);
	Session.set('repo_id', data.repo._id);
	tmpFilesinit();
	$('.dropdown').dropdown();
	document.title = data.url;
};