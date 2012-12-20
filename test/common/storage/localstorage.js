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

  it('should be available in newer browsers', function() {
    Storage = new remobid.common.storage.LocalStorage();
    if (goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.5') ||
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1') ||
      goog.userAgent.IE && goog.userAgent.isVersion('8')) {
      assertTrue(Storage.isAvailable());
    } else
      assertFalse(Storage.isAvailable());
  });

  describe('implemented', function() {
    beforeEach(function() {
      Storage = new remobid.common.storage.LocalStorage();
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
            var stored_data = window.localStorage.getItem(key);
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
        var key = 'user_2',
          data = {'key' : 1};
        Storage.store(function(err) {
          assertNull(err);
          assertEquals(1, window.localStorage.length);
          var stored_data = window.localStorage.getItem(key);
          assertObjectEquals(data, goog.json.parse(stored_data));
          done();
        }, key, data);
      } else
        done();
    });

    it('should load a single key as a string', function(done) {
      if (Storage.isAvailable()) {
        var key = 'user_3',
           data = 'name_3';
          window.localStorage.setItem(key, data);
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
        var keys = ['user_1', 'user_2'],
          data = ['name_1', 'name_2'];
        for (var i = 0, end = keys.length; i < end; i++) {
          window.localStorage.setItem(keys[i], data[i]);
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
        var keys = ['user_1', 'user_2'],
          data = ['name_1', 'name_2'];
        for (var i = 0, end = keys.length; i < end; i++) {
          window.localStorage.setItem(keys[i], data[i]);
        }
        Storage.delete(function(err) {
          assertNull(err);
          assertEquals(1, window.localStorage.length);
          assertEquals(data[1], window.localStorage.getItem(keys[1]));
          done();
        }, keys[0]);
      } else
        done();
    });

    it('should delete only given keys', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['user_1', 'user_2', 'user_3', 'user_4'],
          data = ['name_1', 'name_2', 'name_3', 'name_4'];
        for (var i = 0, end = keys.length; i < end; i++) {
          window.localStorage.setItem(keys[i], data[i]);
        }
        Storage.delete(function(err) {
          assertNull(err);
          assertEquals(2, window.localStorage.length);
          assertEquals(data[1], window.localStorage.getItem(keys[1]));
          assertEquals(data[3], window.localStorage.getItem(keys[3]));
          done();
        }, [keys[0], keys[2]]);
      } else
        done();
    });
  });

  describe.skip('load options', function() {

  });
});

