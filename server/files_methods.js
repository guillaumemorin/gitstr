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

		_.map(files, function(file) {

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

		var files_ids_array = [];
		var samples = {};
		var set_obj = {
			last_update: new Date().getTime()
		};

		_.map(files, function(file) {

			var path = file.path.split('/');
			var url = '/upload/' + file.path;
			var cover_url = '/upload/' + path[0] + '/cover/' + path[1];

			file.url = url;
			file.cover_url = cover_url;

			var file_id = Repos_files.insert(file);
			files_ids_array.push(file_id);

			if (file.type.subtype === 'video') {
				url = cover_url = image_default;
				_preparingVideo(file, file_id);
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

		Repos.update(
			{"_id": userInfo.repo_id},
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

	_preparingVideo = function (file, file_id) {

		if (file.type.ext !== 'mp4') {
			console.log('need to convert', file.type);
		}

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
			assetsDirectory: file_id,
			size: {width: 450, height: 300},
			numThumbnails: 1,
			spritesheet: true
		}, function(error, metadata) {
			if (error) {
				throw new Meteor.Error("preparingVideo-fail", error);
			}
			_updatingVideoInfo(file, file_id); 
		});
	}

	_updatingVideoInfo = Meteor.bindEnvironment(function (file, file_id) {

			var cover_url = '/upload/' + userInfo.id + '/' + file_id + '/thumbnails.png';

			Repos_files.update(
				{_id: file_id},
				{
					$set: {
						url: '/upload/' + file.path,
						cover_url: cover_url
					}
				}
			);

			Repos.update(
				{"_id": userInfo.repo_id},
				{$set: {'samples.video': cover_url}}
			);
		}
	)

	this.save = function() {
		_writeFiles();
		_insertFilesInfo();
	}
}