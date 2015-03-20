var git = Npm.require(process.env.NODEGIT_PATH);
var Repository = git.Repository;
var Clone = git.Clone;

var fs = Npm.require('fs');

Meteor.methods({
	search: function (search) {
		var rep = Repos.findOne({title: 'test'});
		return [rep];
		return [
			{ title: 'Andorra', url: '/', description: 'baby'},
			{ title: 'United Arab Emirates' , url: '/' , description: 'baby'},
			{ title: 'Afghanistan', url: '/'  , description: 'baby'},
			{ title: 'Antigua', url: '/'  , description: 'baby'},
			{ title: 'Anguilla', url: '/'  , description: 'baby'},
			{ title: 'Albania', url: '/'  , description: 'baby'},
			{ title: 'Armenia', url: '/'  , description: 'baby'},
			{ title: 'Netherlands Antilles' , url: '/' , description: 'baby'},
			{ title: 'Angola' , url: '/' , description: 'baby'},
			{ title: 'Argentina', url: '/'  , description: 'baby'},
			{ title: 'American Samoa' , url: '/' , description: 'baby'},
			{ title: 'Austria', url: '/'  , description: 'baby'},
			{ title: 'Australia' , url: '/' , description: 'baby'},
			{ title: 'Aruba', url: '/'  , description: 'baby'},
			{ title: 'Aland Islands', url: '/'  , description: 'baby'},
			{ title: 'Azerbaijan' , url: '/' , description: 'baby'},
			{ title: 'Bosnia' , url: '/' , description: 'baby'},
			{ title: 'Barbados' , url: '/' , description: 'baby'},
			{ title: 'Bangladesh' , url: '/' , description: 'baby'},
			{ title: 'Belgium' , url: '/' , description: 'baby'},
			{ title: 'Burkina Faso' , url: '/' , description: 'baby'},
			{ title: 'Bulgaria' , url: '/' , description: 'baby'},
			{ title: 'Bahrain', url: '/'  , description: 'baby'},
			{ title: 'Burundi', url: '/'  , description: 'baby'}
			// etc
		];
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

		for (var i = 0; i < length; i++) {
			if (files[i].directory) {
				_addFolder(userInfo, files[i]);
			} else {
				_addFiles(userInfo, files[i]);
			}
		};
		
		_commit(REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id);

	},
	openRepo: function (name) {

	// var clone = Clone.clone
	// clone("git://github.com/nodegit/nodegit", "/Users/guillaume/test_nodegit").then(function(repo) {

	// console.log('initiated');
		
	//   // Use a known commit sha from this repository.
	//   var sha = "59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5";

	//   // Look up this known commit.
	//   repo.getCommit(sha).then(function(commit) {
	//     // Look up a specific file within that commit.
	//     commit.getEntry("README.md").then(function(entry) {
	//       // Get the blob contents from the file.
	//       entry.getBlob().then(function(blob) {
	//         // Show the name, sha, and filesize in byes.
	//         console.log(entry.filename(), entry.sha(), blob.rawsize());

	//         // Show a spacer.
	//         console.log(Array(72).join("=") + "\n\n");

	//         // Show the entire file.
	//         console.log(String(blob));
	//         Meteor.publish("repo", function () {
	//           // this.ready();
	//           return [String(blob)];
	//         });
	//       });
	//     });
	//   });
	// });



		// console.log('openRepo');
		var ret = []; 
		Repository.open(path.resolve('/Users/guillaume/repo_test'))
		.then(function(repo) {
		return repo.getMasterCommit();
	})
	.then(function(firstCommitOnMaster) {
			return firstCommitOnMaster.getTree();
	})
	.then(function(tree) {
		// `walk()` returns an event.
		var walker = tree.walk();
		walker.on("entry", function(entry) {
			console.log(entry)
			console.log('>>>>', entry, entry.path(), entry.isDirectory(), entry.sha());
			ret.push(entry.path())
		});

		// Don't forget to call `start()`!
		walker.start();
	})
	.done();
		// .then(function(repoResult) {
		//     // console.log(repoResult.workdir(), repoResult,  repoResult.openIndex(), repoResult.openIndex().value());
		//     return repoResult.openIndex();
		//     // Session.set('repo', repoResult.openIndex());
		//     // Meteor.publish("repo", function () {
		//     //   // this.ready();
		//     //   return [];
		//     // });
		// })
		// return 'yoyo';
	},
	createRepo: function (name) {

	// Check argument types
	// check(comment, String);
	// check(postId, String);

// Repos.remove({});
// return;

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
				timestamp: new Date().getTime(),
				user_id: Meteor.userId(),
				url: '/' + repo_path,
				description: 'By ' + Meteor.user().profile.name,
				permalink: service_url + repo_path,
				permaGit: service_git + repo_path,
				file_structure: []
			});
		// })

		Meteor.users.update(
			{_id: Meteor.userId()},
			{$inc: {repo_counter: 1}}
		);

		Repository.init(REPOSITORY_PATH + '/' + this.userId + '/' + insert_id, 0)
		.catch(function(err) {
			console.log('catched', err);
		})
		.done(function(error) {
			// done_callback()
			console.log('done');
		})

		return 'Pending...';
	}
});