/**
 * @fileoverview
 */

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.events');
goog.require('goog.testing.asserts');
goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.model.modelBase.EventType');

describe('UNIT - ModelBase', function() {
  var Model;

  beforeEach(function(){
    Model = new remobid.common.model.ModelBase();
  });

  afterEach(function() {
    if(!Model.isDisposed())
      Model.dispose();
  });

  describe('mappings functionality', function() {

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

    it('should remove the reference' +
        'to the mappings on disposal', function() {
      Model.dispose();
      assertNull('reference should be deleted',
        Model.mappings_);
    });

  });

  describe('Events', function() {

    it('should dispatch DELETED Event on dispose', function(done) {
      goog.events.listenOnce(
        Model,
        remobid.common.model.modelBase.EventType.DELETED,
        function() {
          done();
        }
      );
      Model.dispose();
    });
  });
});