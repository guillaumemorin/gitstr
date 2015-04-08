Template.upload_modal.helpers({
	uploadCallback: function() {
		return {
			finished: function(index, fileInfo, context) {
				console.log('fileinfo', fileInfo);

				var tmp = Session.get('tmp_files') || [];
				var type = fileInfo.type.split('/') || [];
				var subtype = type[0] || '';
				var ext = type[1] || '';
				var type_info = {subtype: subtype, ext: ext}

				var path = fileInfo.path.split('/');

				var cover_url = '/upload/' + path[0] + '/cover/' + path[1];
				if (subtype === 'video') {
					var name = fileInfo.name.split('.');
					cover_url = '/upload/' + path[0] + '/' + name[0] + '/thumbnails.png';
				}
				
				var url = '/upload/' + path[0] + '/' + path[1];

				tmp.push({title: fileInfo.name, size: fileInfo.size, timestamp: new Date().getTime(), url: url, cover_url: cover_url, type: type_info});
				Session.set('tmp_files', tmp);
				Session.set('nb_tmp_files', Session.get('nb_tmp_files') + 1);
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

Template.image_modal.helpers({
	modalInfo: function() {
		console.log('modal_info', Session.get('modal_info'));
		return Session.get('modal_info');
	}
})

Template.image_modal.rendered = function () {
	//Init
	$('#image_modal').modal('setting', 'transition', 'fade up')
};

