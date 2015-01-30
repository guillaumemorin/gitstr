Router.map(function () {

	Router.configure({
		layoutTemplate: 'layout',
		notFoundTemplate: '404'
		// loadingTemplate: 'loading',
		// waitOn: function() { return Meteor.subscribe('users'); }
	});

	// Router.onBeforeAction(function () {
	// 	if (!Meteor.user()) {
	// 		Router.go('login');
	// 	}
	// 	this.next();
	// });

	this.route('home', {
		path: '/',
		onBeforeAction: function () {
			if (!Meteor.loggingIn() && !Meteor.user()) {
				Router.go('login');
			}
			this.next();
		}
		// waitOn: function() {
		// 	return Meteor.subscribe('lastpost');
		// }
	});

	this.route('login', {
		onBeforeAction: function () {
			if (Meteor.user()) {
				Router.go('/');
			}
			this.next();
		}
	});

	// this.route('/', {
	// 	template: 'home',
	// 	waitOn: function() {
	// 		return Meteor.subscribe('lastpost');
	// 	}
	// });

	// this.route('user', {
	// 	template: 'home',
	// 	path: '/post/:_id',
	// 	waitOn: function() {
	// 		return Meteor.subscribe('lastpost');
	// 	}
	// });
});