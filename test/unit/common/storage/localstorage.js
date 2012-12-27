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


describe('Unit - localstorage', function() {
  var Storage;
  var s_url = 'users';
  var s_version = 'v1';

  describe('base storage tests', function() {

    // add any tests here should be also added along with all other storage
    // engines

    beforeEach(function() {
      Storage = new remobid.common.storage.LocalStorage(s_version, s_url);
    });

    afterEach(function() {
      if (Storage.isAvailable())
        window.localStorage.clear();
    });

    it('should only except a string,' +
        'number or and array of strings|numbers as ids', function(done) {
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

    it('should load a single id', function(done) {
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

    it('should load multiple ids', function(done) {
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

    it('should delete a single id', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['1', '2'],
          data = ['name_1', 'name_2'];
        for (var i = 0, end = keys.length; i < end; i++) {
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
          window.localStorage.setItem(saved_key, data[i]);
        }
        Storage.remove(function(err) {
          assertNull(err);
          assertEquals(1, window.localStorage.length);
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[1];
          assertEquals(data[1], window.localStorage.getItem(saved_key));
          done();
        }, keys[0]);
      } else
        done();
    });

    it('should delete multiple ids', function(done) {
      if (Storage.isAvailable()) {
        var keys = ['1', '2', '3', '4'],
          data = ['name_1', 'name_2', 'name_3', 'name_4'];
        for (var i = 0, end = keys.length; i < end; i++) {
          var saved_key = 'rb-' + s_version + '-' + s_url + '-' + keys[i];
          window.localStorage.setItem(saved_key, data[i]);
        }
        Storage.remove(function(err) {
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

      it('should save and return Date objects', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
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

      it('should apply fields only on object data', function(done) {
        if (Storage.isAvailable()) {
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
        } else
          done();
      });
    });
  });

  describe('Localstorage spesific', function() {

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
});

