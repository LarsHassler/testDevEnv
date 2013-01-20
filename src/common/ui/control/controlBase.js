/**
 * @fileoverview base class for a control. Including live binding functionality.
 */

goog.provide('remobid.common.ui.control.ControlBase');
goog.provide('remobid.common.ui.control.controlBase.Mapping');
goog.provide('remobid.common.ui.control.controlBase.Mappings');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.ui.Control');
goog.require('remobid.common.model.modelBase.EventType');
goog.require('remobid.common.ui.control.ControlBaseRenderer');


/**
 * @param {remobid.common.model.ModelBase} model the data model for this
 *    control.
 * @param {remobid.common.ui.control.ControlBaseRenderer=} opt_renderer Renderer
 *    used to render or decorate the component.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *    document interaction.
 * @constructor
 * @extends {goog.ui.Control}
 */
remobid.common.ui.control.ControlBase = function(model, opt_renderer,
    opt_domHelper) {
  var renderer = opt_renderer ||
    remobid.common.ui.control.ControlBaseRenderer.getInstance();

  goog.base(this,
    '',
    renderer,
    opt_domHelper);

  /**
   * holds the data model for this control.
   * @type {?remobid.common.model.ModelBase}
   * @private
   */
  this.model_;

  // call setModel so the control takes affect of the new model
  this.setModel(model);

  /**
   * a reference to the attribute mappings of this control type. Must be
   * extended by all subclasses
   * @type {Object.<remobid.common.ui.control.controlBase.Mapping>}
   * @private
   */
  this.mappings_ = remobid.common.ui.control.controlBase.Mappings;

  /**
   * holds all options for a
   * @type {?Object.<string, Array>}
   * @private
   */
  this.bindOptions_;
};
goog.inherits(remobid.common.ui.control.ControlBase,
  goog.ui.Control);

/** @override */
remobid.common.ui.control.ControlBase.prototype.disposeInternal = function() {
  this.model_.dispose();
  this.mappings_ = null;
  this.bindOptions_ = null;
  goog.base(this, 'disposeInternal');
};

/**
 * Set the new model and also disposes of the old model and increases the
 * reference counter of the new model.
 * It also (un)listen to the model locally_changed event.
 * @param {remobid.common.model.ModelBase} model
 *    the new model for this control.
 */
remobid.common.ui.control.ControlBase.prototype.setModel = function(model) {
  var oldModel = this.getModel();
  if (oldModel) {
    this.getHandler()
      .unlisten(
      oldModel,
      [
        remobid.common.model.modelBase.EventType.CHANGED
      ],
      this.handleChangedEvent_,
      false,
      this
    );
    oldModel.dispose();
  }

  model.increaseReferenceCounter();
  this.getHandler()
    .listen(
      model,
      [
        remobid.common.model.modelBase.EventType.CHANGED
      ],
      this.handleChangedEvent_,
      false,
      this
    );
  goog.base(this, 'setModel', model);
};

/**
 * handles a CHANGED event from the model.
 * @param {remobid.common.model.modelBase.Event} event
 *    the event fired by the model.
 * @private
 */
remobid.common.ui.control.ControlBase.prototype.handleChangedEvent_ = function(
  event) {

};

/**
 * @override
 */
remobid.common.ui.control.ControlBase.prototype.createDom = function() {
  goog.base(this, 'createDom');

  if (!this.bindOptions_) {
    this.bindOptions_ = this.getRenderer().parseBinding(
      this.getElement(),
      this.mappings_
    );
  }
};

/**
 * generates a JSON Object with all necessary data for the templates.
 * @return {Object} the json object.
 */
remobid.common.ui.control.ControlBase.prototype.getModelData = function() {
  var returnData = {};

  goog.object.forEach(this.mappings_, function(mapping) {
    var value = mapping.getter.apply(this.getModel());
    if (goog.isFunction(mapping.getterHelper)) {
      value = mapping.getterHelper(value);
    }
    returnData[mapping.name] = value;
  }, this);

  return returnData;
};

/**
 * @typedef {{name: string, getter: Function, setter: Function,
 *   getterHelper, setterHelper}}
 */
remobid.common.ui.control.controlBase.Mapping;

/**
 * holds all attribute mappings for this resource type.
 * @type {Object.<remobid.common.ui.control.controlBase.Mapping>}
 */
remobid.common.ui.control.controlBase.Mappings = {
  ID: {
    name: 'id',
    getter: remobid.common.model.ModelBase.prototype.getIdentifier,
    setter: remobid.common.model.ModelBase.prototype.setIdentifier
  },
  HREF: {
    name: 'href',
    getter: remobid.common.model.ModelBase.prototype.getRestUrl,
    setter: remobid.common.model.ModelBase.prototype.setRestUrl
  }
};
