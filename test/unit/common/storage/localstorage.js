/**
 * @fileoverview tests for a html5 localstorage engine.
*/

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {}

goog.require('goog.testing.asserts');
goog.require('goog.userAgent');
goog.require('remobid.common.storage.LocalStorage');
goog.require('remobid.common.storage.StorageErrorType');
goog.require('remobid.test.mock.browser.LocalStorage');

describe('Unit - localstorage', function() {
  var Storage;
  var s_url = 'users';
  var s_version = 'v1';


  describe('base storage tests', function() {

    // add any tests here should be also added along with all other storage
    // engines

    beforeEach(function() {
      Storage = new remobid.common.storage.LocalStorage(s_version, s_url);
      try {
        var t = window && window.localStorage && window.localStorage.getItem;
      } catch (e) {
        Storage.storage_ = /** @type {Storage} */ remobid.test.mock.browser.LocalStorage.getInstance();
      }
    });

    afterEach(function() {
      if (Storage.isAvailable())
        Storage.storage_.clear();
    });

    it('should only except a string,' +
        'number or and array of strings|numbers as ids', function(done) {
        var moreTests = 12;
        var cb = function(err, data) {
          assertTrue(err);
          assertEquals(
            remobid.common.storage.StorageErrorType.INVALID_KEY,
            data.message
          );
          if (!--moreTests)
            done();
        };

        Storage.store(cb, {});
        Storage.store(cb, null);
        Storage.store(cb);
        Storage.store(cb, [null]);

        Storage.load(cb, {});
        Storage.load(cb, null);
        Storage.load(cb);
        Storage.load(cb, [null]);

        Storage.remove(cb, {});
        Storage.remove(cb, null);
        Storage.remove(cb);
        Storage.remove(cb, [null]);
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
      Storage.store(cb, '1');
    });

    it('should load a single id', function(done) {
      var key = '3',
          data = 'name_3',
          saved_key = 'rb-' + s_version + '-' + s_url + '-' + key;
      Storage.storage_.setItem(saved_key, data);
      Storage.storage_.setItem(saved_key + ':t', data);
        Storage.load(function(err, loadedData) {
          assertNull(err);
          assertEquals(2, Storage.storage_.length);
          assertEquals(data, loadedData);
          done();
        }, key);
    });

    it('should load multiple ids', function(done) {
      var keys = ['1', '2'],
        data = ['name_1', 'name_2'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
        Storage.storage_.setItem(saved_key, data[i]);
        Storage.storage_.setItem(saved_key + ':t', 'string');
      }
      Storage.load(function(err, loadedData) {
        assertNull(err);
        assertEquals(4, Storage.storage_.length);
        assertArrayEquals(data, loadedData);
        done();
      }, keys);
    });

    it('should delete a single id', function(done) {
      var keys = ['1', '2'],
        data = ['name_1', 'name_2'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
        Storage.storage_.setItem(saved_key, data[i]);
        Storage.storage_.setItem(saved_key + ':t', 'string');
      }
      Storage.remove(function(err) {
        assertNull(err);
        assertEquals(2, Storage.storage_.length);
        var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[1];
        assertEquals(data[1], Storage.storage_.getItem(saved_key));
        done();
      }, keys[0]);
    });

    it('should delete multiple ids', function(done) {
      var keys = ['1', '2', '3', '4'],
        data = ['name_1', 'name_2', 'name_3', 'name_4'];
      for (var i = 0, end = keys.length; i < end; i++) {
        var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
        Storage.storage_.setItem(saved_key, data[i]);
        Storage.storage_.setItem(saved_key + ':t', 'string');
      }
      Storage.remove(function(err) {
        assertNull(err);
        assertEquals(4, Storage.storage_.length);
        var key_prefix = 'rb-' + s_version + '-' + s_url + '-';
        assertEquals(data[1],
          Storage.storage_.getItem(key_prefix + keys[1]));
        assertEquals(data[3],
          Storage.storage_.getItem(key_prefix + keys[3]));
        done();
      }, [keys[0], keys[2]]);
    });

    describe('types', function() {
      it('should save and return strings', function(done) {
        var key = '1',
            data = 'string';
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err2, loaded_data) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err2, loaded_data) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err2, loaded_data) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err2, loaded_data) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err2, loaded_data) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err, returnData) {
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
        Storage.store(function(err) {
          assertNull(err);
          Storage.load(function(err, returnData) {
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

  describe('Localstorage spesific', function() {

    it('should be available in newer browsers', function() {
      Storage = new remobid.common.storage.LocalStorage(s_version, s_url);
      if (goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.5') ||
        goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1') ||
        goog.userAgent.IE && goog.userAgent.isVersion('8') ||
        goog.userAgent.OPERA && goog.userAgent.isVersion('12.1')) {
        assertTrue(Storage.isAvailable());
      } else
        assertFalse(Storage.isAvailable());
    });

  });

});

