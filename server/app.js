var git = Npm.require(process.env.NODEGIT_PATH);
var fs = Npm.require('fs');
var path = Npm.require('path');

var Repository = git.Repository;
var Clone = git.Clone;

// Publish //
Meteor.publish('userData', function () {
  return Meteor.users.find({}, {fields: {'services': 1}});
});

Meteor.publish('repos', function () {
  return Repos.find({});
});

// Startup init //
Meteor.startup(function () {
  
  // Upload
  UploadServer.init({
    tmpDir: path.resolve(process.env.PWD + '/../uploads/tmp'),
    uploadDir: path.resolve(process.env.PWD + '/../uploads/'),
    checkCreateDirectories: true,
    getDirectory: function(fileInfo, formData) {
      return formData.id;
    },
  })

  // Services
  Accounts.loginServiceConfiguration.insert({
    service: 'twitter',
    consumerKey: '2J7MBzXbDY6peCccGWLGnHNPD',
    secret: '7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd'
  });
});


Meteor.methods({
  moveRepo: function (userInfo, file) {
    
    if (!file || !file.path) {
      throw new Meteor.Error("bad-path", "Something went wrong :(");
    }

    var source = path.resolve(process.env.PWD + '/../uploads/' + file.path)
    var stats = fs.lstatSync(source);
    if (!stats) {
      throw new Meteor.Error("bad-path", "Something went wrong :(");
    }
    
    if (!userInfo || !userInfo.id || !userInfo.repo) {
      throw new Meteor.Error("bad-user-info", "Something went wrong :(");
    }

    var dest = path.resolve(process.env.PWD + '/../repos/' + userInfo.id + '/' + userInfo.repo + '/' + file.name);

    fs.rename(source, dest, function (err) {
    if (err) throw err;
    fs.stat(dest, function (err, stats) {
    if (err) throw err;
    console.log('stats: ' + JSON.stringify(stats));
    });
    });

    // var source = fs.createReadStream(source);
    // var dest = fs.createWriteStream(dest);

    // source.pipe(dest);
    // source.on('end', function() { /* copied */ console.log('copied :)')});
    // source.on('error', function(err) { /* error */ console.log('BAD - FUCK! :(')});  
    

    // if (id !== Meteor.userId) {
    //   console.log('bad');
    //   throw new Meteor.Error("repo-already-exists", "This name already exists");
    // }

    // if (typeof files !== 'object') {
    //   console.log('bad');
    //   throw new Meteor.Error("repo-already-exists", "This name already exists");
    // }

  },
  openRepo: function (name) {

  // var clone = Clone.clone
  // clone("git://github.com/nodegit/nodegit", "/Users/guillaume/test_nodegit").then(function(repo) {

  // console.log('initiated');
    
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
      var insert_id = Repos.insert({
        name: name,
        timestamp: new Date().getTime(),
        user_id: Meteor.userId(),
        path: '/' + repo_path,
        permalink: service_url + repo_path,
        permaGit: service_git + repo_path,
        file_structure: [{name: 'test1'}, {name: 'test2'}, {name: 'test1'}]
      });
    })

    Repository.init(path.resolve(process.env.PWD + '/../repos/' + this.userId + '/' + name), 0)
    .catch(function(err) {
      console.log('catched', err);
    })
    .done(function(error) {
      done_callback()
    })

    return 'Pending...';
  }
});
