var path = Npm.require('path');

// Publish //
Meteor.publish('users', function () {
	return Meteor.users.find({}, {fields: {'services': 1, 'repo_counter': 1}});
});

Meteor.publish('repos', function () {
	return Repos.find({});
});

// Startup //
Meteor.startup(function () {
	
	// Upload
	UploadServer.init({
		tmpDir: path.resolve(process.env.PWD + '/../uploads/tmp'),
		uploadDir: path.resolve(process.env.PWD + '/../uploads/'),
		checkCreateDirectories: true,
		getDirectory: function(fileInfo, formData) {
			return formData.id;
		},
	})

	// Services
	Accounts.loginServiceConfiguration.insert({
		service: 'twitter',
		consumerKey: '2J7MBzXbDY6peCccGWLGnHNPD',
		secret: '7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd'
	});
});