var path = Npm.require('path');

FILES_PATH = path.resolve(process.env.PWD + '/../gitstr_files/');
REPOSITORY_PATH = FILES_PATH + '/repos/';
UPLOAD_PATH = FILES_PATH + '/uploads/';

NPM_PACKAGES_PATH = path.resolve(process.env.PWD + '/../gitstr_npm_packages/');
NODEGIT_PATH = NPM_PACKAGES_PATH + '/nodegit';
THUMBGEN_PATH = NPM_PACKAGES_PATH + '/thumbnails-webvtt';
FLUENT_FFMPEG_PATH = NPM_PACKAGES_PATH + '/fluent-ffmpeg';

PROFILE_IMAGE_PATH = UPLOAD_PATH + '/public/u';


// Services config
tokens = {
	twitter: {
		DEV: {
			$set: {
				consumerKey: "2J7MBzXbDY6peCccGWLGnHNPD",
				loginStyle: "popup",
				secret: "7dR10ruKdqyw95s9gzANrBXGZowZd80njhJJQ7L3Xy989Npzzd"
			}
		},
		PROD: {
			$set: {
				consumerKey: "hv613QAHngD7KUfSOoRxMPDD2",
				loginStyle: "popup",
				secret: "y8T5eafXhGlw1l3QWBQqqkeZXtGaBBTYmXAHn63K20I6QXGkkI"
			}
		}
	},
	github: {
		DEV: {
			$set: {
				clientId: "f695a723f3c105d52c0c",
				loginStyle: "popup",
				secret: "60cd182803d9be5ac30152f3fc153a6ecd2a1baf"
			}
		},
		PROD: {
			$set: {
				clientId: "ede2470060f9b5dd5156",
				loginStyle: "popup",
				secret: "2a7b689a436e8b4c2bedef44bfba8d91dc233085"
			}
		}
	},
	facebook: {
		DEV: {
			$set: {
				appId: "1089309854428755",
				loginStyle: "popup",
				secret: "8c5742c753ac3deeb1086d613df0d1d7"
			}
		},
		PROD: {
			$set: {
				appId: "1089309854428755",
				loginStyle: "popup",
				secret: "8c5742c753ac3deeb1086d613df0d1d7"
			}
		}
	}
}