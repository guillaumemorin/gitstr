var fs = Npm.require('fs');

_addFolder = function (userInfo, file) {

	console.log('_addFOlder');

	var repo_path = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id;

	try {
		fs.mkdirSync(repo_path + '/' + file.title);

		Repos.update(
			{"_id": userInfo.repo_id},
			{
				$push: {
					file_structure: {
						$each: [file],
						$sort: {directory: -1, title: 1},
					}
				},
				$set: {last_update: new Date().getTime()},
				$inc: {nb_folders: 1}
			}
		);

	} catch(e) {
		throw new Meteor.Error("addFolder-fail", "Something went wrong :(");
	}
}

_addFiles = function (userInfo, file_name) {

	var source = UPLOAD_PATH + '/' + userInfo.id + '/' + file_name;
	var stats = fs.lstatSync(source);

	if (!stats) {
		throw new Meteor.Error("bad-path", "Something went wrong :(");
	}
	
	var dest = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id + '/' + file_name;

	try {
		// fs.renameSync(source, dest);
		fs.writeFileSync(dest, fs.readFileSync(source));
	} catch(e) {
		throw new Meteor.Error("addFiles-fail", "Something went wrong :(");
	}
}

_addCallback = function (repo_id, file) {

	if (!file.title) {
		throw new Meteor.Error("bad-file-info", "Something went wrong :(");
	}

	console.log('tttt', repo_id, file);

	// if (!file.title || !file.size) {
	// 	throw new Meteor.Error("bad-file-info", "Something went wrong :(");
	// }

	try {

		console.log(Repos);

		

	} catch(e) {
		console.log('error', e);
		// throw new Meteor.Error("addFolder-fail", "Something went wrong :(");
	}
}