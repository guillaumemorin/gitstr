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

Accounts.onCreateUser(function(options, user) {

	var exec = Npm.require('child_process').exec, http = Npm.require('http'), fs = Npm.require('fs');
	var child, profile_image_url, profile_image, profile_image_mini, profile_screen_name;
	var user_image_path = PROFILE_IMAGE_PATH + '/' + user._id;
	var update_user_image = Meteor.bindEnvironment(function(err) {
		
		if (err) {
			throw new Meteor.Error("http.get profile image-fail", "Something went wrong :(");
		}

		Meteor.users.update(
			{_id: user._id},
			{$set: {'profile.image': 'upload/public/u/' + user._id + '/avatar.jpg'}}
		);
	});

	try {
		fs.mkdirSync(user_image_path);
	} catch(e) {
		throw new Meteor.Error("onCreateUser-fail", "Something went wrong :(");
	}

	if (user.services.twitter) {
		profile_image_url = user.services.twitter.profile_image_url;
		profile_image = profile_image_url.replace('_normal', '_400x400');
		profile_image_mini = profile_image_url.replace('_normal', '_mini');
		profile_screen_name = user.services.twitter.screenName;
	}

	if (user.services.facebook) {
	}

	if (user.services.github) {
	}

	if (profile_image) {

		var request = http.get(profile_image, function(res) {
			var imagedata = ''
			res.setEncoding('binary')

			res.on('data', function(chunk){
				imagedata += chunk
			})

			res.on('end', function() {
				fs.writeFile(user_image_path + '/avatar.jpg', imagedata, 'binary', function(err) {
					update_user_image(err);
				})
			})
		})

		var imagemagick_command = 'convert -blur 0x5 ' + profile_image + ' ' + user_image_path + '/blurred.jpg'
		child = exec(imagemagick_command, function (error, stdout, stderr) {
			// console.log('stdout: ' + stdout);
			// console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		});
	}

	if (options.profile) {
		user.profile = options.profile;	
		user.profile.image = profile_image;
		user.profile.image_blur = 'upload/public/u/' + user._id + '/blurred.jpg';
		user.profile.screen_name = profile_screen_name;
		// user.profile.image_url_mini = profile_image_mini;
	}

	return user;
});