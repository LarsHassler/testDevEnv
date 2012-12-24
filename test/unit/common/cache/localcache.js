/**
 * @fileoverview
 */

try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.testing.asserts');
goog.require('goog.testing.Mock');
goog.require('remobid.common.cache.LocalCache');
goog.require('remobid.common.storage.LocalStorage');

describe('Localstorage Cache - UNIT', function () {
  var storageMock = new remobid.common.storage.LocalStorage('v1', 'test');

  it('should only except localstorage datastorage as enginge', function() {
    var LC = new remobid.common.cache.LocalCache();
    assertNotThrows('a', goog.bind(LC.setStorage, LC, storageMock));
    var fakeStorage = {};
    assertThrows('b', goog.bind(LC.setStorage, LC, fakeStorage));
  });

});
