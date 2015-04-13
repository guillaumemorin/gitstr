var fs = Npm.require('fs');
var thumbgen = Npm.require(THUMBGEN_PATH);
var fluent_ffmpeg = Npm.require(FLUENT_FFMPEG_PATH);

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

	if (!userInfo || !userInfo.id) {
		throw new Meteor.Error("files-construct-fail", "Something went wrong :(");
	}

	var source_path = UPLOAD_PATH + '/' + userInfo.id + '/';
	var dest_path = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id + '/';
	var thumbgen_output = UPLOAD_PATH + '/' + userInfo.id + '/thumbgen.vtt';

	_writeFiles = function () {

		_.map(files, function(file, index) {

			var source = source_path + file.title;
			var stats = fs.lstatSync(source);

			if (!stats) {
				throw new Meteor.Error("bad-path", "Something went wrong :(");
			}

			var dest = dest_path + file.title;
			try {
				fs.writeFileSync(dest, fs.readFileSync(source));
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
			nb_text: 0,
			nb_files: files.length
		}

		_.map(files, function(file, index) {
			// NEDD TO MODIFY FILES DIRECTLY

			var path = file.path.split('/');
			var url = '/upload/' + file.path;
			var cover_url = '/upload/' + path[0] + '/cover/' + path[1];
			
			if (file.type.subtype === 'video') {
				url = cover_url = image_default;
				_preparingVideo(file);
			}

			files[index].url = url;
			files[index].cover_url = cover_url;

			if (typeof inc_obj['nb_' + file.type.subtype] !== 'undefined') {
				inc_obj['nb_' + file.type.subtype]++;
			}
		});

		Repos.update(
			{"_id": userInfo.repo_id},
			{
				$push: {
					file_structure: {
						$each: files,
						$sort: {timestamp: -1, title: 1},
					}
				},
				$set: {last_update: new Date().getTime()},
				$inc: inc_obj
			}
		);
	}

	_preparingVideo = function (file) {

		// Converting to mp4
		// ffmpeg('/path/to/file.avi')
		//   .output('outputfile.mp4')
		//   .output(stream)
		//   .on('end', function() {
		//     console.log('Finished processing');
		//   })
		//   .run();

		// Generating thumbnail
		var source = source_path + file.title;
		thumbgen(source, {
			output: thumbgen_output,
			size: {width: 480},
			numThumbnails: 1,
			spritesheet: true
		}, function(error, metadata) {
			if (error) {
				throw new Meteor.Error("preparingVideo-fail", error);
			}
			_updatingVideoInfo(file); 
		});
	}

	_updatingVideoInfo = Meteor.bindEnvironment(function (file) {

			var repo = Repos.findOne(
				{"_id": userInfo.repo_id},
				{fields: {file_structure: 1}}
			);

			repo.file_structure.forEach(function(file_info, index) {
				if (file.title === file_info.title && file.timestamp === file_info.timestamp) {
					var name = file_info.title.split('.');
					repo.file_structure[index].cover_url = '/upload/' + userInfo.id + '/' + name[0] + '/thumbnails.png';
					repo.file_structure[index].url = '/upload/' + file_info.path;
					console.log('updated');
				}
			});

			Repos.update(
				{_id: userInfo.repo_id},
				{$set: {file_structure: repo.file_structure}}
			);
		}
	)

	this.save = function() {
		_writeFiles();
		_insertFilesInfo();
	}
}