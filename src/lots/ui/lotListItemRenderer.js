/**
 * @fileoverview Singleton Class for the renderer of lot list items.
 */

goog.provide('remobid.lots.ui.LotListItemRenderer');

goog.require('remobid.common.ui.control.ControlBaseRenderer');
goog.require('remobid.templates.lots.lotListItem');


/**
 * Singleton Class for the renderer of lot list items.
 * @extends {remobid.common.ui.control.ControlBaseRenderer}
 * @constructor
 */
remobid.lots.ui.LotListItemRenderer = function() {
  goog.base(this);

  this.setTemplate(remobid.templates.lots.lotListItem.js);
};
goog.inherits(remobid.lots.ui.LotListItemRenderer,
  remobid.common.ui.control.ControlBaseRenderer);
goog.addSingletonGetter(remobid.lots.ui.LotListItemRenderer);
