var thumbgen = Npm.require(THUMBGEN_PATH);
var ffmpeg = Npm.require(FLUENT_FFMPEG_PATH);

uploaded_video = function (userInfo, file, file_id) {

	this.processing = function() {
		convertToMp4()
		.then(function() {
			generateThumbnail();
		})
	}

	var source = UPLOAD_PATH + userInfo.id + '/' + file.title;

	var convertToMp4 = function() {

		return new Promise(function(resolve, reject) {
			if (file.type.ext === 'mp4') {
				resolve();
			}

			var mp4_output = source.replace('.' + file.type.ext, '.mp4');

			console.log(source, mp4_output);

			// Converting to mp4
			ffmpeg(source)
			.output(mp4_output)
			.on('error', function(err, stdout, stderr) {
			    console.log('Cannot process video: ' + err.message);
			})
			.on('end', function() {
				console.log('Finished processing');
				file.path = file.path.replace('.' + file.type.ext, '.mp4');
				resolve();
			})
			.run();
		});
	}

	var generateThumbnail = function () {

		// Generating thumbnail
		var thumbgen_output = UPLOAD_PATH + userInfo.id + '/thumbgen.vtt';

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
			updatingVideoInfo(); 
		});
	}

	var updatingVideoInfo = Meteor.bindEnvironment(function() {

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
}