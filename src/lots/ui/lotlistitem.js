/**
 * @fileoverview a control for a list item of a lot.
 */

goog.provide('remobid.lots.ui.LotListItem');

goog.require('remobid.common.ui.control.ControlBase');

/**
 * @param {remobid.lots.model.Lot} lot
 *    the lot for the list item.
 * @extends {remobid.common.ui.control.ControlBase}
 * @constructor
 */
remobid.lots.ui.LotListItem = function(lot) {
  goog.base(this, lot);

};
goog.inherits(remobid.lots.ui.LotListItem,
  remobid.common.ui.control.ControlBase);
