/**
 * @fileoverview
 */

goog.provide('remobid.test.mock.Utilities');

remobid.test.mock.Utilities.clearStack = function(done) {
  if (goog.isDef(goog.global['originalClock'])) {
    if (goog.userAgent.IE)
      if(goog.userAgent.isVersion('9')) {
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
}