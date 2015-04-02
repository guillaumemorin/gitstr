var testing = false; //Bad tricks to prevent the user undefined on direct access to /:username/:repo
var testing_repo = false;

Router.map(function () {

	Router.configure({
		notFoundTemplate: '404'
		// waitOn: function() { return Meteor.subscribe('users'); }
	});

	this.route('home', {
		layoutTemplate: 'layout',
		path: '/:item?',
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos')];
		},
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				Router.go('login');
			}
			this.next();
		},
		data: function () {

			var repos = [];
			if (this.params.item === 'rep') {
				repos = Repos.find({user_id: Meteor.userId()});
			}

			if (this.params.item === 'sub') {
				console.log(Meteor.user());
				var user = Meteor.user();
				if (!user) {
					if (!testing) {
						testing = true;
						return false;
					}
					this.render('404');
					return false;
				}
				_.map(user.subscription, function(id){
					repos.push(Repos.findOne({_id: id}));
				});
			}
			
			return {user: Meteor.user(), repos: repos}
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
					return false;
				}
				this.render('404');
				return false;
			}
			var repo = Repos.findOne({user_id: user._id, title: this.params.repo});
			if (!repo) {
				if (!testing_repo) {
					testing_repo = true;
					return false;
				}
				this.render('404');
				return false;	
			}

			var history;
			//  = Repos_history.findOne({user_id: user._id});
			// if (!history) {
			// 	console.log('render 404');
			// 	this.render('404');
			// 	return false;	
			// }

			return {repo: repo, user: user, repo_history: history, filter_type: this.params.filter_type}
		},
		waitOn: function() {
			return [Meteor.subscribe('users'), Meteor.subscribe('repos'), Meteor.subscribe('repos_history')];
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