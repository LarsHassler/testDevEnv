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
goog.require('remobid.common.storage.Rest');

describe('Unit - Rest storage', function () {
  var Rest,
      version = 'v1',
      url = 'users';

  beforeEach(function() {
    Rest = new remobid.common.storage.Rest(version, url);
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

    it.skip('should load a single id', function(done) {

    });

    it.skip('should load multiple ids', function(done) {

    });

    it.skip('should delete a single id', function(done) {

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
