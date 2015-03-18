Template.header.events({
  'click #logout': function (event, template) {
    Meteor.logout();
    Router.go('/');
  }
});

Template.header.events({
	'keypress #search': function (event, template) {
		Meteor.call('search', event.target.value, function(error, result) {
			console.log(result);
			$('#search')
			.search({
				source: result,
				searchFields: ['title']
			})
		})
	}
});