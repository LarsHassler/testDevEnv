/**
 * @fileoverview common js module to run mocha test with the closure library
 */

require('nclosure').nclosure();
var Mocha = require('mocha'),
    path = require('path');

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
 * starts the test run
 * @param {Function} callback
 */
remobid.devEnv.TestRunner.prototype.run = function(callback) {
  goog.array.forEach(this.srcFiles_, function(file) {
    this.mocha.addFile(path.join('test', file));
  }, this);

  this.mocha.run(callback);
};

if(goog.isDef(module.exports))
  module.exports.testRunner = remobid.devEnv.TestRunner;
