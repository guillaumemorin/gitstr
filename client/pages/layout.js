Template.layout.events({
  'click #menu': function (event, template) {
    console.log('menu', $('.sidebar'));
    $('.sidebar').sidebar('toggle');
  }
});