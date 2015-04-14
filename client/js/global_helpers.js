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
	return repo_owner_id === Meteor.userId();
});

Template.registerHelper('subscribed', function(subscriber) {
	return ~_.indexOf(subscriber, Meteor.userId());
});

Template.registerHelper('moment', function(date) {
	return moment(date).format('MMMM YYYY');
});
