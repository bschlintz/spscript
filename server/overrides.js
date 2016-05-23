var Web = require("../src/web");
var fs = require("fs");
var path = require("path");

// Override the default _uploadFile implementation to work with local file system and node buffer
Web.prototype._uploadFile = function(filepath, folderUrl, fields, digest) {
	fields = fields || {};
	fields.name = fields.name || path.parse(filepath).base;
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, nodeBuffer) => {
			if (err) reject(err);
			this._uploadBinaryData(nodeBuffer, folderUrl, fields, digest)
				.then(resolve)
				.catch(reject);
		})
	});
};