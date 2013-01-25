/**
 * @fileoverview test for the base class of ui list.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.list.BaseList');
goog.require('remobid.common.model.Collection');
goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.ui.control.ControlBase');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - BaseList - ', function() {
  var listModel, list;

  beforeEach(function(done) {
    listModel = new remobid.common.model.Collection();
    list = new remobid.common.ui.list.BaseList(listModel);

    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function() {
    if (!list.isDisposed())
      list.dispose();
  });

  describe('dispose - ', function() {

    it('should fully dispose', function() {
      list.dispose();
      assertTrue('not fully disposed',
        list.isDisposed())
    });

    it('should dispose of the model', function() {
      list.dispose();
      assertTrue('model not disposed',
        listModel.isDisposed())
    });

    it('should remove listeners for old model', function() {
      list.dispose();
      var addedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.ADDED,
        list.handleModelItemAdded_,
        false,
        list
      );
      var removedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.REMOVED,
        list.handleModelItemRemoved_,
        false,
        list
      );
      assertNull('ADDED listener still active',
        addedListener
      );
      assertNull('REMOVED listener still active',
        removedListener
      );
    });

    it('should remove all references', function() {
      list.dispose();
      assertNull('item2control hash map not freed',
        list.item2Control_
      );
    });

  });

  describe('set model - ', function() {

    it('should store the model', function() {
      assertEquals('wrong model saved',
        listModel,
        list.getModel()
      );
    });

    it('should remove all children on model change', function() {
      var child = new goog.ui.Control('aa');
      var itemModel = new remobid.common.model.ModelBase('1');
      child.setModel(itemModel);
      list.addChild(child);
      var listModel2 = new remobid.common.model.Collection();
      list.setModel(listModel);
      assertArrayEquals('child was removed even if the list' +
          ' model was not changed',
        [child],
        list.children_
      );
      list.setModel(listModel2);
      assertArrayEquals('children were not removed',
        [],
        list.children_
      );
    });

    it('should listen for model event', function() {
      var addedListener, removedListener;
      addedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.ADDED,
        list.handleModelItemAdded_,
        false,
        list
      );
      removedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.REMOVED,
        list.handleModelItemRemoved_,
        false,
        list
      );
      assertNotNullNorUndefined('ADDED listener not set',
        addedListener
      );
      assertNotNullNorUndefined('REMOVED listener not set',
        removedListener
      );
    });

    it('should remove listeners for old model', function() {
      var addedListener, removedListener;
      var listModel2 = new remobid.common.model.Collection();
      list.setModel(listModel2);
      addedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.ADDED,
        list.handleModelItemAdded_,
        false,
        list
      );
      removedListener = goog.events.getListener(
        listModel,
        remobid.common.model.collection.EventType.REMOVED,
        list.handleModelItemRemoved_,
        false,
        list
      );
      assertNull('ADDED listener still active',
        addedListener
      );
      assertNull('REMOVED listener still active',
        removedListener
      );
    });

  });

  describe('event model - ', function() {

    it('should remove the control if an item was' +
        ' removed from the list model', function() {
      var child = new goog.ui.Control('aa');
      var itemModel = new remobid.common.model.ModelBase('1');
      child.setModel(itemModel);
      list.addChild(child);
      listModel.dispatchEvent(new remobid.common.model.collection.Event(
        remobid.common.model.collection.EventType.REMOVED,
        itemModel
      ));
      assertArrayEquals('child not removed',
        [],
        list.children_
      );
      assertObjectEquals('child ref not removed',
        {},
        list.item2Control_
      );
    });

    it('should add a control if a new item was' +
        ' added to the list model', function() {
      var itemModel = new remobid.common.model.ModelBase('1');
      listModel.dispatchEvent(new remobid.common.model.collection.Event(
        remobid.common.model.collection.EventType.ADDED,
        itemModel
      ));
      assertTrue('no control added',
        goog.isArray(list.children_)
      );
      assertEquals('no control added',
        1,
        list.children_.length
      );
      assertEquals('control has wrong model',
        itemModel,
        list.children_[0].getModel()
      );
    });

  });

  describe('add control - ', function() {

    it('should add them according to the sortFunction', function() {
      var sortFunction = function(item1, item2) {
        if(item1.getModel().getIdentifier() < item2.getModel().getIdentifier())
          return 1;
        if(item1.getModel().getIdentifier() > item2.getModel().getIdentifier())
          return -1;
      };
      list.setSortFunction(sortFunction);
      var model1 = new remobid.common.model.ModelBase(1);
      var child1 = new remobid.common.ui.control.ControlBase(model1);
      var model2 = new remobid.common.model.ModelBase(2);
      var child2 = new remobid.common.ui.control.ControlBase(model2);
      var model3 = new remobid.common.model.ModelBase(3);
      var child3 = new remobid.common.ui.control.ControlBase(model3);
      list.addChild(child2);
      list.addChild(child3);
      list.addChild(child1);
      assertArrayEquals('model added in wrong order',
        [child3, child2, child1],
        list.children_
      );
      list.removeChildren(true);
      var sortFunction = function(item1, item2) {
        if(item1.getModel().getIdentifier() < item2.getModel().getIdentifier())
          return -1;
        if(item1.getModel().getIdentifier() > item2.getModel().getIdentifier())
          return 1;
      };
      list.setSortFunction(sortFunction);
      list.addChild(child2);
      list.addChild(child3);
      list.addChild(child1);
      assertArrayEquals('no change with different sortFunction',
        [child1, child2, child3],
        list.children_
      );
      model1.dispose(true);
      model2.dispose(true);
      model3.dispose(true);
    });

    it('should listen to CHANGED events of the control and' +
        ' rearrange the sorting if needed', function() {
      var sortFunction = function(item1, item2) {
        if(item1.getModel().sort < item2.getModel().sort)
          return -1;
        if(item1.getModel().sort > item2.getModel().sort)
          return 1;
      };
      list.setSortFunction(sortFunction);
      var model1 = new remobid.common.model.ModelBase(1);
      model1.sort = 1;
      model1.setAutoStore(false);
      var child1 = new remobid.common.ui.control.ControlBase(model1);
      list.addChild(child1);
      var model2 = new remobid.common.model.ModelBase(2);
      model2.sort = 2;
      var child2 = new remobid.common.ui.control.ControlBase(model2);
      list.addChild(child2);
      model1.sort = 3;
      model1.dispatchChangeEvent_();
      assertArrayEquals('model not resorted',
        [child2, child1],
        list.children_
      );
      model1.dispose(true);
      model2.dispose(true);
    });

  });

  describe('remove control - ', function() {

    it('should unlisten to CHANGED event of the control', function() {
      var model1 = new remobid.common.model.ModelBase(1);
      var child1 = new remobid.common.ui.control.ControlBase(model1);
      list.addChild(child1);
      var listenerCounter = goog.events.getListeners(
        model1,
        remobid.common.model.modelBase.EventType.CHANGED,
        false
      ).length;
      list.removeChild(child1);
      assertEquals('listener not removed',
        listenerCounter - 1,
        goog.events.getListeners(
          model1,
          remobid.common.model.modelBase.EventType.CHANGED,
          false
        ).length
      );
    });

  });

});
