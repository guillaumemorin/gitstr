Template.upload_modal.helpers({
	uploadCallback: function() {
		return {
			finished: function(index, file, context) {

				var tmp = Session.get('tmp_files') || [];
				var type = file.type.split('/') || [];
				var subtype = type[0] || '';
				var ext = type[1] || '';
				var type_info = {subtype: subtype, ext: ext}

				tmp.push({title: file.name, size: file.size, path: file.path, timestamp: new Date().getTime(), type: type_info});
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
});

Template.signin_modal.events({
	'click #twitter_signin': function () {
		console.log('tw');
		Meteor.loginWithTwitter({}, function() {});
	},
	'click #github_signin': function () {
		Meteor.loginWithGithub({}, function() {});
	},
	'click #facebook_signin': function () {
		Meteor.loginWithFacebook({}, function() {});
	}
});

Template.image_modal.rendered = function () {
	
	//Init
	$('#image_modal').modal('setting', 'transition', 'fade up');
	$('#upload_modal').modal('setting', 'transition', 'fade up');
	$('#link_modal').modal('setting', 'transition', 'fade up');
};

