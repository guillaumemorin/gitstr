service_url = 'http://gitall.com/';
service_git = 'git@gitall.com:';

// Db
Repos = new Mongo.Collection("repo");
Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images")]
});