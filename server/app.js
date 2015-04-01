// Publish //
Meteor.publish('users', function () {
	return Meteor.users.find({}, {fields: {services: 1, nb_repo: 1, nb_subscription: 1, subscription: 1, createdAt: 1, profile: 1}});
});

Meteor.publish('repos', function () {
	return Repos.find({});
});

Meteor.publish('repos_history', function () {
	return Repos_history.find({});
});

// Startup //
Meteor.startup(function () {
	
	// Upload
	UploadServer.init({
		tmpDir: UPLOAD_PATH + '/tmp',
		uploadDir: UPLOAD_PATH,
		checkCreateDirectories: true,
		getDirectory: function(fileInfo, formData) {
			return formData.id;
		},
		// imageVersions: {thumbnailBig: {width: 400, height: 300}, thumbnailSmall: {width: 200, height: 100}}
		imageVersions: {cover: {width: 450, height: 300}}
	})

	// Services
	ServiceConfiguration.configurations.upsert(
		{ service: "twitter" },
		{
			$set: {
				consumerKey: "2J7MBzXbDY6peCccGWLGnHNPD",
				loginStyle: "popup",
				secret: "7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd"
			}
		}
	);
});