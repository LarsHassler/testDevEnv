/**
 * @fileoverview
 */

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {
}

goog.require('goog.testing.asserts');
goog.require('remobid.common.model.ModelBase');

describe('UNIT - ModelBase', function() {

  describe('mappings functionality', function() {
    var Model;

    beforeEach(function(){
      Model = new remobid.common.model.ModelBase();
    });

    afterEach(function() {
      Model.dispose();
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
          name: 'unknown',
          getter: goog.nullFunction,
          setter: setter
        }
      ];
      Model.updateDataViaMappings({'id': 123, 'href': 'www.test.de', 'a': 'b'});
    });

  });
});