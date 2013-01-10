// This file was automatically generated from testTemplate.soy.
// Please don't edit this file by hand.

goog.provide('remobid.templates.test');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
remobid.templates.test.modelDisplay = function(opt_data, opt_ignored) {
  return '<div class="rb-modelTest" style="border:1px; height 30px; min-width:30px"><span class="rb-modelTest-href" data-rb-bind-get="href,html,1,0|id,tglClass:color,1,0" >' + soy.$$escapeHtml(opt_data.modelData['href']) + '</span></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
remobid.templates.test.modelForm = function(opt_data, opt_ignored) {
  return '<div class="rb-form"><input type="text" value="' + soy.$$escapeHtml(opt_data.modelData['href']) + '" data-rb-set="href"/></div>';
};
