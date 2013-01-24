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
    var dispatchCounter, dispatchAttribute, lKey;

    beforeEach(function() {
      dispatchCounter = 0;
      Lot.setAutoStore(false);
      lKey = goog.events.listen(
        Lot,
        remobid.common.model.modelBase.EventType.CHANGED,
        function(event) {
          dispatchCounter++;
          assertEquals('wrong attribute dispatched',
            dispatchAttribute,
            event.attributes[0].attribute
          );
        }
      );
    });

    afterEach(function() {
      dispatchAttribute = null;
      goog.events.unlistenByKey(lKey);
    });

    it('should fire a CHANGE Event on setAuction', function() {
      dispatchAttribute = remobid.lots.model.Lot.attributeMappings.AUCTION;
      Lot.setAuction({});
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setLotNo', function() {
      dispatchAttribute = remobid.lots.model.Lot.attributeMappings.LOTNO;
      Lot.setLotNo('1004A');
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setPicture', function() {
      dispatchAttribute = remobid.lots.model.Lot.attributeMappings.PICTURE;
      Lot.setPicture('2.jpg');
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setStartingPrice', function() {
      dispatchAttribute =
          remobid.lots.model.Lot.attributeMappings.STARTING_PRICE;
      Lot.setStartingPrice(99);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setSoldPrice', function() {
      dispatchAttribute =
        remobid.lots.model.Lot.attributeMappings.SOLD_PRICE;
      Lot.setSoldPrice(99);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setFinished', function() {
      dispatchAttribute =
        remobid.lots.model.Lot.attributeMappings.FINISHED;
      Lot.setFinished(true);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
      Lot.setFinished(true);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched even if the value not changed',
        1,
        dispatchCounter
      );
    });

    it('should fire an CHANGE Event on setCurrentBid', function() {
      dispatchAttribute =
        remobid.lots.model.Lot.attributeMappings.CURRENT_BID;
      Lot.setCurrentBid(109);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire a CHANGE Event on setSession', function() {
      dispatchAttribute =
        remobid.lots.model.Lot.attributeMappings.SESSION;
      Lot.setSession({});
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

    it('should fire a CHANGE Event on setSort', function() {
      dispatchAttribute =
        remobid.lots.model.Lot.attributeMappings.SORT;
      Lot.setSort(101);
      mockClock.tick(Lot.changedEventDelay_);
      assertEquals('event dispatched more then once or not at all',
        1,
        dispatchCounter
      );
    });

  });

  describe('static registry - ', function() {

    beforeEach(function() {
      goog.object.forEach(remobid.lots.model.Lot.instances_, function(lot) {
        lot.dispose();
      });
      remobid.lots.model.Lot.instances_ = {};
    });

    afterEach(function() {
      goog.object.forEach(remobid.lots.model.Lot.instances_, function(lot) {
        lot.dispose();
      });
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

    it('should be registered with the global registry', function() {
      var registry = remobid.common.model.Registry.getInstance();
      assertEquals('not registered',
        remobid.lots.model.Lot,
        registry.getConstructorById('lot')
      );
    });

  });
});
