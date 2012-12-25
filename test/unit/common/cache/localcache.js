/**
 * @fileoverview
 */

try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.object');
goog.require('goog.testing.asserts');
goog.require('goog.testing.Mock');
goog.require('remobid.common.cache.LocalCache');
goog.require('remobid.common.storage.LocalStorage');

describe('Localstorage Cache - UNIT', function () {
  var LC,
      version = 'v1',
      url = 'users',
      mockDataStorage = {},
      mockStorage = {
        getItem: function(key) {
          return mockDataStorage[key] || null;
        },
        setItem: function(key, data) {
          mockDataStorage[key] = data.toString();
        },
        removeItem: function(key) {
          delete mockDataStorage[key];
        },
        clear: function() {
          mockDataStorage = {};
        }
      };

  beforeEach(function(){
    LC = new remobid.common.cache.LocalCache(version, url);
    LC.storage_ = mockStorage;
  });

  afterEach(function(){
    mockStorage.clear();
  });

  it('should return non expired values', function(done) {
    LC.store(function(err) {
      assertNull(err);
      LC.load(function(err, data) {
        assertNull(err);
        assertEquals('test', data);
        done();
      },'1');
    }, '1', 'test');
  });

  it('should not return expired values', function(done) {
    LC.store(function(err) {
      assertNull(err);
      LC.expireTime_ = -10;
      LC.load(function(err, data) {
        assertNull(err);
        assertNull(data);
        done();
      },'1');
    }, '1', 'test');
  });

  it('should remove expired values on load', function(done) {
    LC.store(function(err) {
      assertNull(err);
      LC.expireTime_ = -10;
      LC.load(function(err, data) {
        assertNull(err);
        assertNull(data);
        assertEquals(0, goog.object.getKeys(mockDataStorage).length);
        done();
      },'1');
    }, '1', 'test');
  });

  it('should not load unknown key', function(done) {
    LC.store(function(err) {
      assertNull(err);
      LC.expireTime_ = -10;
      LC.load(function(err, data) {
        assertNull(err);
        assertNull(data);
        done();
      },'2');
    }, '1', 'test');
  });

  it.skip('should remove all and only expired values on clear', function(done) {

  });

});
