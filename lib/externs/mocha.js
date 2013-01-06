/**
 * @fileoverview type defentions for the mocha testing frame work.
 *
 * @externs
 */


/**
 * @param {string} desc desc of the test to run.
 * @param {Function} fn the tests to run.
 */
var describe = function(desc, fn) {};

/**
 * @param {string} desc desc of the test to run.
 * @param {Function} fn the tests to run.
 */
describe.skip = function(desc, fn) {};

/**
 * @param {string} desc desc of the test to run.
 * @param {Function} fn the tests to run.
 */
var it = function(desc, fn) {};

/**
 * @param {string} desc desc of the test to run.
 * @param {Function} fn the tests to run.
 */
it.skip = function(desc, fn) {};

/**
 * @param {Function} fn the actions to take before running the tests
 */
var before = function(fn) {};

/**
 * @param {Function} fn the actions to take after running the tests
 */
var after = function(fn) {};


/**
 * @param {Function} fn the actions to take before each test run.
 */
var beforeEach = function(fn) {};

/**
 * @param {Function} fn the actions to take after each test run.
 */
var afterEach = function(fn) {};
