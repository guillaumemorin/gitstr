Template.header.events({
	'keypress #search': function (event, template) {
		Meteor.call('search', event.target.value, function(error, result) {
			$('#search')
			.search({
				source: result,
				searchFields: ['title']
			})
		})
	},
	'click #logout': function (event, template) {
		Meteor.logout();
		Router.go('/');
	}
});

Template.header.rendered = function() {
	opacity_value = 1;
	fixed_topbar = false;
}

var opacity_value;
var fixed_topbar;
var scroll_position;

$(window).scroll(function() {

	console.log('scroll', $(window).scrollTop());
	
	scroll_position = $(window).scrollTop();

	if (scroll_position > 65) {
		
		if (opacity_value) {
			opacity_value = 0;	
			$('#topbar').css( "opacity", opacity_value);
		}

		if (!fixed_topbar) {
			fixed_topbar = true;
			$('#fixed_topbar').transition('scale');
		}
		return;
	}

	opacity_value = 1 - (scroll_position / 65);
	$('#topbar').css( "opacity", opacity_value);

	if (fixed_topbar) {
		fixed_topbar = false;
		$('#fixed_topbar').transition('scale');
	}
});