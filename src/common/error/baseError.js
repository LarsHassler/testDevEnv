/**
 * @fileoverview base class for custom errors.
 */

goog.provide('remobid.common.error.BaseError');

goog.require('goog.debug.Error');

/**
 * @param {string} errorType
 *    The type of the error.
 * @param {*=} opt_msg
 *    The message associated with the error.
 * @constructor
 * @extends {goog.debug.Error}
 */
remobid.common.error.BaseError = function(errorType, opt_msg) {
  goog.base(this, opt_msg);

  /**
   * a string to identify which type of error
   * @type {string}
   */
  this.errorType = errorType;

  this.name = 'RemobidError';
};
goog.inherits(remobid.common.error.BaseError, goog.debug.Error);
