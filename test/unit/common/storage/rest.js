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

    it.skip('should only except a string,' +
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

      Rest.load(cb, {});
      Rest.load(cb, null);
      Rest.load(cb);
      Rest.load(cb, [null]);

      Rest.store(cb, {});
      Rest.store(cb, null);
      Rest.store(cb);
      Rest.store(cb, [null]);

      Rest.remove(cb, {});
      Rest.remove(cb, null);
      Rest.remove(cb);
      Rest.remove(cb, [null]);
    });

    it.skip('should not accept empty data', function(done) {

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

    it.skip('should delete multiple ids', function(done) {

    });

    describe.skip('types', function() {

      it('should save and return strings', function(done) {

      });

      it('should save and return numbers', function(done) {

      });

      it('should save and return arrays', function(done) {

      });

      it('should save and return objects', function(done) {

      });

      it('should save and return Date objects', function(done) {

      });
    });

    describe.skip('load options', function() {

      it('should only return the fields data', function(done) {

      });

      it('should apply fields only on object data', function(done) {

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
