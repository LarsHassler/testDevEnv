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
      LC.storage_ = remobid.test.mock.browser.LocalStorage.getInstance();
    }
  });

  afterEach(function(){
    LC.storage_.clear();
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
      LC.setExpireTime(-10);
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
