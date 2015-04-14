var testing = false; //Bad tricks to prevent the user undefined on direct access to /:username/:repo
var testing_repo = false;

Router.map(function () {

	Router.configure({
		notFoundTemplate: '404'
		// waitOn: function() { return Meteor.subscribe('users'); }
	});

	this.route('home', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:home_path_or_username?',
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos')];
		},
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				this.render('login');
				return;
			}
			this.next();
		},
		data: function () {

			var allowed_path = ['feed', 'rep', 'sub'];
			var user = Meteor.users.findOne({'profile.screen_name': this.params.home_path_or_username});
			var repos = [];
			
			if (!user) {
				if (!testing) {
					testing = true;
					return;
				}

				var type = this.params.home_path_or_username || 'feed';
				if (!~allowed_path.indexOf(type)) {
					this.render('404');
					return;
				}

				if (type === 'rep') {
					repos = Repos.find({user_id: Meteor.userId()});
				}

				if (type === 'sub') {
					_.map(Meteor.user().subscription, function(id){
						repos.push(Repos.findOne({_id: id}));
					});
				}

				return {repo: repos, display: type};
			}

			this.redirect('/' + user.profile.screen_name + '/rep');
		
		},
	});

	// this.route('profile', {
	// 	layoutTemplate: 'layout',
	// 	loadingTemplate: 'loading',
	// 	path: '/:username/:home_path_or_username?',
	// 	data: function () {

	// 		var type = this.params.home_path_or_username || 'rep';
	// 		var user = Meteor.users.findOne({'profile.screen_name': this.params.username});
	// 		var repos = [];

	// 		if (!user) {
	// 			if (!testing) {
	// 				testing = true;
	// 				return;
	// 			}
	// 			this.render('404');
	// 			return;
	// 		}

	// 		var repo = Repos.findOne({user_id: user._id, title: this.params.repo});

	// 		if (!repo) {
	// 			if (!testing_repo) {
	// 				testing_repo = true;
	// 				return;
	// 			}

	// 			if (type === 'rep') {
	// 				repos = Repos.find({user_id: Meteor.userId()});
	// 				return {repo: repos, user: user, display: type};
	// 			}

	// 			if (type === 'sub') {
	// 				_.map(user.subscription, function(id){
	// 					repos.push(Repos.findOne({_id: id}));
	// 				});
	// 				return {repo: repos, user: user, display: type};
	// 			}

	// 			this.render('404');
	// 			return;
	// 		}

	// 		Router.go('/' + this.params.username + '/' + repo);
	// 		return;

	// 	},

	// 	waitOn: function() {
	// 		return Meteor.subscribe('users');
	// 	}
	// });

	this.route('repo', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:username/:repo_name_or_user_section/:filter_type?',
		data: function () {

			var username_subpath = this.params.repo_name_or_user_section;
			var user = Meteor.users.findOne({'profile.screen_name': this.params.username});
			var repos = [];

			if (!user) {
				if (!testing) {
					testing = true;
					return;
				}
				this.render('404');
				return;
			}
			var repo = Repos.findOne({user_id: user._id, title: username_subpath});
			if (!repo) {
				if (!testing_repo) {
					testing_repo = true;
					return;
				}

				if (username_subpath === 'rep') {
					repos = Repos.find({user_id: user._id});
					console.log({repo: repos, user: user, display: username_subpath});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath}});
					return;
				}

				if (username_subpath === 'sub') {
					_.map(user.subscription, function(id){
						repos.push(Repos.findOne({_id: id}));
					});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath}});
					return;
				}

				this.render('404');
				return;	
			}

			var history;
			//  = Repos_history.findOne({user_id: user._id});
			// if (!history) {
			// 	console.log('render 404');
			// 	this.render('404');
			// 	return;	
			// }

			return {repo: repo, user: user, repo_history: history, filter_type: this.params.filter_type}
		},
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos'), Meteor.subscribe('repos_history')];
		}
	});
});