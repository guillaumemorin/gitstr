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
		return Session.get('modal_info');
	}
});

Template.upload_modal.rendered = function() {
	$('#upload_modal').modal('setting', 'transition', 'fade up');
};

Template.signin_modal.rendered = function() {
	$('#signin_modal').modal('setting', 'transition', 'fade up');
};

Template.image_modal.rendered = function() {
	$('#image_modal').modal('setting', 'transition', 'fade up');
};

Template.link_modal.rendered = function() {
	$('#link_modal').modal('setting', 'transition', 'fade up');
};

Template.link_modal_actions.events({
	'click #add_link': function () {
		console.log('add link');
	}
});

Template.signin_modal_actions.events({
	'click #twitter_signin': function () {
		Meteor.loginWithTwitter({}, function() {
			$('#signin_modal').modal('hide');
		});
	},
	'click #github_signin': function () {
		Meteor.loginWithGithub({}, function() {
			$('#signin_modal').modal('hide');
		});
	},
	'click #facebook_signin': function () {
		Meteor.loginWithFacebook({}, function() {
			$('#signin_modal').modal('hide');
		});
	}
});