Template.header.events({
	'keypress #search': function (event, template) {
		Meteor.call('search', event.target.value, function(error, result) {
			$('#search')
			.search({
				source: result,
				searchFields: ['title']
			})
		})
	},
	'click #logout': function (event, template) {
		Meteor.logout();
		Router.go('/');
	}
});