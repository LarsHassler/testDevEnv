/**
 * @fileoverview common js module to run mocha test with the closure library
 */

require('nclosure').nclosure();
var Mocha = require('mocha'),
    path = require('path'),
    fs = require('fs');

goog.provide('remobid.devEnv.TestRunner');

goog.require('goog.array');
/**
 *
 * @param {...string} var_args an list of files the test should be run
 *    for.
 * @constructor
 */
remobid.devEnv.TestRunner = function(var_args) {
  /**
   * hold all files for which the test will be run
   * @type {Array.<String>}
   * @private
   */
  this.srcFiles_ = [];

  /**
   * hold the types of test to run
   * @type {Array.<String>}
   * @private
   */
  this.testTypes_ = [];

  /**
   * instance of Mocha
   * @type {Mocha}
   */
  this.mocha = new Mocha;
  this.mocha.reporter('dot').ui('bdd');

  if(!!arguments.length)
    for (var i = 0, len = arguments.length; i < len; i++)
      this.addFiles(arguments[i]);
};

/**
 * function to load
 * @param {...string} var_args
 */
remobid.devEnv.TestRunner.prototype.addFiles = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var file = arguments[i];
    goog.array.insert(this.srcFiles_, file);
  }
};

/**
 * addes type to run
 * @param {...string} var_args
 */
remobid.devEnv.TestRunner.prototype.addTypes = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    var type = arguments[i];
    if(goog.array.contains(['unit/both','unit/node','unit/browser'], type))
      goog.array.insert(this.testTypes_, type);
    else
      throw new Error('unknown test type');
  }
};

/**
 * starts the test run
 * @param {Function} callback
 */
remobid.devEnv.TestRunner.prototype.run = function(callback) {
  goog.array.forEach(this.srcFiles_, function(file) {
    goog.array.forEach(this.testTypes_, function(type) {
      var fileName = path.join('test', type, file);
      if(fs.existsSync(fileName))
        this.mocha.addFile(fileName);
    }, this);
  }, this);

  this.mocha.run(callback);
};

if(goog.isDef(module.exports))
  module.exports.testRunner = remobid.devEnv.TestRunner;
