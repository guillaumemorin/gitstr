Router.map(function () {

	Router.configure({
		notFoundTemplate: '404',
		waitOn: function() {
			return [
				Meteor.subscribe('users'),
				Meteor.subscribe('repos'),
				Meteor.subscribe('repos_history'),
				Meteor.subscribe('repos_files')
			];
		}
	});

	this.route('explore', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/explore',
		data: function () {

			if(!this.ready()){
				return;
            }

            var selector_obj = {};
            if (Meteor.user()) {
            	selector_obj = {user_id: { $not: Meteor.userId()}};
            }

            var repos = Repos.find(
            	selector_obj,
            	{limit: 50}
            );

            return {repo: repos, display: 'explore'};
		}
	});

	this.route('home', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:home_path_or_username?',
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				this.render('login');
				return;
			}

			if (!Repos.findOne({user_id: Meteor.userId()})) {
				Router.go('/rep');
			}

			this.next();
		},
		data: function () {

			if(!this.ready()){
				return;
            }

			var allowed_path = ['feed', 'rep', 'sub'];
			var repos, history;

			var user = Meteor.users.findOne({'profile.screen_name': this.params.home_path_or_username});
			if (!user) {
			
				var type = this.params.home_path_or_username || 'feed';
				if (!~allowed_path.indexOf(type)) {
					this.render('404');
					return;
				}

				var subscription = (Meteor.user() && Meteor.user().subscription) ? Meteor.user().subscription : [];

				if (type === 'rep') {
					repos = Repos.find({user_id: Meteor.userId()}, {sort:{created_at: -1}});
				}

				if (type === 'sub') {
					repos = Repos.find({_id: {$in: subscription}});
				}

				if (type === 'feed') {
					history = Repos_history.find(
						{repo_id: {$in: subscription}},
						{sort: {timestamp: -1}}
					);
				}

				return {repo: repos, display: type, history: history};
			}

			this.redirect('/' + user.profile.screen_name + '/rep');
		}
	});

	this.route('repo', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:username/:repo_name_or_user_section/:filter_type?',
		data: function () {

			if(!this.ready()){
				return;
            }

			var filter = this.params.filter_type || 'all';
            Session.set('filter', filter);

			var username_subpath = this.params.repo_name_or_user_section;
			var repos;

			var user = Meteor.users.findOne({'profile.screen_name': this.params.username});
			if (!user) {
				this.render('404', {data: {error: 'no_user'}});
				return;
			}

			var repo = Repos.findOne({user_id: user._id, screen_title: username_subpath});
			if (!repo) {

				if (username_subpath === 'rep') {
					repos = Repos.find({user_id: user._id}, {sort:{created_at: -1}});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath, default_image_size: 'default-small'}});
					return;
				}

				if (username_subpath === 'sub') {
					var subscription = (user.subscription) ? user.subscription : [];
					repos = Repos.find({_id: {$in: subscription}});
					this.render('profile', {data: {repo: repos, user: user, display: username_subpath, default_image_size: 'default-small'}});
					return;
				}

				this.render('404', {data: {error: 'no_repo'}});
				return;
			}

			var files = Repos_files.find(
				{_id: {$in: repo.file_structure}},
				{sort: {timestamp: -1}}
			);

			var history = Repos_history.find(
				{
					user_id: user._id,
					repo_id: repo._id
				},
				{sort: {timestamp: -1}, limit: 5}
			);

			return {repo: repo, user: user, history: history, files: files}
		}
	});
});