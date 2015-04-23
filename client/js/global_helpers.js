// Global Helpers
Template.registerHelper('equal', function(a, b) {
	return a === b;
});

Template.registerHelper('greater', function(a, b) {
	return a > b;
});

Template.registerHelper('setLastUpdate', function(timestamp) {
	if (!timestamp) {
		return '';
	}
	return moment(timestamp).fromNow();
});

Template.registerHelper('isOwner', function(repo_owner_id) {
	console.log(repo_owner_id, Meteor.userId());
	return repo_owner_id === Meteor.userId();
});

Template.registerHelper('subscribed', function(subscriber) {
	return ~_.indexOf(subscriber, Meteor.userId());
});

Template.registerHelper('moment', function(date) {
	return moment(date).format('MMMM YYYY');
});

Template.registerHelper('defaultImage', function(date) {

	var deg = Math.floor((Math.random() * 200) + 1);
	var percent = Math.floor((Math.random() * 100) + 1);
	var percent2 = 100 - percent;

	return 'linear-gradient(' + deg + 'deg, #f4a8a8, #94e5e1)';
});

