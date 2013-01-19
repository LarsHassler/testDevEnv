/**
 * @fileoverview Test for the basic control base class.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.control.ControlBase');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - ControlBase -', function() {
  var control, model;

  beforeEach(function(done) {
    model = new remobid.common.model.ModelBase(1);
    control = new remobid.common.ui.control.ControlBase(model);
    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function() {
    if(!control.isDisposed())
      control.dispose();
  });
  
  describe('dispose', function() {
    
    it('should remove all references', function() {
      control.dispose();
      assertNull('mapping reference not removed',
        control.mappings_
      );
      assertNull('binding options reference not removed',
        control.bindOptions_
      );
      assertTrue('control was not fully disposed',
        control.isDisposed()
      );
    });

    it('should dispose the model', function() {
      var oldCounter = model.referenceCounter_;
      control.dispose();
      assertEquals('model was not diposed',
        oldCounter-1,
        model.referenceCounter_
      );
    });

    
  });

});
