service_url = 'http://gitstr.com/';
service_git = 'git@gitstr.com:';
image_404 = '/noun_25237_cc.png';

// Db
Repos = new Mongo.Collection("repo");
Repos_history = new Mongo.Collection("repo_history");

// DB Update allowed
Meteor.users.allow({
	update: function (userId, user, fields, modifier) {
		return (user._id === userId);
	}
});

Repos.allow({
	update: function (userId, repo, fields, modifier) {
		if (~_.indexOf(fields, 'subscribers')) {
			var user = Meteor.users.findOne({_id: userId}, {fields: {subscription: 1}})
			
			// Add
			if (modifier['$addToSet'] && !~_.indexOf(user.subscription, repo._id)) {
				return false;	
			}

			// Remove
			if (modifier['$pull'] && ~_.indexOf(user.subscription, repo._id)) {
				return false;
			}

			return true;
		}

		return false;
	}
});
