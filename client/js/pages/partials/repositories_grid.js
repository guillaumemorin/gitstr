Template.repositories_grid.helpers({
	repoList: function () {
		var data = UI.getData();
		var list = data.repo;
		var display = data.display;

		if (!data.repo.count() && display === 'sub') {
			list = Repos.find({user_id: { $not: Meteor.userId()}}, {limit: 50});
		}
		return list;
	}
});

Template.repositories_grid.events({
	'click .subscribe': function (event, template) {

		if (!Meteor.user()) {
			$('#signin')
				.modal('setting', 'transition', 'fade up')
				.modal('show');
			return;
		}

		var repo_id = event.target.dataset.id;
		var repo = Repos.findOne({_id: repo_id}, {fields: {subscribers: 1}});
		var subscribers = repo.subscribers;

		if (~_.indexOf(subscribers, Meteor.userId())) {

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
			return;
		}

		Meteor.users.update(
			{_id: Meteor.userId()},
			{
				$addToSet: {subscription: repo_id},
				$inc: {nb_subscription: 1},
			}
		);

		Repos.update(
			{"_id": repo_id},
			{
				$addToSet: {subscribers: Meteor.userId()},
				$inc: {nb_subscribers: 1},
			}
		);
	}
});