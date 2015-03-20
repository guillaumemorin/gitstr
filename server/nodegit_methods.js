var git = Npm.require(process.env.NODEGIT_PATH);
var Repository = git.Repository;
var Status = git.Status;

_commit = function(repo_path) {

var _index, _repository, _oid;


// Repository.open(repo_path)
// .then(function(repo) {
// _repository = repo;
// return repo.openIndex();
// })
// .then(function(index){
// _index = index;
// return _index.readTree();
// })
// .then(function() {
// // `walk()` returns an event.
// var walker = tree.walk();
// walker.on("entry", function(entry) {
// console.log(entry)
// console.log('>>>>', entry, entry.path(), entry.isDirectory(), entry.sha());
// ret.push(entry.path())
// });

// // Don't forget to call `start()`!
// walker.start();
// })


Repository.open(repo_path)
.then(function(repo) {
	_repository = repo;
	return repo.openIndex();
})
.then(function(index){
	_index = index;
	return _index.read();
})
.then(function(index){
	_repository.getStatus().then(function(statuses) {
	// function statusToText(status) {
	//   var words = [];
	//   if (status.isNew()) { words.push("NEW"); }
	//   if (status.isModified()) { words.push("MODIFIED"); }
	//   if (status.isTypechange()) { words.push("TYPECHANGE"); }
	//   if (status.isRenamed()) { words.push("RENAMED"); }
	//   if (status.isIgnored()) { words.push("IGNORED"); }

	//   return words.join(" ");
	// }

		statuses.forEach()
		.then(function() {
			console.log('write');
			return _index.write();
		})
		.then(function() {
		return _index.writeTree();
		})
		.then(function(oid) {
		_oid = oid;
		return git.Reference.nameToId(_repository, "HEAD");
		})
		.then(function(head) {
		return _repository.getCommit(head);
		})
		.then(function(parent) {
		var author = git.Signature.create("Scott Chacon",
		"schacon@gmail.com", 123456789, 60);
		var committer = git.Signature.create("Scott A Chacon",
		"scott@github.com", 987654321, 90);

		return _repository.createCommit("HEAD", author, committer,
		"message", _oid, [parent]);
		})
		.then(function(commitId) {
		// the file is removed from the git repo, use fs.unlink now to remove it
		// from the filesystem.
		console.log("New Commit:", commitId.allocfmt());
		})
		// return _index.write();
	});
})




// .then(function() {
// //remove the file from the index...
// // console.log('path', repo_path + './*');
// _index.addAll();
// return _index.write();
// })
// .then(function() {
// return _index.writeTree();
// })
// .then(function(oid) {
// _oid = oid;
// return git.Reference.nameToId(_repository, "HEAD");
// })
// .then(function(head) {
// return _repository.getCommit(head);
// })
// .then(function(parent) {
// var author = git.Signature.create("Scott Chacon",
// "schacon@gmail.com", 123456789, 60);
// var committer = git.Signature.create("Scott A Chacon",
// "scott@github.com", 987654321, 90);

// return _repository.createCommit("HEAD", author, committer,
// "message", _oid, [parent]);
// })
// .then(function(commitId) {
// // the file is removed from the git repo, use fs.unlink now to remove it
// // from the filesystem.
// console.log("New Commit:", commitId.allocfmt());
// })
// .done(function() {
// console.log('DONE');
// });
}