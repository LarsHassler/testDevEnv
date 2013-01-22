/**
 * @fileoverview a base implementation for a collection of models.
 */

goog.provide('remobid.common.model.Collection');
goog.provide('remobid.common.model.collection.ErrorType');
goog.provide('remobid.common.model.collection.Event');
goog.provide('remobid.common.model.collection.EventType');

goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('remobid.common.error.BaseError');
goog.require('remobid.common.model.Base');

/**
 * @extends {remobid.common.model.Base}
 * @constructor
 */
remobid.common.model.Collection = function() {
  goog.base(this);

  /**
   * holds all objects of this collection
   * @type {Object.<remobid.common.model.ModelBase>}
   * @private
   */
  this.items_ = {};

  /**
   * The type of the list objects.
   * @type {String}
   * @private
   */
  this.type_ = '';
};
goog.inherits(remobid.common.model.Collection,
  remobid.common.model.Base);

/**
 *
 * @param {string} type
 *    The type of the list objects.
 */
remobid.common.model.Collection.prototype.setType = function(type) {
  this.type_ = type;
};

/**
 *
 * @return {string} The type of the list objects.
 */
remobid.common.model.Collection.prototype.getType = function() {
  return this.type_;
};

/**
 * @override
 */
remobid.common.model.Collection.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.object.forEach(this.items_, function(item) {
    item.dispose();
  });
  this.items_ = null;
};

/**
 * adds an instance of remobid.common.model.ModelBase to the collection
 * the Item has to have an identifier set. Dispatches an {@code ADDED} Event
 * @param {remobid.common.model.ModelBase} item
 *    the item to add.
 */
remobid.common.model.Collection.prototype.addItem = function(item) {
  if (!(item instanceof remobid.common.model.ModelBase))
    throw new remobid.common.error.BaseError(
      remobid.common.model.collection.ErrorType.WRONG_TYPE
    );

  if (!item.getIdentifier())
     throw new remobid.common.error.BaseError(
       remobid.common.model.collection.ErrorType.NO_ID
     );

  goog.object.add(this.items_, item.getIdentifier(), item);
  item.increaseReferenceCounter();
  var event = new remobid.common.model.collection.Event(
    remobid.common.model.collection.EventType.ADDED,
    item
  );
  this.dispatchEvent(event);
};

/**
 * removes an item from the collection. Dispatches an {@code REMOVED} Event
 * @param {remobid.common.model.ModelBase} item
 *    the item to remove.
 */
remobid.common.model.Collection.prototype.removeItem = function(item) {
  goog.object.remove(this.items_, item.getIdentifier());
  var event = new remobid.common.model.collection.Event(
    remobid.common.model.collection.EventType.REMOVED,
    item
  );
  this.dispatchEvent(event);
  item.dispose();
};

/**
 * removes all items from this collection.
 */
remobid.common.model.Collection.prototype.removeAll = function() {
  goog.object.forEach(this.items_, this.removeItem, this);
};

/**
 * @param {remobid.common.model.ModelBase} item
 *    the item to check against the collection.
 * @return {boolean} whenever the item is already in this collection.
 */
remobid.common.model.Collection.prototype.contains = function(item) {
  return goog.object.containsKey(this.items_, item.getIdentifier());
};

/**
 * a class of an special collection event which additionally hold the affected
 * item
 * @param {remobid.common.model.collection.EventType} type
 *    the event type.
 * @param {remobid.common.model.ModelBase} item
 *    the item affected by the event.
 * @extends {goog.event.Event}
 * @constructor
 */
remobid.common.model.collection.Event = function(type, item) {
  goog.base(this, type);

  /**
   * holds the affected item
   * @type {remobid.common.model.ModelBase}
   * @private
   */
  this.item_ = item;
};
goog.inherits(remobid.common.model.collection.Event,
  goog.events.Event);

/**
 * @return {remobid.common.model.ModelBase} the item affected by the event.
 */
remobid.common.model.collection.Event.prototype.getItem = function() {
  return this.item_;
};

/** @enum {string} */
remobid.common.model.collection.EventType = {
  REMOVED: 'item deleted',
  ADDED: 'item added'
};

/** @enum {string} */
remobid.common.model.collection.ErrorType = {
  NO_ID: 'item has no id',
  WRONG_TYPE: 'item is no ModelBase'
};
