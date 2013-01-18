/**
 * @fileoverview declaration of the data model for a lot.
 */

goog.provide('remobid.lots.model.Lot');

goog.require('remobid.common.model.ModelBase');

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

  goog.object.extend(this.mappings_,
    remobid.lots.model.Lot.attributeMappings);
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


/**
 * holds all attribute mappings for this resource type.
 * @type {Object.<remobid.common.model.modelBase.Mapping>}
 */
remobid.lots.model.Lot.attributeMappings = {
  LOTNO: {
    name: 'lotNo',
    getter: remobid.common.model.ModelBase.prototype.getLotNo,
    setter: remobid.common.model.ModelBase.prototype.setLotNo
  }
};
