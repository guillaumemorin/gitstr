Router.map(function () {

	Router.configure({
		notFoundTemplate: '404'
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

			if(!this.ready()){
				return;
            }

			var allowed_path = ['feed', 'rep', 'sub'];
			var repos;

			var user = Meteor.users.findOne({'profile.screen_name': this.params.home_path_or_username});
			if (!user) {
			
				var type = this.params.home_path_or_username || 'feed';
				if (!~allowed_path.indexOf(type)) {
					this.render('404');
					return;
				}

				if (type === 'rep') {
					repos = Repos.find({user_id: Meteor.userId()}, {sort:{created_at: -1}});
				}

				if (type === 'sub') {
					repos = Repos.find({_id: {$in: Meteor.user().subscription}});
				}

				return {repo: repos, display: type};
			}

			this.redirect('/' + user.profile.screen_name + '/rep');
		}
	});

	this.route('repo', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:username/:repo_name_or_user_section/:filter_type?',
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos'), Meteor.subscribe('repos_history'), Meteor.subscribe('repos_files')];
		},
		data: function () {

			if(!this.ready()){
				return;
            }

			var username_subpath = this.params.repo_name_or_user_section;
			var repos;

			var user = Meteor.users.findOne({'profile.screen_name': this.params.username});
			if (!user) {
				this.render('404', {data: {error: 'no_user'}});
				return;
			}

			var repo = Repos.findOne({user_id: user._id, title: username_subpath});
			if (!repo) {

				if (username_subpath === 'rep') {
					repos = Repos.find({user_id: user._id}, {sort:{created_at: -1}});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath}});
					return;
				}

				if (username_subpath === 'sub') {
					repos = Repos.find({_id: {$in: Meteor.user().subscription}});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath}});
					return;
				}

				this.render('404', {data: {error: 'no_repo'}});
				return;
			}

			var files = Repos_files.find(
				{_id: {$in: repo.file_structure}}
			);

			var history;
			//  = Repos_history.findOne({user_id: user._id});
			// if (!history) {
			// 	console.log('render 404');
			// 	this.render('404');
			// 	return;	
			// }

			return {repo: repo, user: user, history: history, files: files, filter_type: this.params.filter_type}
		}
	});
});