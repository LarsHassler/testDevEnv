// This file was automatically generated from lotListItem.soy.
// Please don't edit this file by hand.

goog.provide('remobid.templates.lots.lotListItem');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
remobid.templates.lots.lotListItem.js = function(opt_data, opt_ignored) {
  return '<div class="rb-lot"><div class="rb-lot-pic"><img src="' + soy.$$escapeHtml(opt_data.modelData['picture']) + '" data-rb-bind-get="picture,chAttr:src"></div><div class="rb-lot-lotno" data-rb-bind-get="lotNo,text">' + soy.$$escapeHtml(opt_data.modelData['lotNo']) + '</div><div class="rb-lot-prices"><div class="rb-lot-start" data-rb-bind-get="startingPrice,text,1">' + soy.$$escapeHtml(opt_data.modelData['startingPrice']) + '</div><div class="rb-lot-bid"></div></div><div></div>';
};
