var thumbgen = Npm.require(THUMBGEN_PATH);
var ffmpeg = Npm.require(FLUENT_FFMPEG_PATH);
var crypto = Npm.require('crypto');
var fs = Npm.require('fs');

uploaded_video = function (userInfo, file, file_id) {

	this.processing = function() {
		console.log('processing');
		convertToMp4()
		.then(function() {
			generateThumbnail();
		})
	}

	var source = UPLOAD_PATH + userInfo.id + '/' + file.title;
	var file_md5 = crypto.createHash('md5').update(file.title).digest('hex');

	var convertToMp4 = function() {

		return new Promise(function(resolve, reject) {
			console.log('file', file_md5);
			var mp4_output = UPLOAD_PATH + userInfo.id + '/' + file_md5 + '.mp4';
			if (file.type.ext === 'mp4') {
				console.log('here');
				try{
					fs.writeFileSync(mp4_output, fs.readFileSync(source));	
				} catch (e) {
					console.log(e)
				}
				return resolve();
			}

			// Converting to mp4
			ffmpeg(source)
			.output(mp4_output)
			.on('error', function(err, stdout, stderr) {
			    console.log('Cannot process video: ' + err.message);
			})
			.on('end', function() {
				console.log('Finished processing');
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
						url: '/upload/' + userInfo.id + '/' + file_md5 + '.mp4',
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