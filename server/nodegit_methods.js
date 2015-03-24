var git = Npm.require(process.env.NODEGIT_PATH);

repository = function(repo_path) {
	this.repo_path = repo_path;

	var _repository, _index, _path, _parent;

	var _openIndex = function() {

		return new Promise(function(resolve, reject) {

			git.Repository.open(repo_path)

			.then(function(repo) {
				_repository = repo;
				return repo.openIndex();
			})

			.then(function(index) {
				_index = index;
				return index.read();
			})

			.catch(function(err) {
				console.log('repository._openIndex error', err);
				reject();
			})

			.done(function() {
				resolve();
			})
		});
	}

	var _addAll = function() {

		return new Promise(function(resolve, reject) {

			git.Status.foreach(_repository, function(file) {
				_index.addByPath(file);
			})

			.then(function() {
				return _index.write();
			})

			.then(function() {
				return _index.writeTree();
			})

			.then(function(oid) {
				return _repository.getTree(oid);
			})

			.then(function(tree) {
				_tree = tree;
			})

			.catch(function(err) {
				console.log('repository._addAll error', err);
				reject();
			})

			.done(function() {
				resolve();
			})
		});
	}

	// Public
	this.init = function(resolve, reject) {
		git.Repository.init(this.repo_path, 0)
		.catch(function(err) {
			console.log('catched', err);
			reject()
		})
		.done(function(error) {
			resolve();
			console.log('done');
		})
	}

	this.commit = function() {

		return new Promise(function(resolve, reject) {

			_openIndex()
			.then(function() {
				_addAll()

				.then(function() {
					return _repository.getBranchCommit("master");
				})

				.then(function(master_commit) {

					var author = git.Signature.create("Scott jacky", "schacon@gmail.com", new Date().getTime(), 60);
					var committer = git.Signature.create("Scott A Chacon", "scott@github.com", new Date().getTime(), 90);

					var parent_count = master_commit.parentcount();
					var parent_array = parent_count > 0 ? [master_commit] : [];

					return git.Commit.create(_repository, "HEAD", author, committer, "UTF-8", "biloute", _tree, parent_count, parent_array);
				})

				.then(function(oid) {
					console.log('commit id:' + oid.tostrS());
					resolve();
				})

				// .done(function() {
				// 	console.log('commit ok:');
				// 	// resolve();
				// })

				.catch(function(err) {
					console.log('catched', err);
					reject();
				})
			})
		});
	}
}