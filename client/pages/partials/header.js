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

// var $topbar = $('#topbar');
// var $window = $(window);
// var topbar_fixed = false;
// $window.scroll(function() {
	
// 	if ($window.scrollTop() === 0) {
// 		if (topbar_fixed) {
// 			topbar_fixed = false;
// 			$('#topbar').removeClass('fix');	
// 		}
// 		console.log('return topbar === 0')
// 		return;
// 	}

// 	if (topbar_fixed) {
// 		console.log('return topbar fixed')
// 		return;
// 	}

// 	// if ($window.scrollTop() > 0) {
// 		topbar_fixed = true;
// 		$('#topbar').addClass('fix');
// 	// }
// 	console.log('scroll >>>>>>>>');
// });