/**
 * @fileoverview Tests for
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');


goog.require('goog.testing.asserts');
goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.model.Collection');
goog.require('remobid.common.model.collection.ErrorType');
goog.require('remobid.common.model.collection.Event');
goog.require('remobid.common.model.collection.EventType');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - Collection', function () {
  var Coll;

  beforeEach(function (done) {
    Coll = new remobid.common.model.Collection();
    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function () {
    goog.events.removeAll(Coll);
    if (!Coll.isDisposed()) {
      Coll.dispose();
    }
  });

  describe('dispose - ', function() {

    it('should dispose all items', function() {
      Coll.dispose();
      assertNull('items object should be dereferenced',
        Coll.items_);
    });

    it('should remove the references to the items', function() {
      var Item = new remobid.common.model.ModelBase('a');
      Coll.addItem(Item);
      // dispose the Item first to decrease the reference counter
      Item.dispose();
      Coll.dispose();
      assertTrue('the item schould be disposed',
        Item.isDisposed()
      )
    });

    it('should fire an base-DELETED Event', function() {
      var cbCounter = 0;
      goog.events.listen(
        Coll,
        remobid.common.model.base.EventType.DELETED,
        function() {
          cbCounter++;
        }
      );
      Coll.dispose();
      assertEquals('Deleted event fired to often or not at all',
        1,
        cbCounter
      );
    });

  });

  describe('adding item', function() {

    it('should only accept items of type ModelBase', function() {
      var item = {};
      var e = assertThrows('pure js object accepted',
        goog.bind(Coll.addItem, Coll, item)
      );
      assertEquals('wrong Exception thrown',
        remobid.common.model.collection.ErrorType.WRONG_TYPE,
        e.errorType
      );
    });

    it('should only add items with an identifier', function() {
      var item = new remobid.common.model.ModelBase(null);
      var e = assertThrows('should not accept model without an identifier',
        goog.bind(Coll.addItem, Coll, item)
      );
      assertEquals('wrong Exception thrown',
        remobid.common.model.collection.ErrorType.NO_ID,
        e.errorType
      );
      item.dispose();
    });

    it('should fire an Collection-ADDED event', function() {
      var cbCounter = 0;
      var item = new remobid.common.model.ModelBase(1);
      goog.events.listen(
        Coll,
        remobid.common.model.collection.EventType.ADDED,
        function(event) {
          assertTrue('wrong Event instance dispatched',
            event instanceof remobid.common.model.collection.Event
          );
          assertEquals('wrong item attached to the event',
            item,
            event.getItem()
          );
          cbCounter++;
        }
      );
      Coll.addItem(item);
      assertEquals('ADDED Event was not call at all or called to often',
        1,
        cbCounter
      );
      item.dispose();
    });

    it('should increment the reference counter ' +
      'of the added item', function() {
      var item = new remobid.common.model.ModelBase(1);
      assertEquals('item reference counter should be one after initialization',
        1,
        item.referenceCounter_
      );
      Coll.addItem(item);
      assertEquals('item reference counter should be incremented',
        2,
        item.referenceCounter_
      );
      // dispose Item to decrease the reference counter
      item.dispose();
    });

    it('should be saved within the collection', function() {
      var item = new remobid.common.model.ModelBase(1);
      Coll.addItem(item);
      assertTrue('item not added to collection',
        Coll.contains(item)
      );
      item.dispose();
    });

  });

  describe('removing item', function() {

    it('should fire an Collection-REMOVED event', function() {
      var cbCounter = 0;
      var item = new remobid.common.model.ModelBase(1);
      Coll.addItem(item);
      goog.events.listen(
        Coll,
        remobid.common.model.collection.EventType.REMOVED,
        function(event) {
          assertTrue('wrong Event instance dispatched',
            event instanceof remobid.common.model.collection.Event
          );
          assertEquals('wrong item attached to the event',
            item,
            event.getItem()
          );
          cbCounter++;
        }
      );
      Coll.removeItem(item);
      assertEquals('REMOVED Event was not call at all or called to often',
        1,
        cbCounter
      );
      item.dispose();
    });

    it('should decrement the reference counter ' +
        'or dispose of the added item', function() {
      var item = new remobid.common.model.ModelBase(1);
      Coll.addItem(item);
      Coll.removeItem(item);
      assertEquals('item reference counter should be decreamented',
        1,
        item.referenceCounter_
      );
      item.dispose();
    });

    it('should be removed from the collection', function() {
      var item = new remobid.common.model.ModelBase(1);
      Coll.addItem(item);
      assertTrue('item not added to collection',
        Coll.contains(item)
      );
      Coll.removeItem(item);
      assertFalse('item not removed to collection',
        Coll.contains(item)
      );
      item.dispose();
    });

    it('should be able to remove all items', function() {
      var item = new remobid.common.model.ModelBase(1);
      var item2 = new remobid.common.model.ModelBase(2);
      Coll.addItem(item);
      Coll.addItem(item2);
      Coll.removeAll();
      assertEquals('item reference counter should be decreamented',
        1,
        item.referenceCounter_
      );
      assertEquals('item2 reference counter should be decreamented',
        1,
        item2.referenceCounter_
      );
      assertObjectEquals('items not removed from the collection',
        {},
        Coll.items_
      );
      item.dispose();
      item2.dispose();
    });

  });


});
