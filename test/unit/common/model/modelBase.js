/**
 * @fileoverview
 */

/** @preserveTry */
if (typeof module !== 'undefined' && module.exports) {
  require('nclosure');
}

goog.require('goog.events');
goog.require('goog.testing.asserts');
goog.require('goog.testing.MockClock');
goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.model.ModelBase.EventType');
goog.require('remobid.common.storage.StorageBase');

if (typeof module !== 'undefined' && module.exports) {
  goog.Timer.defaultTimerObject = goog.global;
}

describe('UNIT - ModelBase', function() {
  var Model, clock;

  beforeEach(function(){
    clock = new goog.testing.MockClock(true)
    Model = new remobid.common.model.ModelBase();
    Model.setAutoStore(false);
  });

  afterEach(function() {
    if(!Model.isDisposed())
      Model.dispose(true);
    clock.dispose();
    goog.events.removeAll();
  });

  describe('dispose - ', function() {

    it('should free all references', function() {
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

      Model.prepareChangeEvent();
      var timerId = Model.changedEventTimerId_;
      Model.dispose();
      assertFalse('timer should be deleted',
        clock.isTimeoutSet(timerId)
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

      Model.setSupressChangeEvent(true);
      Model.setIdentifier(123);
      assertEquals('timer should not be created',
        0,
        clock.getTimeoutsMade()
      );
      Model.prepareChangeEvent();
      assertEquals('timer should not be created',
        0,
        clock.getTimeoutsMade()
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
      clock.tick(Model.changedEventDelay_ - 1);
      assertEquals(
        'Event should not be dispatched yet',
        0,
        dispatchCounter
      );
      clock.tick(1);
      assertEquals(
        'Event not dispatched after delay',
        1,
        dispatchCounter
      );
    });
    
    it('should only dispatch only one LOCALLY_CHANGED Event if to setters' +
        'are called within the delay', function(done) {
      var dispatchCounter = 1;

      goog.events.listen(
        Model,
        remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
        function() {
          if(--dispatchCounter <= 0) {
            done();
          }
        }
      );

      Model.setIdentifier(123);
      Model.setRestUrl('www.test.de');
      assertEquals('there should be to 2 timer set',
        2,
        clock.getTimeoutsMade()
      );
      clock.tick(Model.changedEventDelay_);
    });

    it('should dispatch a CHANGED Event if the data is set via' +
        'the updateFromExternal function', function(done) {
      var dispatchCounter = 1;
      goog.events.listen(
        Model,
        remobid.common.model.ModelBase.EventType.CHANGED,
        function() {
          if(--dispatchCounter <= 0) {
            done();
          }
        }
      );
      Model.updateFromExternal({
        'id': 123
      });
      clock.tick(Model.changedEventDelay_);
      Model.setRestUrl('www.test.de');
      assertEquals('there should be to 2 timer set',
        2,
        clock.getTimeoutsMade()
      );
      clock.tick(Model.changedEventDelay_);
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
