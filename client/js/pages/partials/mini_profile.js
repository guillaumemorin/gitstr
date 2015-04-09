Template.mini_profile.helpers({
	moment: function (date) {
		return moment(date).format('MMMM YYYY');
	}
});

Template.mini_profile.events({
	'click #repo_list': function (event, template) {
		Session.set('display', 'repositories');
	},
	'click #sub_list': function (event, template) {
		Session.set('display', 'subscription');
	},
	'click #feed_list': function (event, template) {
		Session.set('display', 'feed');
	}
});