/**
 * @fileoverview a control for a list item of a lot.
 */

goog.provide('remobid.lots.ui.LotListItem');

goog.require('goog.i18n.NumberFormat');
goog.require('goog.i18n.currency');
goog.require('remobid.common.ui.control.ControlBase');
goog.require('remobid.lots.ui.LotListItemRenderer');

/**
 * @param {remobid.lots.model.Lot} lot
 *    the lot for the list item.
 * @extends {remobid.common.ui.control.ControlBase}
 * @constructor
 */
remobid.lots.ui.LotListItem = function(lot) {
  goog.base(this, lot, remobid.lots.ui.LotListItemRenderer.getInstance());

  if (!goog.isDefAndNotNull(remobid.lots.ui.LotListItem.mappings)) {
    goog.object.extend(
      this.mappings_,
      remobid.lots.ui.LotListItem.helperMappings
    );
    remobid.lots.ui.LotListItem.mappings = this.mappings_;
  }
  else
    this.mappings_ = remobid.lots.ui.LotListItem.mappings;
};
goog.inherits(remobid.lots.ui.LotListItem,
  remobid.common.ui.control.ControlBase);

/**
 * @param {number} value
 *    the amount as a number.
 * @return {String}
 *    the full string with currency symbol, decimal & thousand separator.
 */
remobid.lots.ui.LotListItem.formatCurreny = function(value) {
  return remobid.lots.ui.LotListItem.currencyFormatter.format(value);
};

/**
 * @type {goog.i18n.NumberFormat}
 */
remobid.lots.ui.LotListItem.currencyFormatter = new goog.i18n.NumberFormat(
  goog.i18n.currency.getPortableCurrencyPattern('EUR')
);

/**
 * holds all attribute helper/format functions for this resource type.
 * @type {Object.<remobid.common.ui.control.controlBase.Mapping>}
 */
remobid.lots.ui.LotListItem.helperMappings = {
  'startingPrice' : {
    getter: remobid.lots.ui.LotListItem.formatCurreny
  },
  'soldPrice' : {
    getter: remobid.lots.ui.LotListItem.formatCurreny
  }
};


