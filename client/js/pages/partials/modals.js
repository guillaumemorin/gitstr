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
	'submit form': function (event, template) {
		var input_val = event.target.link_input.value;
		if (input_val === '' || !validator.isURL(input_val)) {
			return false;
		}

		var title = input_val;
		var type = {subtype: 'link'};
		var data = UI.getData();
		var supported_services = {
			'twitter.com': {name: 'twitter', item: 'tweet'}
		}
		var hostname = url('hostname', input_val);

		if (supported_services[hostname]) {

			if (url('2', input_val) !== 'status' || !url('3', input_val)) {
				return false;
			}

			type.subtype = supported_services[hostname].item;
			type.service_name = supported_services[hostname].name;
			type.item_id = url('3', input_val);
			title = 'From ' + supported_services[hostname].name;
		}

		var file_id = Repos_files.insert(
			{title: title, url: input_val, timestamp: new Date().getTime(), type: type}
		);

		Repos_history.insert(
			{
				repo_id: data.repo._id,
				repo_title: data.repo.title,
				timestamp: new Date().getTime(),
				user_id: Meteor.userId(),
				user_name: Meteor.user().profile.name,
				user_screen_name: Meteor.user().profile.screen_name,
				user_profile_image: Meteor.user().profile.image,
				file_id: file_id,
				nb_link: 1,
				link_type: type
			}
		);

		Repos.update(
			{"_id": data.repo._id},
			{
				$push: {file_structure: file_id},
				$set: {last_update: new Date().getTime()},
				$inc: {nb_link: 1}
			}
		);

		return false;
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