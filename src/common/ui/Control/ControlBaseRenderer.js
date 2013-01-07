/**
 * @fileoverview base class for base control rendering.
 */

goog.provide('remobid.common.ui.control.ControlBaseRenderer');

goog.require('goog.soy');
goog.require('goog.ui.ControlRenderer');
goog.require('remobid.templates.test');


/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
remobid.common.ui.control.ControlBaseRenderer = function() {
  goog.base(this);

};
goog.inherits(remobid.common.ui.control.ControlBaseRenderer,
  goog.ui.ControlRenderer);
goog.addSingletonGetter(remobid.common.ui.control.ControlBaseRenderer);

/**
 * @param {remobid.common.ui.control.ControlBase} control the control to render.
 * @return {!Node} the HTML element for the control.
 */
remobid.common.ui.control.ControlBaseRenderer.prototype.createDom = function(
    control) {

  var element = goog.soy.renderAsFragment(remobid.templates.test.modelDisplay,
    control.getModelData());

  this.setAriaStates(control, element);
  return element;
};
