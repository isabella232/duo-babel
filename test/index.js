
/**
 * Module Dependencies
 */

var assert = require('assert');
var convert = require('convert-source-map');
var Duo = require('duo');
var path = require('path');
var babel = require('..');
var vm = require('vm');

/**
 * Tests
 */

describe('duo-babel', function() {
  it('should compile .js', function(done) {
    build('simple').run(function(err, src) {
      if (err) return done(err);
      assert(src.code.indexOf('var TRANSFORMED') !== -1);
      done();
    });
  });

  it('should only compile local js files', function(done) {
    build('remote', { onlyLocals: true }).run(function (err, src) {
      if (err) return done(err);
      // console.log(src);
      var ret = evaluate(src.code);
      // console.log(ret);
      done();
    });
  });

  it('should include an inline source-map by default', function(done) {
    build('simple').run(function(err, src) {
      if (err) return done(err);
      assert(convert.commentRegex.test(src));
      done();
    })
  });

  it('should not include an inline source-map', function(done) {
    build('simple', { sourceMap: false }).run(function(err, src) {
      if (err) return done(err);
      assert(!convert.commentRegex.test(src));
      done();
    })
  });
});

/**
 * Returns a duo builder for the given fixture
 *
 * @param {String} fixture    The name of fixture (w/o fixtures/ or .js)
 * @param {Object} [options]  Options for the babel plugin
 * @returns {Duo}
 */

function build(fixture, options) {
  return Duo(__dirname)
    .cache(false)
    .entry('fixtures/' + fixture + '.js')
    .use(babel(options));
}

/**
 * Evaluates code compiled by duo
 *
 * @param {String}
 * @returns {Object}
 */

function evaluate(src, ctx) {
  ctx = ctx || { console: console };
  return vm.runInNewContext(src, ctx)(1);
}
