/**
 * @fileoverview
 */

try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.testing.asserts');
goog.require('remobid.common.cache.Localstorage');
goog.require('remobid.common.storage.LocalStorage');

describe('Localstorage Cache - UNIT', function () {
  var storageMock = new goog.testing.Mock(new remobid.common.storage.LocalStorage('v1', 'test'));

  it('should only except common datastorage as enginge', function(done) {
    assertNotThrows(new remobid.common.cache.Localstorage(storageMock));
    var fakeStorage = {};
    assertThrows(new remobid.common.cache.Localstorage(fakeStorage));
  });

});
