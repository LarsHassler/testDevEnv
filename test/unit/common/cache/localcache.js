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
goog.require('remobid.common.cache.LocalCache');
goog.require('remobid.common.storage.LocalStorage');
goog.require('remobid.test.mock.browser.LocalStorage');

describe('Localstorage Cache - UNIT', function () {
  var LC,
      version = 'v1',
      url = 'users';

  beforeEach(function(){
    LC = new remobid.common.cache.LocalCache(version, url);
    try {
       var t = window && window.localStorage && window.localStorage.getItem;
    } catch (e) {
      LC.storage_ = /** @type {Storage} */ remobid.test.mock.browser.LocalStorage.getInstance();
    }
  });

  afterEach(function(){
    LC.storage_.clear();
  });

  describe('base storage tests', function() {

    // add any tests here should be also added along with all other storage
    // engines

    it('should only except a string,' +
      'number or and array of strings|numbers as ids', function(done) {
      var moreTests = 12;
      var cb = function(err, returnData) {
        assertTrue(err);
        assertEquals(
          remobid.common.storage.StorageErrorType.INVALID_KEY,
          returnData.message
        );
        if (!--moreTests)
          done();
      };

      LC.store(cb, {});
      LC.store(cb, null);
      LC.store(cb);
      LC.store(cb, [null]);

      LC.load(cb, {});
      LC.load(cb, null);
      LC.load(cb);
      LC.load(cb, [null]);

      LC.remove(cb, {});
      LC.remove(cb, null);
      LC.remove(cb);
      LC.remove(cb, [null]);
    });

    it('should not accept empty data', function(done) {
      var cb = function(err, data) {
        assertTrue(err);
        assertEquals(
          remobid.common.storage.StorageErrorType.MISSING_DATA,
          data.message
        );
        done();
      };
      LC.store(cb, '1');
    });

    it('should load a single id', function(done) {
      var key = '1',
        data = 'string',
        saved_key = 'LC-' + version + '-' + url + '-' + key;
      LC.storage_.setItem(saved_key, data);
      LC.storage_.setItem(saved_key + ':t', data);
      LC.storage_.setItem(saved_key + ':d', goog.now());
      LC.load(function(err, loaded_data) {
        assertNull(err);
        assertEquals(3, LC.storage_.length);
        assertEquals(data, loaded_data);
        done();
      }, key);
    });

    it('should load multiple ids', function(done) {
      var keys = ['1', '2'],
        data = ['string', 'string2'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'LC-' + version + '-' + url + '-' + keys[i];
        LC.storage_.setItem(saved_key, data[i]);
        LC.storage_.setItem(saved_key + ':t', 'string');
        LC.storage_.setItem(saved_key + ':d', goog.now());
      }
      LC.load(function(err, loaded_data) {
        assertNull(err);
        assertEquals(6, LC.storage_.length);
        assertArrayEquals(data, loaded_data);
        done();
      }, keys);
    });

    it('should delete a single id', function(done) {
      var keys = ['1', '2'],
        data = ['name_1', 'name_2'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'LC-' + version + '-' + url + '-' + keys[i];
        LC.storage_.setItem(saved_key, data[i]);
        LC.storage_.setItem(saved_key + ':t', 'string');
        LC.storage_.setItem(saved_key + ':d', goog.now());
      }
      LC.remove(function(err) {
        assertNull(err);
        assertEquals(3, LC.storage_.length);
        LC.load(function(err, loaded_data) {
          assertNull(err);
          assertEquals(data[1], loaded_data);
          done();
        }, keys[1]);
      }, keys[0]);
    });

    it('should delete multiple ids', function(done) {
      var keys = ['1', '2', '3', '4'],
        data = ['name_1', 'name_2', 'name_3', 'name_4'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'LC-' + version + '-' + url + '-' + keys[i];
        LC.storage_.setItem(saved_key, data[i]);
        LC.storage_.setItem(saved_key + ':t', 'string');
        LC.storage_.setItem(saved_key + ':d', goog.now());
      }
      LC.remove(function(err) {
        assertNull(err);
        assertEquals(6, LC.storage_.length);
        var key_prefix = 'LC-' + version + '-' + url + '-';
        assertEquals(data[1],
          LC.storage_.getItem(key_prefix + keys[1]));
        assertEquals(data[3],
          LC.storage_.getItem(key_prefix + keys[3]));
        done();
      }, [keys[0], keys[2]]);
    });

    describe('types', function() {

      it('should save and return strings', function(done) {
        var key = '1',
          data = 'string';
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err2, loaded_data) {
            assertNull(err2);
            assertTrue(goog.isString(data));
            assertEquals(data, loaded_data);
            done();
          }, key);
        }, key, data);
      });

      it('should save and return numbers', function(done) {
        var key = '1',
          data = 100;
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err2, loaded_data) {
            assertNull(err2);
            assertTrue(goog.isNumber(data));
            assertEquals(data, loaded_data);
            done();
          }, key);
        }, key, data);
      });

      it('should save and return arrays', function(done) {
        var key = '1',
          data = [100, 102, 205];
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err2, loaded_data) {
            assertNull(err2);
            assertTrue(goog.isArray(loaded_data));
            assertArrayEquals(data, loaded_data);
            done();
          }, key);
        }, key, data);
      });

      it('should save and return objects', function(done) {
        var key = '1',
          data = {key1: 'string', key2: 1, key3: [1, '2']};
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err2, loaded_data) {
            assertNull(err2);
            assertTrue(goog.isObject(loaded_data));
            assertObjectEquals(data, loaded_data);
            done();
          }, key);
        }, key, data);
      });

      it('should save and return Date objects', function(done) {
        var key = '1',
          data = new Date();
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err2, loaded_data) {
            assertNull(err2);
            assertTrue(goog.isDateLike(loaded_data));
            assertObjectEquals(data, loaded_data);
            done();
          }, key);
        }, key, data);
      });

    });

    describe('load options', function() {

      it('should only return the fields data', function(done) {
        var key = 'key',
          data = { 'firstName': 'Jon', 'lastName': 'Doe', 'age': 12};
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err, returnData) {
            assertNull(err);
            var expectedData = {'lastName': 'Doe', 'age': 12};
            assertObjectEquals(expectedData, returnData);
            done();
          }, key, { fields: ['lastName', 'age']});
        }, key, data);
      });

      it('should apply fields only on object data', function(done) {
        var key = 'key',
          data = 'test';
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err, returnData) {
            assertTrue(err);
            assertEquals(
              remobid.common.storage.StorageErrorType.LOAD_OPTIONS_FIELDS,
              returnData.message
            );
            done();
          }, key, { fields: ['lastName', 'age']});
        }, key, data);
      });
    });
  });

  describe('cache tests', function() {

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
        LC.setExpireTime(-10);
        LC.load(function(err, data) {
          assertNull(err);
          assertNull(data);
          done();
        },'1');
      }, '1', 'test');
    });

    it('should return array', function(done) {
      LC.store(function(err) {
        assertNull(err);
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err, data) {
            assertNull(err);
            assertArrayEquals(['test1', 'test2'], data);
            done();
          }, ['1', '2']);
        }, '2', 'test2');
      }, '1', 'test1');
    });

    it('should remove expired values on load', function(done) {
      LC.store(function(err) {
        assertNull(err);
        LC.setExpireTime(-10);
        LC.load(function(err, data) {
          assertNull(err);
          assertNull(data);
          assertEquals(0, LC.storage_.length);
          done();
        },'1');
      }, '1', 'test');
    });

    it('should not load unknown key', function(done) {
      LC.store(function(err) {
        assertNull(err);
        LC.load(function(err, data) {
          assertNull(err);
          assertNull(data);
          done();
        },'2');
      }, '1', 'test');
    });

    it('should remove all and only expired values on clear', function(done) {
      LC.storage_.setItem('akeep1', 'alive');
      LC.storage_.setItem('zkeep1', 'alive');
      LC.setExpireTime(-10);
      LC.store(function(err) {
        assertNull(err);
        LC.storage_.setItem('akeep2', 'alive');
        LC.storage_.setItem('zkeep2', 'alive');
        LC.store(function(err) {
          assertNull(err);
          LC.storage_.setItem('LC-1', 'alive');
          LC.storage_.setItem('LC-Z', 'alive');
          LC.clearExpired(function(err) {
            assertEquals(6, LC.storage_.length);
            assertEquals('alive', LC.storage_.getItem('akeep1'));
            assertEquals('alive', LC.storage_.getItem('zkeep1'));
            assertEquals('alive', LC.storage_.getItem('zkeep2'));
            assertEquals('alive', LC.storage_.getItem('akeep2'));
            assertEquals('alive', LC.storage_.getItem('LC-1'));
            assertEquals('alive', LC.storage_.getItem('LC-Z'));
            done();
          });
        }, 'akey', 12);
      }, 'key','test');
    });

    it('should remove expired values if Limit reached', function(done) {
      LC.storage_ = new remobid.test.mock.browser.LocalStorage();
      var org_store = LC.storage_.setItem;
      var org_clearExpire = LC.clearExpired;
      var errorThrown = false;
      LC.setExpireTime(-10);
      LC.store(function(err) {
        assertNull('first storing operation should work fine',
          err);
        LC.storage_.setItem = function() {
          if(!errorThrown) {
            errorThrown = true;
            throw new Error({ name: 'QuotaExceededError'});
          }
          else
            org_store.apply(LC.storage_, arguments);
        };
        LC.store(function(err, data) {
          assertNull('since the setItem not longer throws an error, this should work',
            err
          );
          assertNull('the old data should be deleted',
            LC.storage_.getItem('LC-' + version + '-' + url + '-key')
          );
          assertEquals('the new data should still be there',
            'test2',
            LC.storage_.getItem('LC-' + version + '-' + url + '-key2'));
          done();
        }, 'key2', 'test2');
      }, 'key', 'test');

    });

  });

});
