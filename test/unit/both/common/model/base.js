/**
 * @fileoverview Tests for
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');


goog.require('goog.testing.asserts');
goog.require('remobid.common.model.Base');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - Base class - ', function () {
  var Model;

  beforeEach(function (done) {
    Model = new remobid.common.model.Base();
    remobid.test.mock.Utilities.clearStack(done);
  });

  describe('dispose - ', function() {

    it('should only dispose if there are no references' +
      ' to this model left', function() {
      assertEquals('there should be only one reference at the start',
        1,
        Model.referenceCounter_
      );
      Model.increaseReferenceCounter();
      assertEquals('reference counter not increased',
        2,
        Model.referenceCounter_
      );
      Model.dispose();
      assertEquals('reference counter not decreased',
        1,
        Model.referenceCounter_
      );
      assertFalse('model should not been disposed of yet',
        Model.isDisposed()
      );
      Model.dispose();
      assertTrue('model should now been disposed of yet',
        Model.isDisposed()
      );
    });

  });

  describe('Events - ', function() {

    it('should dispatch DELETED Event on dispose', function(done) {
      goog.events.listenOnce(
        Model,
        remobid.common.model.base.EventType.DELETED,
        function() {
          done();
        }
      );
      Model.dispose();
    });

  });

});
