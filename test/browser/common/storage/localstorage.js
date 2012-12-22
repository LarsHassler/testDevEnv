/**
 * @fileoverview tests for a html5 localstorage engine.
 */

try {
  if (require)
    require('nclosure');
} catch (e) {}

goog.require('goog.testing.asserts');
goog.require('goog.userAgent');
goog.require('remobid.common.storage.LocalStorage');
goog.require('remobid.common.storage.StorageErrorType');


describe('Browser - localstorage', function() {
  var Storage;
  var s_url = 'users';
  var s_version = 'v1';

  it('should be available in newer browsers', function() {
    Storage = new remobid.common.storage.LocalStorage(s_version, s_url);
    if (goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.5') ||
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1') ||
      goog.userAgent.IE && goog.userAgent.isVersion('8')) {
      assertTrue(Storage.isAvailable());
    } else
      assertFalse(Storage.isAvailable());
  });
});

