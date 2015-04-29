// Publish //
Meteor.publish('users', function () {
	return Meteor.users.find({}, {fields: {nb_repo: 1, nb_subscription: 1, subscription: 1, createdAt: 1, profile: 1}});
});

Meteor.publish('repos', function () {
	return Repos.find({});
});

Meteor.publish('repos_history', function () {
	return Repos_history.find({});
});

Meteor.publish('repos_files', function () {
	return Repos_files.find({});
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
	var platform = (process.env.PLATFORM) ? process.env.PLATFORM : 'PROD';
	ServiceConfiguration.configurations.upsert(
		{ service: "twitter" },
		tokens.twitter[platform]
	);

	ServiceConfiguration.configurations.upsert(
		{ service: "github" },
		tokens.github[platform]
	);

	ServiceConfiguration.configurations.upsert(
		{ service: "facebook" },
		tokens.facebook[platform]
	);
});

Accounts.onLogin(function(options, user) {
	loggly.log(options);
});

Accounts.onCreateUser(function(options, user) {

	var exec = Npm.require('child_process').exec, https = Npm.require('https'), fs = Npm.require('fs');
	var child, profile_image_url, profile_image, profile_image_mini, profile_screen_name;
	var user_image_path = PROFILE_IMAGE_PATH + '/' + user._id;
	
	var update_user_image = Meteor.bindEnvironment(function(err) {
		
		if (err) {
			throw new Meteor.Error("http.get profile image-fail", "Something went wrong :(");
		}

		Meteor.users.update(
			{_id: user._id},
			{
				$set: {
					'profile.image': '/upload/public/u/' + user._id + '/avatar.jpg',
					'profile.image_blur': '/upload/public/u/' + user._id + '/blurred.jpg'
				}
			}
		);
	});

	var get_user_image = function(url) {
		https.get(url, function(res) {
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

		/** IMAGE BLUR **/
		/** ERROR WITH FB URL **/

		// var imagemagick_command = 'convert -blur 0x5 ' + profile_image + ' ' + user_image_path + '/blurred.jpg'
		// child = exec(imagemagick_command, function (error, stdout, stderr) {
		// 	// console.log('stdout: ' + stdout);
		// 	// console.log('stderr: ' + stderr);
		// 	if (error !== null) {
		// 		console.log('exec error: ' + error);
		// 	}
		// });
	}

	var get_redirect_url = function(url) {
		return new Promise(function(resolve, reject) {
			https.get(url, function(res) {
				if (res.headers && res.headers.location) {
					resolve(res.headers.location);
				}
				res.on('end', function() {
					if (res.statusCode >= 300 && res.statusCode < 400 && res.headers && res.headers.location) {
						resolve(res.headers.location);
					}
				})
			})
		});
	}

	try {
		fs.mkdirSync(user_image_path);
	} catch(e) {
		throw new Meteor.Error("onCreateUser-fail", "Something went wrong :(");
	}

	if (user.services.facebook) {
		profile_image = 'https://graph.facebook.com/' + user.services.facebook.id + '/picture?width=640&height=640';
		var profile_name = user.services.facebook.name;
		profile_screen_name = user.services.facebook.name.split(' ').join('_');	

		var users_count = Meteor.users.find({'profile.screen_name': user.services.facebook.name}).count(); 
		if (users_count) {
			profile_screen_name = profile_screen_name + (users_count + 1);
		}

		get_redirect_url(profile_image)
		.then(function(redirect_url) {
			get_user_image(redirect_url);
		})
	} else {

		if (user.services.twitter) {
			profile_image_url = user.services.twitter.profile_image_url_https;
			profile_image = profile_image_url.replace('_normal', '_400x400');
			profile_image_mini = profile_image_url.replace('_normal', '_mini');
			profile_screen_name = user.services.twitter.screenName;
			var users_count = Meteor.users.find({'profile.screen_name': user.services.twitter.screenName}).count(); 
			if (users_count) {
				profile_screen_name = profile_screen_name + (users_count + 1);
			}
		}

		if (user.services.github) {
			profile_image = 'https://avatars1.githubusercontent.com/u/' + user.services.github.id;
			var profile_name = user.services.github.username;
			profile_screen_name = user.services.github.username.split(' ').join('_');
	
			var users_count = Meteor.users.find({'profile.screen_name': user.services.github.username}).count(); 
			if (users_count) {
				profile_screen_name = profile_screen_name + (users_count + 1);
			}
		}

		get_user_image(profile_image);

	}

	if (options.profile) {
		user.profile = options.profile;	
		user.profile.image = profile_image;
		user.profile.screen_name = profile_screen_name;
		
		if (profile_name) {
			user.profile.name = profile_name;
		}
		// user.profile.image_url_mini = profile_image_mini;
	}

	user.subscription = [];

	try {
		fs.mkdirSync(HOME_PATH + '/public/' + profile_screen_name);
	} catch(e) {
		throw new Meteor.Error("onCreateUser-fail", "Something went wrong :(");
	}

	return user;
});