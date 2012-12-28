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
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      var Manager2 = remobid.common.net.RestManager.getInstance('test');
      assertEquals(
        2,
        goog.object.getKeys(remobid.common.net.RestManager.instances_).length
      );
      assertEquals(
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      assertEquals(
        'test',
        Manager2.baseUrl_
      );
    });

    it('should be deleted if disposed', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      Manager.dispose();
      assertObjectEquals({}, remobid.common.net.RestManager.instances_);
    });

  });
});
