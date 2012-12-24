/**
 * @fileoverview
 */

try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.testing.asserts');
goog.require('remobid.common.cache.localstorage');

describe('Localstorage Cache - UNIT', function () {
  var storageMock = function() {

    var storage_ = {};

    this.store = function(key,data) {
      storage_[key] = data;
    };
    this.remove = function(key) {
      delete storage_[key];
    };
    this.load = function(key) {
      return storage_[key];
    }
  }
});
