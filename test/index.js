
/**
 * Module Dependencies
 */

var assert = require('assert');
var babel = require('..');
var convert = require('convert-source-map');
var Duo = require('duo');
var path = require('path');
var rm = require('rimraf').sync;
var vm = require('vm');

/**
 * Tests
 */

after(function () {
  rm(path.join(__dirname, 'components/duo-cache'));
});

describe('duo-babel', function() {
  it('should compile .js', function(done) {
    build('simple/index.js').run(function(err, src) {
      if (err) return done(err);
      var ret = evaluate(src.code);
      assert.equal(ret.area(1), 9.8596);
      done();
    });
  });

  it('should include an inline source-map when duo is including inline source-maps', function(done) {
    build('simple/index.js').sourceMap('inline').run(function(err, src) {
      if (err) return done(err);
      assert(convert.commentRegex.test(src.code));
      done();
    })
  });

  it('should include an inline source-map when duo is including external source-maps', function(done) {
    build('simple/index.js').sourceMap(true).run(function(err, src) {
      if (err) return done(err);
      assert(convert.commentRegex.test(src.code));
      done();
    })
  });

  it('should not include an inline source-map', function(done) {
    build('simple/index.js').run(function(err, src) {
      if (err) return done(err);
      assert(!convert.commentRegex.test(src.code));
      done();
    })
  });

  it('should pass additional options directly to babel', function(done) {
    build('simple/index.js', { comments: false })
      .run(function(err, src) {
        if (err) return done(err);
        assert(src.code.indexOf('// imports') === -1);
        done();
      });
  });

  describe('with cache enabled', function () {
    afterEach(function (done) {
      build('simple/index.js').cache(true).cleanCache(done);
    });

    it('should be significantly faster', function(done) {
      var duo = build('simple/index.js').cache(true);

      var timer1 = timer();
      duo.run(function (err, src) {
        if (err) return done(err);
        var noCache = timer1();

        var timer2 = timer();
        duo.run(function (err, src) {
          if (err) return done(err);

          var withCache = timer2();
          assert(withCache < noCache / 2);
          done();
        });
      });
    });
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
    .entry(path.join('fixtures', fixture))
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

/**
 * Create a timer. The function returned should be called
 * later and it will return the number of ms since it was
 * created.
 *
 * @returns {Function}
 */

function timer() {
  var now = (new Date()).getTime();
  return function () {
    return (new Date()).getTime() - now;
  };
}
