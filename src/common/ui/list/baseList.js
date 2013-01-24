/**
 * @fileoverview a base implementation for a list container.
 */

goog.provide('remobid.common.ui.list.BaseList');

goog.require('goog.ui.Container');

/**
 * @param {remobid.common.model.Collection} model
 *    the collection model for this list view.
 * @param {?goog.ui.Container.Orientation=} opt_orientation Container
 *     orientation; defaults to {@code VERTICAL}.
 * @param {goog.ui.ContainerRenderer=} opt_renderer Renderer used to render or
 *     decorate the container; defaults to {@link goog.ui.ContainerRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper, used for document
 *     interaction.
 * @extends {goog.ui.Container}
 * @constructor
 */
remobid.common.ui.list.BaseList = function(
    model, opt_orientation, opt_renderer, opt_domHelper) {
  goog.base(this, opt_orientation, opt_renderer, opt_domHelper);

  this.setModel(model);

  /**
   * a hash map from item identifier to the corresponding control for easier
   * access
   * @type {Object.<string, remobid.common.ui.control.ControlBase>}
   * @private
   */
  this.item2Control_ = {};

  /**
   * @type {function(remobid.common.ui.control.ControlBase,
   *  remobid.common.ui.control.ControlBase):number}
   * @private
   */
  this.sortFunction_ = remobid.common.ui.list.BaseList.defaultSortFunction;
};
goog.inherits(remobid.common.ui.list.BaseList,
  goog.ui.Container);

/** @override */
remobid.common.ui.list.BaseList.prototype.disposeInternal = function() {
  this.removeModelListeners();
  this.getModel().dispose(true);
  goog.base(this, 'disposeInternal');
  this.item2Control_ = null;
};

/**
 * @param {function(remobid.common.ui.control.ControlBase,
 *  remobid.common.ui.control.ControlBase):number} func
 *    Compares two given controls and returns their relative position.
 *    -1 if item2 should be after item1
 *     0 if both are equal
 *     1 if item1 should be after item2.
 */
remobid.common.ui.list.BaseList.prototype.setSortFunction = function(func) {
  this.sortFunction_ = func;
};

/**
 * removes the listeners for ADDED and REMOVED of the list model.
 */
remobid.common.ui.list.BaseList.prototype.removeModelListeners = function() {
  if (this.getModel()) {
    goog.events.unlisten(
      this.getModel(),
      remobid.common.model.collection.EventType.ADDED,
      this.handleModelItemAdded_,
      false,
      this
    );
    goog.events.unlisten(
      this.getModel(),
      remobid.common.model.collection.EventType.REMOVED,
      this.handleModelItemRemoved_,
      false,
      this
    );
  }
};

/** @override */
remobid.common.ui.list.BaseList.prototype.addChild = function(
    control, opt_render) {
  var position = this.getPosition_(control);
  this.addChildAt(control, position, opt_render);
};

/**
 * Gets the position for a new control within the list.
 * @param {remobid.common.ui.control.ControlBase} control
 *    the control to get the position for.
 * @return {Number}
 *    0-index position within this list.
 * @private
 */
remobid.common.ui.list.BaseList.prototype.getPosition_ = function(control) {
  var right = this.getChildCount();
  if (right === 0 ||
      this.sortFunction_(control, this.getChildAt(0)) === -1)
    return 0;
  if (this.sortFunction_(control, this.getChildAt(right - 1)) === 1)
    return right;

  var pos = goog.array.binarySearch(
    this.children_,
    control,
    this.sortFunction_
  );
  return pos >= 0 ? pos : ~pos;
};

/** @override */
remobid.common.ui.list.BaseList.prototype.addChildAt = function(
    control, index, opt_render) {
  goog.base(this, 'addChildAt', control, index, opt_render);
  this.item2Control_[control.getModel().getIdentifier()] =
      control;
  goog.events.listen(
    control.getModel(),
    remobid.common.model.modelBase.EventType.CHANGED,
    this.repositionOnModelChange_,
    false,
    this
  );
};

/**
 * checks if a control has to be repositioned if the model of the control was
 * changed.
 * @param {remobid.common.model.modelBase.Event} event
 *    the event fired by the model.
 * @private
 */
remobid.common.ui.list.BaseList.prototype.repositionOnModelChange_ = function(
    event) {
  var model = event.currentTarget;
  var control = this.item2Control_[model.getIdentifier()];
  var currentPosition = this.indexOfChild(control);
  var prevItem = this.getChildAt(currentPosition - 1);
  var nextItem = this.getChildAt(currentPosition + 1);
  if ((prevItem && this.sortFunction_(prevItem, control) !== -1) ||
      (nextItem && this.sortFunction_(control, nextItem) !== -1)) {
    this.removeChild(control, true);
    this.addChild(control, true);
  }
};

/**
 * @param {remobid.common.model.Collection} model
 *    the collection model for this list view.
 */
remobid.common.ui.list.BaseList.prototype.setModel = function(model) {
  if (this.getModel() === model)
    return;

  this.removeChildren(true);
  this.removeModelListeners();
  goog.base(this, 'setModel', model);
  goog.events.listen(
    model,
    remobid.common.model.collection.EventType.ADDED,
    this.handleModelItemAdded_,
    false,
    this
  );
  goog.events.listen(
    model,
    remobid.common.model.collection.EventType.REMOVED,
    this.handleModelItemRemoved_,
    false,
    this
  );
};

/**
 * callback to handle the event if a item was added to the model list.
 * @param {remobid.common.model.collection.Event} event
 *    the event from the list model.
 * @private
 */
remobid.common.ui.list.BaseList.prototype.handleModelItemRemoved_ = function(
    event) {
  var modelItem = event.getItem();
  this.removeChild(
    this.item2Control_[modelItem.getIdentifier()],
    true
  );
  delete this.item2Control_[modelItem.getIdentifier()];
};

/**
 * callback to handle the event if a item was removed to the model list.
 * @param {remobid.common.model.collection.Event} event
 *    the event from the list model.
 * @private
 */
remobid.common.ui.list.BaseList.prototype.handleModelItemAdded_ = function(
    event) {
  var modelItem = event.getItem();
  var control = new remobid.common.ui.control.ControlBase(modelItem);
  this.addChild(control);
};

/**
 * Compares two given controls and returns their relative position.
 * The default sorting function, will put item2 after item1.
 * @param {remobid.common.ui.control.ControlBase} item1
 *    the first item.
 * @param {remobid.common.ui.control.ControlBase} item2
 *    the second item.
 * @return {Number}
 *   -1 if item2 should be after item1
 *    0 if both are equal
 *    1 if item1 should be after item2.
 */
remobid.common.ui.list.BaseList.defaultSortFunction = function(item1, item2) {
  return -1;
};
