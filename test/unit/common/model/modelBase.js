/**
 * @fileoverview
 */

/** @preserveTry */
if (typeof module !== 'undefined' && module.exports) {
  require('nclosure');
  originalClock = {
    setTimeout: setTimeout
  };
  mockClock = null;
}

goog.require('goog.events');
goog.require('goog.testing.asserts');
goog.require('goog.testing.MockClock');
goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.model.ModelBase.EventType');
goog.require('remobid.common.storage.StorageBase');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - ModelBase', function() {
  var Model;

  before(function() {
    if (typeof module !== 'undefined' && module.exports) {
      goog.Timer.defaultTimerObject = goog.global;
      mockClock = new goog.testing.MockClock(true);
    }
  });

  beforeEach(function(done){
    Model = new remobid.common.model.ModelBase();
    Model.setAutoStore(false);
    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function() {
    if(!Model.isDisposed())
      Model.dispose(true);
    goog.events.removeAll();
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

    it('should free all internal references', function() {
      Model.dispose();
      assertNull('trackedAttributes not cleared',
        Model.trackedAttributes_
      );
      assertNull('mappings not cleared',
        Model.mappings_
      );
      assertNull('mappings not cleared',
        Model.changedEventTimerId_
      );
      assertNull('listener keys not cleared',
        Model.listenerKeys_
      );
      assertNull('cache reference not cleared',
        Model.cache_
      );
      assertNull('storage reference not cleared',
        Model.storage_
      );
    });

    it('should unlisten from all events', function() {
      var length = Model.listenerKeys_.length;
      Model.setAutoStore(true);
      assertEquals('should added one listener',
        length + 1,
        Model.listenerKeys_.length
      );
      var listenerKey = Model.listenerKeys_[0];
      Model.dispose();
      assertNull('should cleared listener reference',
        Model.listenerKeys_
      );
      assertFalse('the event listener should already be removed',
        goog.events.unlistenByKey(listenerKey)
      );
    });

    it('should remove all timers', function() {
      var Model2 = new remobid.common.model.ModelBase();

      Model2.prepareChangeEvent();
      var timerId = Model2.changedEventTimerId_;
      assertTrue('timer should be set',
        mockClock.isTimeoutSet(timerId)
      );

      Model2.dispose();
      assertFalse('timer should be deleted',
        mockClock.isTimeoutSet(timerId)
      );


    });

    it('should throw an error if there are unsaved attributes', function() {
      Model.setIdentifier('a');
      assertThrows(
        goog.bind(Model.dispose, Model)
      );
      assertNotThrows(
        goog.bind(Model.dispose, Model, true)
      );
    });
  });

  describe('supressed - ', function() {

    it('should not track changes', function() {
      Model.setSupressChangeTracking(true);
      Model.setIdentifier(123);
      assertEquals('there should be no attribute tracked',
        0,
        Model.trackedAttributes_.length
      );
    });

    it('should not fire changeEvents', function() {

      var prevTimerCount = mockClock.getTimeoutsMade();
      Model.setSupressChangeEvent(true);
      Model.setIdentifier(123);
      assertEquals('timer should not be created',
        prevTimerCount,
        mockClock.getTimeoutsMade()
      );
      Model.prepareChangeEvent();
      assertEquals('timer should not be created',
        prevTimerCount,
        mockClock.getTimeoutsMade()
      );


    });
  });

  describe('mappings functionality - ', function() {

    it('should update all known given attributes', function() {
      Model.updateDataViaMappings({
        'id': 123,
        'href': 'www.test.de',
        'unknown': 'b'
      });
      assertEquals('id was not changed',
        123,
        Model.getIdentifier()
      );
      assertEquals('url was not changed',
        'www.test.de',
        Model.getRestUrl()
      );
    });

    it('should use the setterHelper', function(done) {
      var mappingsToDo = 2,
        setterCallCount = 0,
        setterHelperCount = 0;
      var setter = function() {
        setterCallCount++;
        if(--mappingsToDo <= 0)
          finalCheck();
      };
      var setterHelper = function(param) {
        assertEquals('setter helper called for wrong attribute',
          123,
          param
        );
        setterHelperCount++;
        return param;
      };
      var finalCheck = function(){
        assertEquals('setter should be called 2 times',
          2,
          setterCallCount
        );
        assertEquals('setter helper should be called 1 time',
          1,
          setterHelperCount
        );
        done();
      };

      Model.mappings_ = [
        {
          name: 'id',
          getter: goog.nullFunction,
          setter: setter,
          setterHelper: setterHelper
        },
        {
          name: 'href',
          getter: goog.nullFunction,
          setter: setter
        },
        {
          name: 'notGiven',
          getter: goog.nullFunction,
          setter: setter,
          setterHelper: setterHelper
        }
      ];
      Model.updateDataViaMappings({
        'id': 123,
        'href': 'www.test.de',
        'unknown': 'b'
      });
    });

    it('should track the changed variables', function() {
      Model.updateDataViaMappings({
        'id': 123,
        'href': 'www.test.de',
        'unknown': 'b'
      });
      assertArrayEquals('wrong attributes tracked',
        goog.object.getValues(Model.mappings_),
        Model.trackedAttributes_
      )
    });
  });

  describe('Events - ', function() {

    it('should dispatch DELETED Event on dispose', function(done) {
      goog.events.listenOnce(
        Model,
        remobid.common.model.ModelBase.EventType.DELETED,
        function() {
          done();
        }
      );
      Model.dispose();
    });

    it('should dispatch the LOCALLY_CHANGED ' +
        'Event with the set delay', function() {
      var dispatchCounter = 0;

      goog.events.listen(
        Model,
        remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
        function() {
          dispatchCounter++;
        }
      );
      // we have to update some data, otherwise the event would not
      // be dispatched
      Model.updateDataViaMappings({
        'id': 123
      });

      assertEquals(
        'Event should not be dispatched yet',
        0,
        dispatchCounter
      );
      mockClock.tick(Model.changedEventDelay_ - 1);
      assertEquals(
        'Event should not be dispatched yet',
        0,
        dispatchCounter
      );
      mockClock.tick(1);
      assertEquals(
        'Event not dispatched after delay',
        1,
        dispatchCounter
      );


    });
    
    it('should only dispatch only one LOCALLY_CHANGED Event if to setters ' +
        'are called within the delay', function(done) {
      var dispatchCounter = 0;

      var Model2 = new remobid.common.model.ModelBase();
      Model2.setAutoStore(false);
      goog.events.listen(
        Model2,
        remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
        function() {
          dispatchCounter++;
        }
      );

      Model2.setIdentifier(123);
      var firstTimer = Model2.changedEventTimerId_;
      assertTrue('first timer should be set',
        mockClock.isTimeoutSet(firstTimer)
      );
      Model2.setRestUrl('www.test.de');
      var secondTimer = Model2.changedEventTimerId_;
      assertFalse('first timer should not longer be set',
        mockClock.isTimeoutSet(firstTimer)
      );
      assertTrue('second timer should be set',
        mockClock.isTimeoutSet(secondTimer)
      );
      mockClock.tick(Model2.changedEventDelay_ * 2);
      assertEquals('event fired multiple times',
        1,
        dispatchCounter
      );
      done();
    });

    it('should dispatch a CHANGED Event if the data is set via' +
        'the updateFromExternal function', function(done) {
      var dispatchCounter = 1;
      var prevTimerCount = mockClock.getTimeoutsMade();
      goog.events.listen(
        Model,
        remobid.common.model.ModelBase.EventType.CHANGED,
        function() {
          dispatchCounter--;
          assertEquals('event fired multiple times',
            0,
            dispatchCounter
          );
        }
      );
      Model.updateFromExternal({
        'id': 123
      });
      mockClock.tick(Model.changedEventDelay_);
      Model.setRestUrl('www.test.de');
      assertEquals('there should be to 2 timer set',
        prevTimerCount + 2,
        mockClock.getTimeoutsMade()
      );
      mockClock.tick(Model.changedEventDelay_ * 2);
      done();
    });


  });

  describe('Storage - ', function() {

    it('should automaticly store the model', function() {
      var Model2 = new remobid.common.model.ModelBase();
      assertTrue('autoStore should be enabled from the start',
        Model2.isAutoStoreEnabled()
      );
      assertTrue('no listeners set',
        goog.events.hasListener(
          Model2,
          remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED
        )
      );
      Model2.setAutoStore(false);
      assertFalse('autoStore should not be enabled',
        Model2.isAutoStoreEnabled()
      );
      assertFalse('there should be no listeners set',
        goog.events.hasListener(
          Model2,
          remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED
        )
      );
    });

    it('should throw an error if now storage is set', function() {
      var exception = assertThrows('no error thrown if now storage is set',
        goog.bind(Model.store, Model)
      );
      assertEquals('wrong exception thrown',
        remobid.common.model.ModelBase.ErrorType.NO_STORAGE_ENGINE,
        exception.message
      );
      Model.setStorage(new remobid.common.storage.StorageBase());
      assertNotThrows('error thrown even when there is a storage engine set',
        goog.bind(Model.store, Model)
      );
    });
    
  });

});
