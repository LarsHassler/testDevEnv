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


describe('localstorage', function() {
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

  describe('implemented', function() {

    beforeEach(function() {
      Storage = new remobid.common.storage.LocalStorage(s_version, s_url);
    });

    afterEach(function() {
      if (Storage.isAvailable())
        window.localStorage.clear();
    });

    it('should only except a string,' +
        'number or and array of strings|numbers as ids', function(
        done) {
      if (Storage.isAvailable()) {
        var moreTests = 4;
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

      } else {
        done();
      }
    });

    it('should not accept empty data', function(done) {
      if (Storage.isAvailable()) {
        var cb = function(err, data) {
          assertTrue(err);
          assertEquals(
            remobid.common.storage.StorageErrorType.MISSING_DATA,
            data.message
          );
          done();
        };
        Storage.store(cb, '1');
      } else
        done();
    });

    it('should store string data', function(done) {
      if (Storage.isAvailable()) {
        var key, data, moreTests = 2,
          cb = function(err) {
            assertNull(err);
            var saved_key = 'rb-' + s_version + '-' + s_url + '-' + key;
            var stored_data = window.localStorage.getItem(saved_key);
            assertEquals(data, stored_data);
            if (!--moreTests)
              done();
          };

          key = 'user_1';
          data = 'name1';
        Storage.store(cb, key, data);
          key = 1;
          data = 'name1';
        Storage.store(cb, key, data);
      } else
        done();
    });

    it('should store object data', function(done) {
      if (Storage.isAvailable()) {
        var key = '2',
          data = {'key' : 1};
        Storage.store(function(err) {
          assertNull(err);
          assertEquals(2, window.localStorage.length);
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + key;
          var stored_data = window.localStorage.getItem(saved_key);
          assertObjectEquals(data, goog.json.parse(stored_data));
          done();
        }, key, data);
      } else
        done();
    });

    it('should load a single key as a string', function(done) {
      if (Storage.isAvailable()) {
        var key = '3',
            data = 'name_3',
            saved_key = 'rb-' + s_version + '-' + s_url + '-' + key;
          window.localStorage.setItem(saved_key, data);
          Storage.load(function(err, loadedData) {
            assertNull(err);
            assertEquals(data, loadedData);
            done();
          }, key);

      } else {
        done();
      }
    });

    it('should load multiple keys as an array', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['1', '2'],
          data = ['name_1', 'name_2'];
        for (var i = 0, end = keys.length; i < end; i++) {
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
          window.localStorage.setItem(saved_key, data[i]);
        }
        Storage.load(function(err, loadedData) {
          assertNull(err);
          assertArrayEquals(data, loadedData);
          done();
        }, keys);
      } else
        done();
    });

    it('should delete a single key', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['1', '2'],
          data = ['name_1', 'name_2'];
        for (var i = 0, end = keys.length; i < end; i++) {
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
          window.localStorage.setItem(saved_key, data[i]);
        }
        Storage.delete(function(err) {
          assertNull(err);
          assertEquals(1, window.localStorage.length);
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[1];
          assertEquals(data[1], window.localStorage.getItem(saved_key));
          done();
        }, keys[0]);
      } else
        done();
    });

    it('should delete only given keys', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['1', '2', '3', '4'],
          data = ['name_1', 'name_2', 'name_3', 'name_4'];
        for (var i = 0, end = keys.length; i < end; i++) {
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
          window.localStorage.setItem(saved_key, data[i]);
        }
        Storage.delete(function(err) {
          assertNull(err);
          assertEquals(2, window.localStorage.length);
          var key_prefix = 'rb-' + s_version + '-' + s_url + '-';
          assertEquals(data[1],
            window.localStorage.getItem(key_prefix + keys[1]));
          assertEquals(data[3],
            window.localStorage.getItem(key_prefix + keys[3]));
          done();
        }, [keys[0], keys[2]]);
      } else
        done();
    });

    describe('types', function() {
      it('should save and return strings', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
      });

      it('should save and return numbers', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
      });

      it('should save and return arrays', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
      });

      it('should save and return objects', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
      });
    });
  });

  describe('load options', function() {
    it('should only return the fields data', function(done) {
      if (Storage.isAvailable()) {
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
      } else
        done();
    });
  });
});

