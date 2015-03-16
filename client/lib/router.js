var testing = false; //Bad tricks to prevent the user undefined on direct access to /:username/:repo
Router.map(function () {

	Router.configure({
		layoutTemplate: 'layout',
		notFoundTemplate: '404',
		loadingTemplate: 'loading'
		// waitOn: function() { return Meteor.subscribe('users'); }
	});

	this.route('home', {
		path: '/',
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				Router.go('login');
			}
			this.next();
		},
		waitOn: function() {
			return [Meteor.subscribe('repos'), Meteor.subscribe('userData')];
		}
	});

	this.route('repo', {
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
			var repo = Repos.findOne({user_id: user._id, name: this.params.repo});
			if (!repo) {
				this.render('404');
				return false;	
			}
			Session.set('repo', repo);
			return repo
		},
		waitOn: function() {
			return [Meteor.subscribe('userData'), Meteor.subscribe('repos')];
		}
	});

	this.route('login', {
		onBeforeAction: function () {
			if (Meteor.user()) {
				Router.go('/');
			}
			this.next();
		}
	});
});