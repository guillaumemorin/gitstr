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

		_.map(files, function(file) {
			_writeFiles(userInfo, file);
		});

		_insertFilesInfo(userInfo.repo_id, files);

		var repo = new repository(REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id);
		repo.commit(files.length, Meteor.user().profile)
		.then(function(commit_id) {
			console.log('commit: ', commit_id);
		});

	},

	createRepo: function (name) {

	// Check argument types
	// check(comment, String);
	// check(postId, String);

		if (!this.userId) {
			throw new Meteor.Error("not-logged-in", "Must be logged in to post a comment.");
		}

		var repo_name = Repos.findOne({title: name});
		if (repo_name) {
			throw new Meteor.Error("repo-already-exists", "This name already exists");
		}

		// var error_callback = function() {
		//   throw new Meteor.Error("repo-init-failed", "Something went wrong :(");
		// };
		
		// var done_callback = Meteor.bindEnvironment(function(err) {
			var repo_path = Meteor.user().services.twitter.screenName + '/' + name
			var insert_id = Repos.insert({
				title: name,
				created_at: new Date().getTime(),
				user_id: Meteor.userId(),
				user_name: Meteor.user().profile.name,
				user_profile_image_url: Meteor.user().services.twitter.profile_image_url,
				url: '/' + repo_path,
				description: 'By ' + Meteor.user().profile.name,
				permalink: service_url + repo_path,
				permaGit: service_git + repo_path,
				file_structure: []
			});
		// })

		Meteor.users.update(
			{_id: Meteor.userId()},
			{$inc: {nb_repo: 1}}
		);

		var test = new repository(REPOSITORY_PATH + '/' + this.userId + '/' + insert_id);
		test.init(function() {
			console.log('resolved');
		}, function() {
			console.log('rejected');
		});

		// Repository.init(REPOSITORY_PATH + '/' + this.userId + '/' + insert_id, 0)
		// .catch(function(err) {
		// 	console.log('catched', err);
		// })
		// .done(function(error) {
		// 	// done_callback()
		// 	console.log('done');
		// })

		return 'Pending...';
	}
});