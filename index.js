
/**
 * Module dependencies.
 */

var babel = require('babel-core');
var debug = require('debug')('duo-babel');

/**
 * Helper methods.
 */

var canCompile = babel.util.canCompile;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Babel plugin for Duo.
 *
 * @param {Object} o
 * @return {Function}
 */

function plugin(o) {
  if (!o) o = {};
  debug('initialized with options', o);

  var extensions = extract(o, 'extensions') || canCompile.EXTENSIONS;

  return function* babel(file, entry) {
    if (!canCompile(file.path, extensions)) return debug('ignoring file: %s', file.path);

    var duo = file.duo;
    var es5 = yield run(duo, file, o);
    file.src = es5.code;
    file.type = 'js';
  };
}

/**
 * Run the compilation, but utilizes the cache if available.
 *
 * @param {Duo} duo         Duo instance
 * @param {File} file       File to be compiled
 * @param {Object} options  User-defined config
 * @returns {Object}        Results of babel compile
 */

function* run(duo, file, options) {
  var cache = yield duo.getCache();
  if (!cache) {
    debug('cache not enabled for %s', file.id);
    return compile(duo, file, options);
  }

  var key = [ duo.hash(file.src), duo.hash(options) ];
  var cached = yield cache.plugin('babel', key);
  if (cached) {
    debug('retrieved %s from cache', file.id);
    return cached;
  }

  var results = compile(duo, file, options);
  yield cache.plugin('babel', key, results);
  debug('saved %s to cache', file.id);
  return results;
}

/**
 * Compiles the file given options from user.
 */

function compile(duo, file, options) {
  var root = duo.root();
  var sourceMap = duo.sourceMap();

  var o = Object.assign({
    ast: false,
    filename: file.path,
    filenameRelative: file.id,
    sourceMap: sourceMap ? 'inline' : false
  }, options);

  debug('attempting to compile: %s', file.id, o);
  var es5 = babel.transform(file.src, o);
  if (file.src === es5.code) debug('did not compile: %s', file.id);
  return es5;
}

/**
 * Extracts a value from the input object, deleting the property afterwards.
 *
 * @param {Object} object
 * @param {String} key
 * @returns {Mixed}
 */

function extract(object, key) {
  var value = object[key];
  delete object[key];
  return value;
}
