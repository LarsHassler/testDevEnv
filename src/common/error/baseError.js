/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {}

goog.provide('remobid.common.error.BaseError');

goog.require('goog.debug.Error');

/**
 * remobit base class for custom error objects.
 * @param {string} errorType
 *    The type of the error.
 * @param {*=} opt_msg
 *    The message associated with the error.
 * @constructor
 * @extends {goog.debug.Error}
 */
remobid.common.error.BaseError = function(errorType, opt_msg) {

  /**
   *
   * @type {string}
   */
  this.errorType = errorType;

  goog.base(this, opt_msg);

};
goog.inherits(remobid.common.error.BaseError, goog.debug.Error);

/** @override */
remobid.common.error.BaseError.prototype.name = 'RemobidError';
