var path = Npm.require('path');



FILES_PATH = path.resolve(process.env.PWD + '/../gitstr_files/');
REPOSITORY_PATH = FILES_PATH + '/repos/';
UPLOAD_PATH = FILES_PATH + '/uploads/';

NPM_PACKAGES_PATH = path.resolve(process.env.PWD + '/../gitstr_npm_packages/');
NODEGIT_PATH = NPM_PACKAGES_PATH + '/nodegit';
THUMBGEN_PATH = NPM_PACKAGES_PATH + '/thumbnails-webvtt';
FLUENT_FFMPEG_PATH = NPM_PACKAGES_PATH + '/fluent-ffmpeg';

PROFILE_IMAGE_PATH = UPLOAD_PATH + '/public/u';