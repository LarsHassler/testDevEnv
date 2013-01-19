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
      assertEquals('model was not saved within control',
        model2,
        control2.getModel()
      );
      control2.dispose();
      model2.dispose();
    });

    it('should increase the reference counter', function() {
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
      assertEquals('reference counter was not decreased',
        counter - 1,
        model.referenceCounter_
      );
    });

    it('should listen to LOCALLY_CHANGED and CHANGED events', function() {
      var model2 = new remobid.common.model.ModelBase(2);
      model2.setAutoStore(false);
      var controlCount = control.getHandler().getListenerCount();
      var eventHandlerCount = 0;
      control.handleChangedEvent_ = function() {
        eventHandlerCount++;
      };
      control.setModel(model2);
      assertEquals('listeners not set on Handler of the control',
        controlCount + 2,
        control.getHandler().getListenerCount()
      );
      model2.dispatchEvent(remobid.common.model.modelBase.EventType.CHANGED);
      assertEquals('callback for CHANGED event not called',
        1,
        eventHandlerCount
      );
      model2.dispatchEvent(
        remobid.common.model.modelBase.EventType.LOCALLY_CHANGED
      );
      assertEquals('callback for LOCALLY_CHANGED event not called',
        2,
        eventHandlerCount
      );
    });

    it('should remove listeners to LOCALLY_CHANGED and ' +
        'CHANGED events of the old model', function() {
      model.setAutoStore(false);
      var model2 = new remobid.common.model.ModelBase(2);
      model2.setAutoStore(false);
      var eventHandlerCount = 0;
      control.handleChangedEvent_ = function() {
        eventHandlerCount++;
      };
      control.setModel(model2);
      control.setModel(model);
      model2.dispatchEvent(remobid.common.model.modelBase.EventType.CHANGED);
      assertEquals('callback for CHANGED event has been called',
        0,
        eventHandlerCount
      );
      model2.dispatchEvent(
        remobid.common.model.modelBase.EventType.LOCALLY_CHANGED
      );
      assertEquals('callback for LOCALLY_CHANGED ' +
          'event has been called',
        0,
        eventHandlerCount
      );
    });

  });
});
