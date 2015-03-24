var fs = Npm.require('fs');

_addFolder = function (userInfo, file) {

	var repo_path = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id;

	if (!file.title) {
		throw new Meteor.Error("bad-file-info", "Something went wrong :(");
	}

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
				$set: {last_update: new Date().getTime()}
			}
		);

	} catch(e) {
		throw new Meteor.Error("addFolder-fail", "Something went wrong :(");
	}

}

_addFiles = function (userInfo, file) {

	if (!file.title || !file.size) {
		throw new Meteor.Error("bad-file-info", "Something went wrong :(");
	}

	var source = UPLOAD_PATH + '/' + userInfo.id + '/' + file.title;
	var stats = fs.lstatSync(source);

	if (!stats) {
		throw new Meteor.Error("bad-path", "Something went wrong :(");
	}
	
	var dest = REPOSITORY_PATH + '/' + userInfo.id + '/' + userInfo.repo_id + '/' + file.title;

	try {
		fs.renameSync(source, dest);

		Repos.update(
			{"_id": userInfo.repo_id},
			{
				$push: {
					file_structure: {
						$each: [{title: file.title, directory: 0, size: file.size, timestamp: new Date().getTime()}],
						$sort: {directory: -1, title: 1},
					}
				},
				$set: {last_update: new Date().getTime()}
			}
		);
	} catch(e) {
		throw new Meteor.Error("addFiles-fail", "Something went wrong :(");
	}
}