const through = require('through2');
const cheerio = require('cheerio');
const gutil = require('gulp-util');
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
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported.'));
    }

    const options = Object.assign({}, defaults, opts);

    if (typeof options.root !== 'string') {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: root must be a string'));
    } else if (!fs.existsSync(options.root)) {
      return callback(new gutil.PluginError(PLUGIN_NAME, `Invalid option: root path ${options.root} does not exist`));
    }

    if (typeof options.mimeTypes === 'string') {
      options.mimeTypes = [ options.mimeTypes ];
    }

    if (!Array.isArray(options.mimeTypes)
      || options.mimeTypes.some((type) => typeof type !== 'string')) {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: mimeTypes must be string or Array<string>.'));
    }

    if (typeof options.minify !== 'boolean') {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: minify must be a boolean.'));
    }

    if (typeof options.encoding !== 'string') {
      return callback(new gutil.PluginError(PLUGIN_NAME, 'Invalid option: encoding must be a string.'));
    }

    const $ = cheerio.load(file.contents.toString());
    const selectors = options.mimeTypes.reduce((prev, type) =>
        `${prev.length ? `${prev}, ` : ''}script[type="${type}"][src$=".json"]`, '');
    let didEmbed = false;
    let error;
    $(selectors).each((index, element) => {
      const el = $(element);
      const src = el.attr('src');
      const absSrc = path.resolve(path.join(options.root, src));

      if (src
        && fs.existsSync(absSrc)
        && fs.statSync(absSrc).isFile()) {
        try {
          const jsonData = fs.readFileSync(absSrc, options.encoding);
          if (jsonData.length) {
            el.empty()
              .text(options.minify ? JSON.stringify(JSON.parse(jsonData)) : jsonData)
              .attr('src', null);
            didEmbed = true;
          }
        } catch(err) {
          error = new gutil.PluginError(PLUGIN_NAME, err);
          return false;
        }
      } else {
        error = new gutil.PluginError(PLUGIN_NAME, `Invalid source path: ${src}`);
        return false;
      }
    });

    if (error) {
      return callback(error);
    }

    if (didEmbed) {
      file.contents = new Buffer($.html());
    }

    callback(null, file);
  });
