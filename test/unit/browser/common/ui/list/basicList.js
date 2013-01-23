/**
 * @fileoverview test for the base class of ui list.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.ui.list.BaseList');
goog.require('remobid.common.model.Collection');
goog.require('remobid.common.model.ModelBase');
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

  });


});
