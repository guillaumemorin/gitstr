var fs = Npm.require('fs');
var crypto = Npm.require('crypto');

// _addFolder = function (userInfo, file) {

// 	console.log('_addFOlder');

// 	var repo_path = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id;

// 	try {
// 		fs.mkdirSync(repo_path + '/' + file.title);

// 		Repos.update(
// 			{"_id": userInfo.repo_id},
// 			{
// 				$push: {
// 					file_structure: {
// 						$each: [file],
// 						$sort: {directory: -1, title: 1},
// 					}
// 				},
// 				$set: {last_update: new Date().getTime()},
// 				$inc: {nb_folders: 1}
// 			}
// 		);

// 	} catch(e) {
// 		throw new Meteor.Error("addFolder-fail", "Something went wrong :(");
// 	}
// }


uploaded_files = function (userInfo, files) {

	if (!userInfo || !userInfo.user_id) {
		throw new Meteor.Error("files-construct-fail", "Something went wrong :(");
	}

	var upload_path = UPLOAD_PATH + '/' + userInfo.user_id + '/';
	var upload_cover_path = UPLOAD_PATH + '/' + userInfo.user_id + '/cover/';
	var repository_dest_path = REPOSITORY_PATH + '/' + userInfo.user_id + '/' + userInfo.repo._id + '/';

	_writeFiles = function () {

		_.map(files, function(file) {

			var file_md5 = crypto.createHash('md5').update(file.title).digest('hex');
			var file_ext = '.' + file.type.ext;

			var source = upload_path + file.title;
			var source_cover = upload_cover_path + file.title;
			var stats = fs.lstatSync(source);

			if (!stats) {
				throw new Meteor.Error("bad-path", "Something went wrong :(");
			}

			var dest = repository_dest_path + file.title;
			var md5_dest = upload_path + file_md5 + file_ext;
			var md5_dest_cover = upload_path + '/cover/' + file_md5 + file_ext;
			try {
				fs.writeFileSync(dest, fs.readFileSync(source));
				fs.renameSync(source, md5_dest);
				if (file.type.subtype === 'image') {
					fs.renameSync(source_cover, md5_dest_cover);	
				}
			} catch(e) {
				throw new Meteor.Error("addFiles-fail", "Something went wrong :(");
			}

		});
	}

	_insertFilesInfo =  function () {

		var inc_obj = {
			nb_image: 0,
			nb_audio: 0,
			nb_video: 0,
			nb_application: 0,
			nb_files: files.length
		}

		var files_ids_array = [];
		var samples = {};
		var set_obj = {
			last_update: new Date().getTime()
		};

		_.map(files, function(file) {

			var file_md5 = crypto.createHash('md5').update(file.title).digest('hex');
			var file_ext = '.' + file.type.ext;

			var url = (file.type.subtype === 'video') ? image_default : '/upload/' + userInfo.user_id + '/' + file_md5 + file_ext;
			var cover_url = (file.type.subtype === 'video') ? image_default : '/upload/' + userInfo.user_id + '/cover/' + file_md5 + file_ext;

			file.url = url;
			file.cover_url = cover_url;

			var file_id = Repos_files.insert(file);
			files_ids_array.push(file_id);

			if (file.type.subtype === 'video') {
				var video = new uploaded_video(userInfo, file, file_id);
				video.processing();
			}

			if (file.type.subtype === 'image') {
				set_obj['samples.image'] = cover_url;
			}

			// if (file.type.subtype === 'audio') {
			// 	samples.audio = cover_url;
			// }

			if (typeof inc_obj['nb_' + file.type.subtype] !== 'undefined') {
				inc_obj['nb_' + file.type.subtype]++;
			}
		});

		Repos_history.insert(
			{
				repo_id: userInfo.repo._id,
				repo_title:userInfo.repo.title,
				repo_screen_title:userInfo.repo.screen_title,
				repo_url:userInfo.repo.url,
				timestamp: new Date().getTime(),
				user_id: Meteor.userId(),
				user_name: Meteor.user().profile.name,
				user_screen_name: Meteor.user().profile.screen_name,
				user_profile_image: Meteor.user().profile.image,
				files: files_ids_array,
				nb_files: inc_obj.nb_files,
				nb_video: inc_obj.nb_video,
				nb_image: inc_obj.nb_image,
				nb_audio: inc_obj.nb_audio,
				nb_application: inc_obj.nb_application
			}
		);

		Repos.update(
			{"_id": userInfo.repo._id},
			{
				$push: {
					file_structure: {
						$each: files_ids_array
					}
				},
				$set: set_obj,
				$inc: inc_obj
			}
		);
	}

	this.save = function() {
		_writeFiles();
		_insertFilesInfo();
	}
}