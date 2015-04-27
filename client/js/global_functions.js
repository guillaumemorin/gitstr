_subscribe = function() { 
	if (!Meteor.user()) {
		$('#signin_modal').modal('show');
		return;
	}

	var repo_id = Session.get('repo_id');
	var repo = Repos.findOne({_id: repo_id}, {fields: {subscribers: 1}});
	var subscribers = repo.subscribers;
	console.log(repo_id, subscribers);
	var inc = 1;
	var action = '$addToSet';
	var action_obj = {};

	if (~_.indexOf(subscribers, Meteor.userId())) {
		action = '$pull';
		inc = -1;
	}

	action_obj[action] = {subscription: repo_id};
	action_obj['$inc'] = {nb_subscription: inc};

	Meteor.users.update(
		{_id: Meteor.userId()},
		action_obj
	);

	action_obj[action] = {subscribers: Meteor.userId()};
	action_obj['$inc'] = {nb_subscribers: inc};

	Repos.update(
		{"_id": repo_id},
		action_obj
	);
}
