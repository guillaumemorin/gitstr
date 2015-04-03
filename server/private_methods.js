var fs = Npm.require('fs');
var thumbgen = Npm.require(THUMBGEN_PATH);

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

_writeFiles = function (userInfo, file) {

	var source = UPLOAD_PATH + '/' + userInfo.id + '/' + file.title;
	var stats = fs.lstatSync(source);

	if (!stats) {
		throw new Meteor.Error("bad-path", "Something went wrong :(");
	}
	
	var dest = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id + '/' + file.title;

	try {
		fs.writeFileSync(dest, fs.readFileSync(source));

		if (file.type.subtype === 'video') {

			console.log('THUMB UP DUDE :)');


thumbgen(source, {
  output: UPLOAD_PATH + '/' + userInfo.id + '/Hammer.of.the.Gods.2013.BluRay.720p.vtt',
  size:            {
    width: 480
  },
  numThumbnails:   1,
  spritesheet:     true
}, function(err, metadata) {
  if (err) {
    throw err
  }

  console.dir(metadata)
})
		}

	} catch(e) {
		throw new Meteor.Error("addFiles-fail", "Something went wrong :(");
	}
}

_insertFilesInfo =  Meteor.bindEnvironment(function (repo_id, files) {

	var inc_obj = {
		nb_image: 0,
		nb_audio: 0,
		nb_video: 0,
		nb_application: 0,
		nb_text: 0,
		nb_files: files.length
	}

	_.map(files, function(file) {
		if (typeof inc_obj['nb_' + file.type.subtype] !== 'undefined') {
			inc_obj['nb_' + file.type.subtype]++;
		}
	});

	Repos.update(
		{"_id": repo_id},
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
});