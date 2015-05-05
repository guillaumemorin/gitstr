var thumbgen = Npm.require(THUMBGEN_PATH);
var ffmpeg = Npm.require(FLUENT_FFMPEG_PATH);
var crypto = Npm.require('crypto');
var fs = Npm.require('fs');

uploaded_video = function (userInfo, file, file_id) {

	this.processing = function() {
		convertToMp4()
		.then(function() {
			generateThumbnail();
		})
	}

	var file_md5 = crypto.createHash('md5').update(file.title).digest('hex');
	var file_ext = '.' + file.type.ext;
	var source = UPLOAD_PATH + userInfo.user_id + '/' + file_md5 + file_ext;

	var convertToMp4 = function() {

		return new Promise(function(resolve, reject) {
			var mp4_output = UPLOAD_PATH + userInfo.user_id + '/' + file_md5 + '.mp4';
			if (file.type.ext === 'mp4') {
				try {
					fs.renameSync(source, mp4_output);	
				} catch (e) {
					console.log(e)
				}
				return resolve();
			}

			// Converting to mp4
			ffmpeg(source)
			.output(mp4_output)
			.on('error', function(err, stdout, stderr) {
				updatingVideoInfo(err);
			    console.log('Cannot process video: ' + err.message);
			})
			.on('end', function() {
				resolve();
			})
			.run();
		});
	}

	var generateThumbnail = function () {

		// Generating thumbnail
		var thumbgen_output = UPLOAD_PATH + userInfo.user_id + '/thumbgen.vtt';

		thumbgen(source, {
			output: thumbgen_output,
			assetsDirectory: file_id,
			size: {width: 450, height: 300},
			numThumbnails: 1,
			spritesheet: true
		}, function(error, metadata) {
			if (error) {
				updatingVideoInfo(error);
				return;
			}
			updatingVideoInfo(); 
		});
	}

	var updatingVideoInfo = Meteor.bindEnvironment(function(error) {
		
			error = error || false;
			var cover_url = (error) ? '/image_small_default.jpg' : '/upload/' + userInfo.user_id + '/' + file_id + '/thumbnails.png';
			var url = (error) ? '/image_small_default.jpg' : '/upload/' + userInfo.user_id + '/' + file_md5 + '.mp4';

			Repos_files.update(
				{_id: file_id},
				{
					$set: {
						url: url,
						cover_url: cover_url
					}
				}
			);

			Repos.update(
				{"_id": userInfo.repo._id},
				{$set: {'samples.video': cover_url}}
			);
		}
	)
}