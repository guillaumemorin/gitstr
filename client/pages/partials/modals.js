Template.upload_modal.helpers({
	uploadCallback: function() {
		return {
			finished: function(index, fileInfo, context) {
				console.log('fileinfo', fileInfo);

				var tmp = Session.get('tmp_files') || [];
				tmp.push({title: fileInfo.name, directory: 0, size: fileInfo.size, timestamp: new Date().getTime()});
				Session.set('tmp_files', tmp);
				Session.set('nb_tmp_files', Session.get('nb_tmp_files') + 1);

				// Meteor.call('moveRepo', {id: Meteor.userId(), repo_id: Session.get('repo_id')}, fileInfo, function(error, result) {
				// 	if (error) {
				// 		console.log(error);
				// 		Session.set("upload_error_message", error.reason);
				// 	}
				// });
			}
		}
	},
	formData: function () {
		var user_id = Meteor.userId();
		return {
			id: user_id
		};
	}
})