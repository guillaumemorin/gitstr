var tmpFilesinit = function() {
	Session.set('tmp_files', []);
	Session.set('nb_tmp_files', 0);
};

var audio_player = {};

Template.repo.helpers({
	supported: function (type) {
		var cover_supported_type = {
			image: true,
			audio: true,
			video: true
		}
		return cover_supported_type[type];
	},
	filter: function (files) {

		var filter = Session.get('filter');
		if (!filter && UI.getData().filter_type) {
			filter = UI.getData().filter_type;
			Session.set('filter', filter);
		}

		if (!filter || filter === 'all') {
			return files;
		}

		var files_ret = [];
		_.map(files, function(file) {
			if (filter === file.type.subtype) {
				files_ret.push(file);	
			}
		});

		return files_ret;
	},
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	repoOwnerId: function () {
		return UI.getData().repo.user_id;
	},
	setIcon: function (type) {
		var type_map = {
			image: 'camera',
			video: 'record',
			audio: 'unmute'
		}

		if (!type || !type_map[type]) {
			return 'file';
		}
		return type_map[type];
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
	tmpFiles: function() {
		return Session.get('tmp_files');
	},
	nbTmpFiles: function() {
		return Session.get('nb_tmp_files');
	}
});

Template.repo.events({
	'click .cover': function (event, template) {
		event.preventDefault();

		var url = event.currentTarget.href || false;
		if (!url) {
			$('#image_fail_dimmer').dimmer('show');
			return;
		}

		console.log(event.currentTarget.href);

		Session.set('modal_info', {type: 'image', url: url});
		$('#image_modal')
			// .modal('setting', 'transition', 'fade up')
			.modal('show');
	},
	'click .cover-video' : function (event, template) {
		event.preventDefault();

		var cover = template.$(event.target);
		var video_player = cover.next();
		cover.hide();
		video_player.show();
		// video_player.play();
	},
	'click .play-audio': function (event, template) {
		event.preventDefault();

		var current_target = event.currentTarget;
		var url = current_target.href || false;
		if (!url) {
			$('#image_fail_dimmer').dimmer('show');
			return;
		}

		if (audio_player.playing) {
			audio_player.instance.pause();
			audio_player.playing = !audio_player.playing;
			if (event.target.className === 'audio stop grey icon') {
				event.target.className = 'audio play grey icon';
				template.$(current_target).next().transition('fade down');
				return;
			}
			template.$('.audio.icon').each(function() {
				var elmt = $(this);
				elmt.attr('class', 'audio play grey icon');
				if (elmt.parent().next().is(":visible")) {
					elmt.parent().next().transition('fade down');
				}
			})
		}

		audio_player.instance = new Audio(url);
		audio_player.instance.play();
		template.$(current_target).next().transition('fade down');
		event.target.className = 'audio stop grey icon';
		audio_player.instance.onplaying = function() {
			audio_player.playing = true;
		}

		// audio.ondurationchange = function(a) {
		// 	console.log("The video duration has changed", a, this.duration);
		// };
		var current_timer;
		audio_player.instance.ontimeupdate = function() {
			var time = moment.duration(this.currentTime, 'seconds');
			var seconds = time.seconds();
			if (seconds === current_timer) {
				return;
			}
			current_timer = seconds;
			var timer = time.minutes() + ':' + (seconds < 10 ? '0' + seconds : seconds);
			template.$(current_target).parent().next().children().text(timer);
		}
	},
	'click #add_dropdown': function (event, template) {
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
	'click #filter_image, click #filter_video, click #filter_audio, click #filter_application, click #filter_all': function (event, template) {
		var filter_id = event.target.id;
		var filter = filter_id.split('_');
		Session.set('filter', filter[1]);
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
	'click #subscribe': function (event, template) {
		if (!Meteor.user()) {
			$('#signin')
			.modal('setting', 'transition', 'fade up')
			.modal('show');
			return;
		}

		var repo_id = Session.get('repo_id');
		var subscribers = UI.getData().repo.subscribers;
		var inc = 1;
		var action = '$addToSet';
		var action_obj = {};

		if (~_.indexOf(subscribers, Meteor.userId())) {
			action = '$pull';
			inc = -1;
		}

		action_obj[action] = {subscription: repo_id};
		action_obj['$inc'] = {nb_subscription: inc};

		Meteor.users.update(
			{_id: Meteor.userId()},
			action_obj
		);

		action_obj[action] = {subscribers: Meteor.userId()};
		action_obj['$inc'] = {nb_subscribers: inc};

		Repos.update(
			{"_id": repo_id},
			action_obj
		);	
	},
	'click #commit_cancel': function (event, template) {
		tmpFilesinit();
	
	},
	'click #commit': function (event, template) {
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
	Session.set('repo_id', data.repo._id);
	tmpFilesinit();

	window.setTimeout(function() {
		$('#page_loader').dimmer('hide');	
	}, 1000);

	//Init
	$('.dropdown').dropdown('set selected', (Session.get('filter') || 'Filter'));
	document.title = data.repo.url;
};