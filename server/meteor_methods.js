var fs = Npm.require('fs');

Meteor.methods({
	
	search: function (search) {
		var ret = [];
		Repos.find({title: {$regex: search}}).forEach(function(doc) {
			ret.push(doc);
		});

		return ret;
	},

	commit: function (userInfo, files) {

		if (!userInfo || !userInfo.id || !userInfo.repo_id) {
			throw new Meteor.Error("bad-user-info", "Something went wrong :(");
		}

		if (userInfo.id !== Meteor.userId()) {
			throw new Meteor.Error("bad-user-info", "Nice try ;)");
		}

		var length = files.length;
		if (!files || length === 0) {
			throw new Meteor.Error("bad-files-info", "Something went wrong :(");
		}

		var files = new uploaded_files(userInfo, files);
		files.save();

		var repo = new repository(REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id);
		repo.commit(length, Meteor.user().profile)
		.then(function(commit_id) {
			console.log('commit: ', commit_id);
		});

	},

	createRepo: function (name) {

	// Check argument types
	// check(comment, String);
	// check(postId, String);

		var getDefaultRadient = function() {
			var deg = Math.floor((Math.random() * 200) + 1);
			var percent1 = Math.floor((Math.random() * 100) + 1);
			var percent2 = 100 - percent1;

			var colors = ['#94e5e1', ' #f4a8a8'];
			return {gradient: colors[Math.floor(Math.random()*colors.length)]}
			return {gradient: {percent1: percent1, percent2: percent2, deg: deg}};
		}


		if (!this.userId) {
			throw new Meteor.Error("not-logged-in", "Must be logged in to post a comment.");
		}

		var repo_name = Repos.findOne({title: name, user_id: Meteor.userId()});
		if (repo_name) {
			throw new Meteor.Error("repo-already-exists", "This name already exists");
		}

		var screen_name = name.split(' ').join('-');
		var repo_path = encodeURIComponent(Meteor.user().profile.screen_name) + '/' + encodeURIComponent(screen_name);
		var repo_path_git = 'public/' + repo_path;
		var gradient =  getDefaultRadient();
		var insert_id = Repos.insert({
			title: name,
			screen_title: screen_name,
			created_at: new Date().getTime(),
			user_id: Meteor.userId(),
			user_name: Meteor.user().profile.name,
			user_screen_name: Meteor.user().profile.screen_name,
			user_profile_image: Meteor.user().profile.image,
			url: '/' + repo_path,
			description: 'By ' + Meteor.user().profile.name,
			permalink: service_url + repo_path,
			permaGit: service_git + repo_path_git,
			file_structure: [],
			samples: {
				image:getDefaultRadient(),
				video: getDefaultRadient(),
				audio: getDefaultRadient(),
				application: getDefaultRadient()
			}
		});
	
		fs.symlink(
			REPOSITORY_PATH + '/' + this.userId + '/' + insert_id,
			HOME_PATH + '/public/' + Meteor.user().profile.screen_name + '/' + name.split(' ').join('-')
		);

		Meteor.users.update(
			{_id: Meteor.userId()},
			{$inc: {nb_repo: 1}}
		);

		var repo = new repository(REPOSITORY_PATH + '/' + this.userId + '/' + insert_id);
		repo.init();

		return 'Pending...';
	}
});