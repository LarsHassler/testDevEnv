/**
 * @fileoverview declaration of the data model for a lot.
 */

goog.provide('remobid.lots.model.Lot');

goog.require('remobid.common.model.ModelBase');
goog.require('remobid.common.model.Registry');
/**
 *
 * @param {string} id
 *    the identifier of the lot.
 * @extends {remobid.common.model.ModelBase}
 * @constructor
 */
remobid.lots.model.Lot = function(id) {
  goog.base(this, id);

  /**
   * the lot number of this lot
   * @type {string}
   * @private
   */
  this.lotNo_ = '';

  /**
   * the starting price of this lot
   * @type {number}
   * @private
   */
  this.ausruf_ = 0;

  /**
   * the final bid amount at which the lot got awarded
   * @type {number}
   * @private
   */
  this.zuschlag_ = 0;

  /**
   * the sorting value
   * @type {number}
   * @private
   */
  this.sort_ = 0;

  if (!goog.isDefAndNotNull(remobid.lots.model.Lot.mappings)) {
    goog.object.extend(
      this.mappings_,
      remobid.lots.model.Lot.attributeMappings
    );
    remobid.lots.model.Lot.mappings = this.mappings_;
  }
  else
    this.mappings_ = remobid.lots.model.Lot.mappings;

};
goog.inherits(remobid.lots.model.Lot,
  remobid.common.model.ModelBase);

/** @override */
remobid.lots.model.Lot.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};

/**
 * @return {string}
 *    the lot number of this lot.
 */
remobid.lots.model.Lot.prototype.getLotNo = function() {
  return this.lotNo_;
};

/**
 * @param {string} lotNo
 *    the new lot number.
 */
remobid.lots.model.Lot.prototype.setLotNo = function(lotNo) {
  this.lotNo_ = lotNo;
  this.handleChangedAttribute(
    remobid.common.model.ModelBase.attributeMappings.LOTNO);
};


/** static **/

/**
 * holds all created instances of the lot class
 * @type {object.<remobid.lots.model.Lot>}
 * @private
 */
remobid.lots.model.Lot.instances_ = {};

/**
 * manages all created instances of the lot class.
 * @param {string} id
 *    the id of the lot.
 * @return {remobid.lots.model.Lot}
 *    the instance for the given id.
 */
remobid.lots.model.Lot.getResourceById = function(id) {
  var lot;

  if (goog.object.containsKey(remobid.lots.model.Lot.instances_, id)) {
    lot = remobid.lots.model.Lot.instances_[id];
  }
  else {
    lot = new remobid.lots.model.Lot(id);
    goog.events.listenOnce(
      lot,
      remobid.common.model.base.EventType.DELETED,
      function(event) {
        var lot = event.currentTarget;
        delete remobid.lots.model.Lot.instances_[lot.getIdentifier()];
      }
    );
    remobid.lots.model.Lot.instances_[id] = lot;
  }
  return lot;
};

/**
 * holds all attribute mappings for this resource type including the mappings
 * of the parent. This object should be lazy created on the first constructor
 * call for thsi resource type.
 * @type {Object.<remobid.common.model.modelBase.Mapping>}
 */
remobid.lots.model.Lot.mappings;

/**
 * holds all attribute mappings for this resource type.
 * @type {Object.<remobid.common.model.modelBase.Mapping>}
 */
remobid.lots.model.Lot.attributeMappings = {
  LOTNO: {
    name: 'lotNo',
    getter: remobid.lots.model.Lot.prototype.getLotNo,
    setter: remobid.lots.model.Lot.prototype.setLotNo
  }
};

/** register Model **/
(function() {
  remobid.common.model.Registry.getInstance().registerModel(
    'lot',
    remobid.lots.model.Lot
  );
})();
