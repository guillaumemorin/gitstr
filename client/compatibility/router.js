var testing = false; //Bad tricks to prevent the user undefined on direct access to /:username/:repo
Router.map(function () {

	Router.configure({
		notFoundTemplate: '404'
		// waitOn: function() { return Meteor.subscribe('users'); }
	});

	this.route('home', {
		layoutTemplate: 'layout',
		path: '/',
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos')];
		},
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				Router.go('login');
			}
			this.next();
		}
	});

	this.route('repo', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:username/:repo',
		data: function () {
			var user = Meteor.users.findOne({'services.twitter.screenName': this.params.username});
			console.log('user', user);
			if (!user) {
				if (!testing) {
					testing = true;
					return false;
				}
				this.render('404');
				return false;
			}
			var repo = Repos.findOne({user_id: user._id, title: this.params.repo});
			if (!repo) {
				this.render('404');
				return false;	
			}

			var file_length = repo.file_structure.length;
			var nb_folder = 0, nb_files = 0;
			for (var i = 0; i < file_length; i++) {
				if (repo.file_structure[i].directory) {
					nb_folder = nb_folder + 1;
				} else {
					nb_files = nb_files + 1;
				}
			}
			
			repo.nb_folder = nb_folder;
			repo.nb_files = nb_files;

			return repo
		},
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos')];
		}
	});

	this.route('login', {
		layoutTemplate: 'login',
		onBeforeAction: function () {
			if (Meteor.user()) {
				Router.go('/');
			}
			this.next();
		}
	});
});