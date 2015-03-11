var git = Npm.require(process.env.NODEGIT_PATH);
var path = Npm.require('path');
var fs = Npm.require('fs');

var Repository = git.Repository;
var Clone = git.Clone;

// Publish //
Meteor.publish('repos', function () {
  return Repos.find({});
});

Meteor.publish('files', function () {
  return Images.find({});
});

Meteor.publish('userData', function () {
  return Meteor.users.find({}, {fields: {'services': 1}});
});

// Startup init //
Meteor.startup(function () {

// Upload
// UploadServer.init({
//   tmpDir: process.env.PWD + '/../git4all_data/tmp',
//   uploadDir: process.env.PWD + '/../git4all_data/',
//   finished: function() {
//     console.log(this.userId)
//     console.log('finished');
//     // return formData.contentType;
//   },
// });

  Accounts.loginServiceConfiguration.insert({
    service: 'twitter',
    consumerKey: '2J7MBzXbDY6peCccGWLGnHNPD',
    secret: '7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd'
  });
});

// Called from client //
Meteor.methods({
  openRepo: function (name) {

  // var clone = Clone.clone
  // clone("git://github.com/nodegit/nodegit", "/Users/guillaume/test_nodegit").then(function(repo) {

  //   console.log('initiated');
    
  //   // Use a known commit sha from this repository.
  //   var sha = "59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5";

  //   // Look up this known commit.
  //   repo.getCommit(sha).then(function(commit) {
  //     // Look up a specific file within that commit.
  //     commit.getEntry("README.md").then(function(entry) {
  //       // Get the blob contents from the file.
  //       entry.getBlob().then(function(blob) {
  //         // Show the name, sha, and filesize in byes.
  //         console.log(entry.filename(), entry.sha(), blob.rawsize());

  //         // Show a spacer.
  //         console.log(Array(72).join("=") + "\n\n");

  //         // Show the entire file.
  //         console.log(String(blob));
  //         Meteor.publish("repo", function () {
  //           // this.ready();
  //           return [String(blob)];
  //         });
  //       });
  //     });
  //   });
  // });



    // console.log('openRepo');
    var ret = []; 
    Repository.open(path.resolve('/Users/guillaume/repo_test'))
    .then(function(repo) {
    return repo.getMasterCommit();
  })
  .then(function(firstCommitOnMaster) {
      return firstCommitOnMaster.getTree();
  })
  .then(function(tree) {
    // `walk()` returns an event.
    var walker = tree.walk();
    walker.on("entry", function(entry) {
      console.log(entry)
      console.log('>>>>', entry, entry.path(), entry.isDirectory(), entry.sha());
      ret.push(entry.path())
    });

    // Don't forget to call `start()`!
    walker.start();
  })
  .done();
    // .then(function(repoResult) {
    //     // console.log(repoResult.workdir(), repoResult,  repoResult.openIndex(), repoResult.openIndex().value());
    //     return repoResult.openIndex();
    //     // Session.set('repo', repoResult.openIndex());
    //     // Meteor.publish("repo", function () {
    //     //   // this.ready();
    //     //   return [];
    //     // });
    // })
    // return 'yoyo';
  },
  createRepo: function (name) {
    
  // Check argument types
  // check(comment, String);
  // check(postId, String);

  // var clone = Clone.clone
  // clone("git://github.com/nodegit/nodegit", "/Users/guillaume/test_nodegit").then(function(repo) {
    
  //   // Use a known commit sha from this repository.
  //   var sha = "59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5";

  //   // Look up this known commit.
  //   repo.getCommit(sha).then(function(commit) {
  //     // Look up a specific file within that commit.
  //     commit.getEntry("README.md").then(function(entry) {
  //       // Get the blob contents from the file.
  //       entry.getBlob().then(function(blob) {
  //         // Show the name, sha, and filesize in byes.
  //         console.log(entry.filename(), entry.sha(), blob.rawsize());

  //         // Show a spacer.
  //         console.log(Array(72).join("=") + "\n\n");

  //         // Show the entire file.
  //         console.log(String(blob));
  //       });
  //     });
  //   });
  // });

    if (!this.userId) {
      throw new Meteor.Error("not-logged-in", "Must be logged in to post a comment.");
    }

    var repo_name = Repos.findOne({name: name});
    if (repo_name) {
      throw new Meteor.Error("repo-already-exists", "This name already exists");
    }

    // var error_callback = function() {
    //   throw new Meteor.Error("repo-init-failed", "Something went wrong :(");
    // };
    
    var done_callback = Meteor.bindEnvironment(function(err) {
      var repo_path = Meteor.user().services.twitter.screenName + '/' + name
      Repos.insert({
        name: name,
        timestamp: new Date().getTime(),
        user_id: this.userId,
        path: repo_path,
        permalink: service_url + repo_path,
        permaGit: service_git + repo_path
      });
    })

    Repository.init('/Users/guillaume/git4all_yo', 1)
    .catch(function(err) {
      
    })
    .done(function(error) {
      done_callback()
    })

    return 'Pending...';
  }
});
