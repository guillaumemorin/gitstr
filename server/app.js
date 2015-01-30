  var clone = Npm.require(process.env.NODEGIT_PATH).Clone.clone;
  // Clone a given repository into a tmp folder.
  // clone("git://github.com/nodegit/nodegit", "/home/git/tmp_test").then(function(repo) {});

  // console.log('Clone done');

  Meteor.startup(function () {
    Accounts.loginServiceConfiguration.insert({
      service     : 'twitter',
      consumerKey : '2J7MBzXbDY6peCccGWLGnHNPD',
      secret      : '7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd'
    });
  });