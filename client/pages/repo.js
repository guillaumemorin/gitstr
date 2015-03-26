var tmpFilesinit = function() {
	Session.set('tmp_files', []);
	Session.set('nb_tmp_folder', 0);
	Session.set('nb_tmp_files', 0);
};

Template.repo.helpers({
	isEqual: function (type, val) {
		return type === val;
	},
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	isOwner: function () {
		return UI.getData().repo.user_id === Meteor.userId();
	},
	setIcon: function (directory) {
		return (directory) ? 'folder' : 'file';
	},
	setLink: function (type, href) {
		return (type === 'application') ? href : '#';
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
	setIndex: function () {
		var structure = UI.getData().repo.file_structure;//Session.get('current_display_file_structure');
		return _.map(structure, function(value, index) {
			value.index = index;
			return value;
		});
	},
	setCurrentExplorerPath: function () {
		return Session.get('current_explorer_path')
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
	'click .explorer-link': function (event, template) {
		// var file_structure = Session.get('current_display_file_structure');
		// var index = event.target.dataset.index;
		// var child_structure = file_structure[index].children;
			
		// Session.set('current_display_file_structure', child_structure);
		// Session.set('current_explorer_path', event.target.textContent);


		// console.log('children', child_structure);
		// console.log(event.target.dataset, event.target.textContent);
	},
	'click .image.thumbnail': function (event, template) {
		event.stopPropagation();
		event.preventDefault();

		var url = event.target.dataset.href || image_404;
		Session.set('image_modal_url', url);
		$('#image_modal')
			.modal('setting', 'transition', 'fade up')
			.modal('show');
	},
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
		var nb_folders = Session.get('nb_folders') || 0;

		var title = 'new_folder' + (nb_folders > 0 ? '_' + nb_folders : '');
		tmp.push({title: title, directory: 1, children: [], size: 0, timestamp: new Date().getTime()})
		Session.set('tmp_files', tmp);
		Session.set('nb_folders', nb_folders + 1);
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
	}
});

Template.repo.rendered = function () {
	var data = UI.getData();
	Session.set('nb_folders', data.repo.nb_folders);
	Session.set('repo_id', data.repo._id);
	Session.set('current_explorer_path', '');
	// Session.set('current_display_file_structure', data.repo.file_structure);
	tmpFilesinit();
	$('.dropdown').dropdown();
	document.title = data.url;
};