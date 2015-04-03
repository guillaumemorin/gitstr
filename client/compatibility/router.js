var testing = false; //Bad tricks to prevent the user undefined on direct access to /:username/:repo
var testing_repo = false;

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
				this.render('login');
				return;
			}
			this.next();
		}
	});

	this.route('repo', {
		layoutTemplate: 'layout',
		loadingTemplate: 'loading',
		path: '/:username/:repo/:filter_type?',
		data: function () {

			var user = Meteor.users.findOne({'services.twitter.screenName': this.params.username});
			if (!user) {
				if (!testing) {
					testing = true;
					return;
				}
				this.render('404');
				return;
			}
			var repo = Repos.findOne({user_id: user._id, title: this.params.repo});
			if (!repo) {
				if (!testing_repo) {
					testing_repo = true;
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