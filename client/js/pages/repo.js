var tmpFilesinit = function() {
	Session.set('tmp_files', []);
	Session.set('nb_tmp_files', 0);
};

var audio_player = {};
var tweets = [];

Template.repo_buttons.helpers({
	twitterShareParams: function () {
		var data = UI.getData();
		var text = 'I have created a new repository named "' + data.repo.title + '" on @gitstr! Subscribe to it right here';
		var discover_text = 'I have discovered a new repository named "' + data.repo.title + '" on @gitstr! Have a look at it here';
		
		var url = data.repo.permalink;
		if (data.repo.last_update) {
			text = 'I have updated my @gitstr "' + data.repo.title + '" repository! Subscribe to it right here';
		}

		text = (Meteor.userId() === data.repo.user_id) ? text : discover_text;
		return '?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
	}
});

Template.repo_stat_list.helpers({
	getFilter: function() {
		return Session.get('filter');
	}
});

Template.repo.helpers({
	supported: function (type) {
		var cover_supported_type = {
			image: true,
			audio: true,
			video: true,
			tweet: true
		}
		return cover_supported_type[type];
	},
	getFilterIcon: function(files) {
		var icons = {image: 'camera', video: 'record', audio: 'unmute', application: 'file text', all: 'warning circle'}
		return icons[Session.get('filter')];
	},
	emptyMessage: function () {
		return (Session.get('filter') !== 'all' ? 'No ' + Session.get('filter') + ' files' : 'Empty repository')
	},
	length: function (files) {

		var filter = Session.get('filter');
		if (!filter || filter === 'all') {
			return files.count();
		}

		var files_ret = [];
		files.forEach(function(file) {
			if (filter === file.type.subtype) {
				files_ret.push(file);	
			}
		});

		return files_ret.length;
	},
	filter: function (files) {

		var filter = Session.get('filter');
		if (!filter || filter === 'all') {
			return files;
		}

		var files_ret = [];
		files.forEach(function(file) {
			if (filter === file.type.subtype) {
				files_ret.push(file);	
			}
		});

		return files_ret;
	},
	errorMessage: function () {
		return Session.get('upload_error_message');
	},
	setIcon: function (type) {
		var type_map = {
			image: 'camera',
			video: 'record',
			audio: 'unmute',
			link: 'linkify'
		}

		if (!type || !type_map[type]) {
			return 'file';
		}
		return type_map[type];
	},
	setLink: function (type, href) {
		return (type === 'application') ? href : '#';
	},
	setDate: function (timestamp) {
		return moment(timestamp).fromNow();
	},
	tmpFiles: function() {
		return Session.get('tmp_files');
	},
	isInHistory: function(id) {
		var history_files = Session.get('history_files');
		return ~_.indexOf(history_files, id);
	},
	nbTmpFiles: function() {
		return Session.get('nb_tmp_files');
	},
	addTweetToDisplay: function(tweet_id) {
		tweets.push(tweet_id);
	}
});

Template.repo.events({
	'click #repo_table_collapse' : function (event, template) {
		$('.extra-content').toggle();
		var status = Session.get('display_status') === 'browser' ? 'attach' : 'browser';
		Session.set('display_status', status);
	},
	'click .cover, click .cover-link': function (event, template) {
		event.preventDefault();

		var url = event.currentTarget.href || false;
		if (!url) {
			$('#image_fail_dimmer').dimmer('show');
			return;
		}

		var type = event.currentTarget.dataset.type || 'image';
		Session.set('modal_info', {type: type, url: url});
		$('#image_modal').modal('show');
	},
	'click #fb_share': function (event, template) {
		event.preventDefault();
		FB.ui({
			method: 'share',
			href: encodeURI(UI.getData().repo.permalink),
		}, function(response){});
	},
	'click .cover-video' : function (event, template) {
		event.preventDefault();
		var $cover = template.$(event.target);
		var $video_player = $cover.parent().prev();
		var href = $(event.currentTarget).attr('href');

		$('source', $video_player).attr('src', href);
		$video_player.load();
		$cover.hide();
		$video_player.show();
		
		$video_player[0].onended = function() {
			$video_player.hide();
			$cover.show();
		};
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
		// $('#add_dropdown')
		// .dropdown({
		// 	action: 'combo',
		// 	transition: 'fade up'
		// });
		$('#upload_modal').modal('show');
	},
	'click #history_dropdown': function (event, template) {
		$('#history_dropdown')
		.dropdown({
			transition: 'fade up'
		});
	},
	'click .item.history': function (event, template) {
		var history = Repos_history.findOne({_id: event.target.id});
		Session.set('history_files', history.files);
	},
	'click #upload_button': function (event, template) {
		$('#upload_modal').modal('show');
	},
	'click #link_button': function (event, template) {
		$('#link_modal').modal('show');
	},
	'click #git_input_button, click #git_input_close': function (event, template) {
		template.$('#git_input').transition('fade left');
	},
	'click #git_input input': function (event, template) {
		event.target.select();
	},
	'click #subscribe': function (event, template) {
		_subscribe();	
	},
	'click #commit_cancel': function (event, template) {
		tmpFilesinit();
	
	},
	'click #commit': function (event, template) {
		Meteor.call('commit', {
			user_id: Meteor.userId(),
			repo: UI.getData().repo
		},
		Session.get('tmp_files'),
		function(error, result) {
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

	// _.map(tweets, function(tweet_id) {
	// 	console.log('tweet_id', tweet_id)
	// 	twttr.widgets.createTweet(
	// 		tweet_id,
	// 		document.getElementById('tweet_' + tweet_id),
	// 		{width: 400, align: 'center'}
	// 	);
	// });

	window.setTimeout(function() {
		$('#page_loader').dimmer('hide');	
	}, 1000);

	//Init
	// $('#add_dropdown').dropdown('setting', 'transition', 'fade up');
	$('#history_dropdown').dropdown('setting', 'transition', 'fade up');
	document.title = data.repo.url;
};