if (Meteor.isClient) {

var name = 'Git4All';

Template.login.events({
	'click .btn-info': function () {
		Meteor.loginWithTwitter({}, function() {});
	},

	'click .btn-primary': function () {
		Meteor.loginWithTwitter({}, function() {});
	}
});

// Render
Template.login.rendered = function () {
	document.title = name + ' / login'
};

// Render
Template.home.rendered = function () {
	document.title = name
};

}