var git = Npm.require(NODEGIT_PATH);

repository = function(repo_path) {
	this.repo_path = repo_path;

	var _repository, _index, _path, _tree;

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

	this.commit = function(nb_files, user) {

		return new Promise(function(resolve, reject) {

			_openIndex()

			.then(function() {
				return _addAll();
			})

			.then(function() {

				if (_repository.headUnborn()) {
					return false;
				}					

				return _repository.getBranchCommit("master");
			})

			.then(function(master_commit) {

				var username = user.name || '#';
				var email = '@';
				var author = git.Signature.now(username, email);
				var committer = git.Signature.now(username, email);

				var commit_message = 'Added ' + nb_files + ' new files';

				var parents = (!master_commit) ? [] : [master_commit];
				var parents_count = (!master_commit) ? 0 : 1; //master_commit.parentcount();

				return git.Commit.create(_repository, "HEAD", author, committer, "UTF-8", commit_message, _tree, parents_count, parents);
			})

			.then(function(oid) {
				resolve(oid.tostrS());
			})

			.catch(function(err) {
				console.log('catched', err);
				reject();
			})

			// .done(function() {
			// 	console.log('commit ok:');
			// 	// resolve();
			// })

		});
	}
}