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
    if(!model.isDisposed())
      model.dispose();
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

  describe('model - ', function() {

    it('should increase the reference counter within ' +
        'the constructor', function() {
      var model2 = new remobid.common.model.ModelBase(2);
      var counter = model2.referenceCounter_;
      var control2 = new remobid.common.ui.control.ControlBase(model2);
      assertEquals('reference counter was not increased',
        counter + 1,
        model2.referenceCounter_
      );
    });

    it('should increase the reference counter on set', function() {
      var model2 = new remobid.common.model.ModelBase(2);
      var counter = model2.referenceCounter_;
      control.setModel(model2);
      assertEquals('reference counter was not increased',
        counter + 1,
        model2.referenceCounter_
      );
    });

    it('should decrease the reference counter on the old model', function() {
      var counter = model.referenceCounter_;
      var model2 = new remobid.common.model.ModelBase(2);
      control.setModel(model2);
      assertEquals('reference counter was not increased',
        counter - 1,
        model.referenceCounter_
      );
    });

  });
});
