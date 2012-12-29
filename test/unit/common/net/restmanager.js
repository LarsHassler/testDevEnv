/**
 * @fileoverview
 */

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {
}
goog.require('goog.object');
goog.require('goog.testing.asserts');
goog.require('remobid.common.net.RestManager');

describe('UNIT - restmanager', function () {

  afterEach(function() {
    if(remobid.common.net.RestManager.instances_) {
      goog.object.forEach(
        remobid.common.net.RestManager.instances_,
        function(Manager, index) {
          Manager.dispose();
        }
      );
      remobid.common.net.RestManager.instances_ = null;
    }
  });

  describe('Multi Singleton', function() {
    
    it('should return the same Instance', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      assertNotNull(remobid.common.net.RestManager.instances_);
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      var Manager2 = remobid.common.net.RestManager.getInstance();
      assertEquals(Manager, Manager2);
    });

    it('should store all Instances', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      assertNotNull(remobid.common.net.RestManager.instances_);
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      var Manager2 = remobid.common.net.RestManager.getInstance('test');
      assertEquals(
        'wrong count of instances created',
        2,
        goog.object.getKeys(remobid.common.net.RestManager.instances_).length
      );
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      assertEquals(
        'given base url is wrong',
        'test',
        Manager2.baseUrl_
      );
    });

    it('should be deleted if disposed', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      Manager.dispose();
      assertTrue(
        'parent function was not called',
        Manager.disposed_
      );
      assertObjectEquals(
        'reference to the manager was not deleted',
        {},
        remobid.common.net.RestManager.instances_
      );
    });

    it('should not be disposed if ' +
        'there are still open connections', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      var Manager2 = remobid.common.net.RestManager.getInstance();
      Manager.dispose();
      assertFalse(
        'should not be disposed yet',
        Manager.disposed_
      );
      assertEquals('should not be deleted yet',
        1,
        goog.object.getKeys(remobid.common.net.RestManager.instances_).length);

      Manager2.dispose();
      assertTrue(
        'Manager was not disposed properly',
        Manager.disposed_
      );
      assertObjectEquals(
        'reference to the manager was not deleted',
        {},
        remobid.common.net.RestManager.instances_
      );
    });

  });

  describe('settings', function() {

    it('should store basic authentication', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      Manager.setBasicAuthentication('Aladdin', 'open sesame');
      assertEquals(
        'credentials are not base64 encoded',
        'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
        Manager.headers_['Authorization']
      );
    });

    it('should store oAuth bearer token authentication', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      var token = 'e72e16c7e42f292c6912e7710c838347ae178b4a';
      Manager.setBearerToken(token);
      assertEquals(
        'wrong header format',
        'bearer e72e16c7e42f292c6912e7710c838347ae178b4a',
        Manager.headers_['Authorization']
      );
    });

  });
});
