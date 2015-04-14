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