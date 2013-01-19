/**
 * @fileoverview Tests for the resource model of a lot.
 */

if (typeof module !== 'undefined' && module.exports) {
  require('nclosure');
  originalClock = {
    setTimeout: setTimeout
  };
  mockClock = null;
}

goog.require('goog.testing.asserts');
goog.require('goog.testing.MockClock');
goog.require('remobid.lots.model.Lot');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - Lot Model -', function() {
  var Lot;

  before(function() {
    if (typeof module !== 'undefined' && module.exports) {
      goog.Timer.defaultTimerObject = goog.global;
      mockClock = new goog.testing.MockClock(true);
    }
  });

  beforeEach(function(done) {
    Lot = new remobid.lots.model.Lot(1);
    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function() {
    if (!Lot.isDisposed())
      Lot.dispose(true);
  });

  describe('dispose - ', function() {

    it('should be disposed', function() {
      Lot.dispose();
      assertTrue('lot not disposed -> parent function not called',
        Lot.isDisposed()
      );
    });

  });

  describe('setter Events - ', function() {

    it('should fire an CHANGE Event on setLotNo', function() {
      var dispatchCounter = 0;

      Lot.setAutoStore(false);
      goog.events.listen(
        Lot,
        remobid.common.model.modelBase.EventType.LOCALLY_CHANGED,
        function() {
          dispatchCounter++;
        }
      );

      Lot.setLotNo('1004A');
      mockClock.tick(Lot.changedEventDelay_ * 2);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

  });

  describe('static registry - ', function() {

    beforeEach(function() {
      remobid.lots.model.Lot.instances_ = {};
    });

    afterEach(function() {
      remobid.lots.model.Lot.instances_ = {};
    });

    it('should return already registered items', function() {
      remobid.lots.model.Lot.instances_[1] = Lot;
      var returnedLot = remobid.lots.model.Lot.getResourceById(1);
      assertEquals('wrong instance returned',
        Lot,
        returnedLot
      );
    });

    it('should return a new instance if model ' +
        'was not requested early', function() {
      remobid.lots.model.Lot.instances_[1] = Lot;
      var returnedLot = remobid.lots.model.Lot.getResourceById(2);
      assertEquals('new instances reference was not saved',
        2,
        goog.object.getCount(remobid.lots.model.Lot.instances_)
      );
      assertEquals('wrong instance returned',
        2,
        returnedLot.getIdentifier()
      );
    });

    it('should remove the reference if model is disposed', function() {
      remobid.lots.model.Lot.instances_[1] = Lot;
      var returnedLot = remobid.lots.model.Lot.getResourceById(2);
      returnedLot.dispose();
      assertTrue('lot not fully disposed',
        returnedLot.isDisposed()
      );
      assertFalse('instance still referenced',
        goog.object.containsKey(remobid.lots.model.Lot.instances_, 2)
      );
    });

  });
});
