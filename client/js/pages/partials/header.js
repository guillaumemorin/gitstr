Template.header.events({
	'keypress .search': function (event, template) {
		Meteor.call('search', event.target.value, function(error, result) {
			$('.search')
			.search({
				source: result,
				searchFields: ['title']
			})
		})
	},
	'click #mobile_menu_button': function (event, template) {
		template.$('#mobile_menu').transition('fade down');
	},
	'click #logout': function (event, template) {
		Meteor.logout();
		Router.go('/');
	},
	'click #header_subscribe': function (event, template) {
		_subscribe();	
	},
	'click #header_table_collapse' : function (event, template) {
		$('.extra-content').toggle();
		var status = Session.get('display_status') === 'browser' ? 'attach' : 'browser';
		Session.set('display_status', status);
	}
});

Template.header.rendered = function() {
	opacity_value = 1;
	fixed_topbar = false;
	Session.set('display_status', 'browser');
}

var opacity_value;
var fixed_topbar;
var scroll_position;

$(window).scroll(function() {

	if ($(document).width() < 767) {
		return;
	}
	
	scroll_position = $(window).scrollTop();

	if (scroll_position > 65) {
		
		if (opacity_value) {
			opacity_value = 0;	
			$('#topbar').css( "opacity", opacity_value);
		}

		if (!fixed_topbar) {
			fixed_topbar = true;
			$('#fixed_topbar').transition('scale');
			window.setTimeout(function() {
				$('#topbar_repo_info').transition('fade down');	
			}, 200);
			
		}
		return;
	}

	opacity_value = 1 - (scroll_position / 65);
	$('#topbar').css( "opacity", opacity_value);

	if (fixed_topbar) {
		fixed_topbar = false;
		$('#topbar_repo_info').transition('fade up');
		$('#fixed_topbar').transition('scale');
	}
});