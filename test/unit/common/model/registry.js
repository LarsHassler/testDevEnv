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
goog.require('remobid.common.model.Registry');

describe('UNIT - Model directory', function () {
  var registry;

  beforeEach(function() {
    registry = new remobid.common.model.Registry();
  });

  afterEach(function(){
    registry.dispose();
  });

  it('should return only registered models', function() {
    var modelConstructor = function() {};

    registry.registerModel('users', modelConstructor);

    assertEquals('wrong constructor returned',
      registry.getConstructorById('users'),
      modelConstructor
    );
    var exception = assertThrows('returned not defined constructor',
      goog.bind(registry.getConstructorById,
        registry,
        'lots'
      )
    );

    assertEquals('wrong exception thrown',
      remobid.common.model.Registry.ErrorType.NOT_FOUND,
      exception.message
    );
  });

  it('should not overwrite constructors', function() {
    var modelConstructor = function() {};
    var modelConstructor2 = function() {};

    registry.registerModel('users', modelConstructor);

    var exception = assertThrows('allowed overwriting via registerModel',
      goog.bind(registry.registerModel,
        registry,
        'users',
        modelConstructor2
      )
    );

    assertEquals('wrong exception thrown',
      remobid.common.model.Registry.ErrorType.ALREADY_REGISTERED,
      exception.message
    );

    assertEquals('wrong constructor returned',
      registry.getConstructorById('users'),
      modelConstructor
    );
  });

  it('should return instances of registered classes', function(done){

    var modelConstructor = function() {};
    modelConstructor.getResourceById = function(id) {
      assertEquals('wrong id transmitted',
        'asdjnfnsgh',
        id
      );
      done();
    }
    registry.registerModel('users', modelConstructor);
    registry.getResource('users', 'asdjnfnsgh');
  });

});