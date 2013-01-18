/**
 * @fileoverview hold all useful utilities for testing.
 */

goog.provide('remobid.test.mock.Utilities');

/**
 * due to mochas recursive structure we have to reset the stack every once in a
 * while or we will kill the execution espacially in older browser (IE6-IE7).
 * Since we are mocking the clock we have to use this function otherwise the
 * setTimeout would be also only added to the stak.
 * @param {function} done
 *    the mocha done callback function.
 */
remobid.test.mock.Utilities.clearStack = function(done) {
  if (goog.isDef(goog.global['originalClock'])) {
    if (goog.userAgent.IE)
      if (goog.userAgent.isVersion('9')) {
        mockClock.replacer_.remove(goog.global, 'setTimeout');
        setTimeout(done, 0);
        mockClock.replacer_.set(goog.global,
          'setTimeout', goog.bind(mockClock.setTimeout_, mockClock));
      } else
        originalClock.setTimeout(done, 0);
    else
      originalClock.setTimeout.call(goog.global, done, 0);
  } else {
    setTimeout(done, 0);
  }
};
