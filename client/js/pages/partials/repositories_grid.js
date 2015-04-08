Template.repositories_grid.helpers({
	repoList: function () {
		
		var repos = [];
		var display = Session.get('display');
		if (display === 'repositories') {
			repos = Repos.find({user_id: Meteor.userId()});
		}

		if (display === 'subscription') {
			_.map(Meteor.user().subscription, function(id){
				repos.push(Repos.findOne({_id: id}));
			});
		}
		
		return repos;
	}
});

Template.repositories_grid.events({
	'click .subscribe': function (event, template) {

		var repo_id = event.target.dataset.id;
		var $card = template.$(event.target).parent().parent();
		$card.dimmer('show');
		window.setTimeout(function() {
			$card.transition({
				animation: 'fade right',
				onComplete : function() {
					Meteor.users.update(
						{_id: Meteor.userId()},
						{
							$pull: {subscription: repo_id},
							$inc: {nb_subscription: -1},
						}
					);

					Repos.update(
						{"_id": repo_id},
						{
							$pull: {subscribers: Meteor.userId()},
							$inc: {nb_subscribers: -1},
						}
					);	
				}
			});
		}, 1000);
	}
});