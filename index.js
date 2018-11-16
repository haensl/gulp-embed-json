const through = require('through2');
const embedJson = require('embed-json');
const PluginError = require('plugin-error');
const fs = require('fs');
const path = require('path');
const PLUGIN_NAME = require('./package').name;
const defaults = {
  mimeTypes: [
    'application/json',
    'application/ld+json'
  ],
  root: __dirname,
  minify: true,
  encoding: 'utf8'
};

module.exports = (opts = {}) =>
  through.obj((file, encoding, callback) => {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME, 'Streams are not supported.'));
    }

    const options = Object.assign({}, defaults, opts);

    if (typeof options.root !== 'string') {
      return callback(new PluginError(PLUGIN_NAME, 'Invalid option: root must be a string'));
    } else if (!fs.existsSync(options.root)) {
      return callback(new PluginError(PLUGIN_NAME, `Invalid option: root path ${options.root} does not exist`));
    }

    if (typeof options.mimeTypes === 'string') {
      options.mimeTypes = [ options.mimeTypes ];
    }

    if (!Array.isArray(options.mimeTypes)
      || options.mimeTypes.some((type) => typeof type !== 'string')) {
      return callback(new PluginError(PLUGIN_NAME, 'Invalid option: mimeTypes must be string or Array<string>.'));
    }

    if (typeof options.minify !== 'boolean') {
      return callback(new PluginError(PLUGIN_NAME, 'Invalid option: minify must be a boolean.'));
    }

    if (typeof options.encoding !== 'string') {
      return callback(new PluginError(PLUGIN_NAME, 'Invalid option: encoding must be a string.'));
    }

    try {
      file.contents = new Buffer(embedJson(file.contents.toString(), options));
    } catch (err) {
      return callback(new PluginError(PLUGIN_NAME, err));
    }

    callback(null, file);
  });
