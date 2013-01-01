/**
 * @fileoverview tests for the rest storage.
 */

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.testing.asserts');
goog.require('goog.testing.net.XhrIoPool');
goog.require('remobid.common.storage.Rest');

describe('Unit - Rest storage', function () {
  var Rest,
      version = 'v1',
      url = 'users',
      baseUrl;

  beforeEach(function() {
    baseUrl = remobid.common.net.RestManager.defaultBase_ = 'https://api.remobid.com';
    Rest = new remobid.common.storage.Rest(version, url);
    Rest.restManager_.xhrPool_ = new goog.testing.net.XhrIoPool();
  });

  describe('base storage tests', function() {

    // add any tests here should be also added along with all other storage
    // engines

    it('should only except a string,' +
      'number or and array of strings|numbers as ids', function(done) {
      var moreTests = 8;
      var cb = function(err, data) {
        assertTrue(err);
        assertEquals(
          remobid.common.storage.StorageErrorType.INVALID_KEY,
          data.message
        );
        if (--moreTests <= 0)
          done();
      };

      // should be allowed
      Rest.load(cb, null);
      Rest.load(cb);

      Rest.store(cb, null, {});

      // should be not allowed
      Rest.load(cb, {});
      Rest.load(cb, [null]);

      Rest.store(cb, {});
      Rest.store(cb, [null]);

      Rest.remove(cb, {});
      Rest.remove(cb, null);
      Rest.remove(cb);
      Rest.remove(cb, [null]);
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
      Rest.store(cb, '1');
    });

    it('should load a single id', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.load(callback, 1);
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/1',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'GET',
        xhr.getLastMethod()
      );
    });

    it('should load multiple ids', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.load(callback, ['key1', 2]);
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/key1,2',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'GET',
        xhr.getLastMethod()
      );
    });

    it('should delete a single id', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.remove(callback, 2);
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/2',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'DELETE',
        xhr.getLastMethod()
      );
    });

    it('should delete multiple ids', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.remove(callback, ['key1', 2]);
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/key1,2',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'DELETE',
        xhr.getLastMethod()
      );
    });

    it('should store a single id', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.store(callback, 2, {"key": "data"});
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/2',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'PUT',
        xhr.getLastMethod()
      );
      assertEquals('wrong body used',
        '{"key":"data"}',
        xhr.getLastContent()
      );
    });

    it('should store with no id', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.store(callback, null, {"key": "data"});
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'POST',
        xhr.getLastMethod()
      );
      assertEquals('wrong body used',
        '{"key":"data"}',
        xhr.getLastContent()
      );
    });

    it('should store multiple ids', function() {
      var callback = function() {};
      var xhr = Rest.restManager_.xhrPool_.getXhr();
      Rest.store(callback, [1,2], {"key": "data"});
      assertEquals('wrong uri constructed',
        baseUrl + '/v1/users/1,2',
        xhr.getLastUri()
      );
      assertEquals('wrong method used',
        'PUT',
        xhr.getLastMethod()
      );
      assertEquals('wrong body used',
        '{"key":"data"}',
        xhr.getLastContent()
      );
    });

    describe('load options', function() {

      it('should handle fields option', function() {
        var callback = function() {};
        var xhr = Rest.restManager_.xhrPool_.getXhr();
        Rest.load(callback, null, {fields : ['lastName', 'age']});
        assertEquals('wrong uri constructed',
          baseUrl + '/v1/users?fields=lastName,age',
          xhr.getLastUri()
        );
      });

      it('should handle offset and limit', function() {
        var callback = function() {};
        var xhr = Rest.restManager_.xhrPool_.getXhr();
        Rest.load(callback, null, {offset : 25});
        assertEquals('wrong uri constructed',
          baseUrl + '/v1/users?offset=25',
          xhr.getLastUri()
        );
        xhr.abort();
        Rest.load(callback, null, {offset : 25, limit: 50});
        assertEquals('wrong uri constructed',
          baseUrl + '/v1/users?offset=25&limit=50',
          xhr.getLastUri()
        );
      });

    });

  });

  describe('Rest specifics', function() {

    it('should be available only if ' +
        'there is a network connection', function() {
      var netStatus = true;
      Rest.restManager_ = {
        isAvailable : function() {
          return netStatus;
        }
      };
      assertTrue(Rest.isAvailable());
      netStatus = false;
      assertFalse(Rest.isAvailable());
    });

    describe('dispose', function() {

      it('should remove the restMaster_', function() {
        Rest.dispose();
        assertNull(Rest.restManager_);
      });

    });
  });

});
