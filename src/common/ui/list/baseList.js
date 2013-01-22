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
};
goog.inherits(remobid.common.ui.list.BaseList,
  goog.ui.Container);

/**
 * @param {remobid.common.model.Collection} model
 *    the collection model for this list view.
 */
remobid.common.ui.list.BaseList.prototype.setModel = function(model) {
  if (this.getModel() === model)
    return;

  this.removeChildren(true);
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
  // TODO implement
};

/**
 * callback to handle the event if a item was removed to the model list.
 * @param {remobid.common.model.collection.Event} event
 *    the event from the list model.
 * @private
 */
remobid.common.ui.list.BaseList.prototype.handleModelItemAdded_ = function(
    event) {
  // TODO implement
};
