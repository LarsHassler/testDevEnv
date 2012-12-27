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
      var moreTests = 4;
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
        data = 'string';
      LC.store(function(err) {
        assertNull(err);
        LC.load(function(err2, loaded_data) {
          assertNull(err2);
          assertEquals(data, loaded_data);
          done();
        }, key);
      }, key, data);
    });

    it('should load multiple ids', function(done) {
      var key = '1',
        data = 'string',
        key2 = '2',
        data2 = 'string2';
      LC.store(function(err) {
        assertNull(err);
        LC.store(function(err) {
          assertNull(err);
          LC.load(function(err, loaded_data) {
            assertNull(err);
            assertArrayEquals([data, data2], loaded_data);
            done();
          }, [key, key2]);
        }, key2, data2);
      }, key, data);
    });

    it('should delete a single id', function(done) {
      var key = '1',
        data = 'string',
        key2 = '2',
        data2 = 'string2';
      LC.store(function(err) {
        assertNull(err);
        LC.store(function(err) {
          assertNull(err);
          LC.remove(function(err) {
            assertNull(err);
            assertEquals(3, LC.storage_.length);
            LC.load(function(err, loaded_data) {
              assertNull(err);
              assertEquals(data2, loaded_data);
              done();
            }, key2);
          }, key);
        }, key2, data2);
      }, key, data);
    });

    it('should delete multiple ids', function(done) {
      var key = '1',
        data = 'string',
        key2 = '2',
        data2 = 'string2',
        key3 = '3',
        data3 = 'string3';
      LC.store(function(err) {
        assertNull(err);
        LC.store(function(err) {
          assertNull(err);
          LC.store(function(err) {
            assertNull(err);
            LC.remove(function(err) {
              assertNull(err);
              assertEquals(3, LC.storage_.length);
              LC.load(function(err, loaded_data) {
                assertNull(err);
                assertEquals(data2, loaded_data);
                done();
              }, key2);
            }, [key, key3]);
          }, key3, data3);
        }, key2, data2);
      }, key, data);
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
      var org_store = LC.storage_.setItem;
      var org_clearExpire = LC.clearExpired;
      LC.setExpireTime(-10);
      LC.store(function(err) {
        assertNull(err);
        LC.storage_.setItem = function() {
          throw new Error('QUOTA');
        };
        LC.clearExpired = function(cb) {
          LC.storage_.setItem = org_store;
          org_clearExpire.apply(LC, arguments);
        };
        LC.store(function(err) {
          assertNull(err);
          assertNull(LC.storage_.getItem('LC-' + version + '-' + url + '-key'));
          assertEquals('test2',
            LC.storage_.getItem('LC-' + version + '-' + url + '-key2'));
          done();
        }, 'key2', 'test2');
      }, 'key', 'test');
    });

  });

});
