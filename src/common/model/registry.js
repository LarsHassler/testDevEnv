/**
 * @fileoverview a static registry for all remobid model types.
 */

goog.provide('remobid.common.model.Registry');
goog.provide('remobid.common.model.Registry.ErrorType');

goog.require('goog.Disposable');
goog.require('goog.object');

/**
 * creates a new instance. Should only be used for testing, otherwise use the
 * singleton getter .getInstance().
 * @constructor
 * @extends {goog.Disposable}
 */
remobid.common.model.Registry = function() {
  /**
   * holds all registered model constructors
   * @type {Object.<string, Function>}
   * @private
   */
  this.registry_ = {};
};
goog.inherits(remobid.common.model.Registry, goog.Disposable);
goog.addSingletonGetter(remobid.common.model.Registry);

/** @override */
remobid.common.model.Registry.prototype.disposeInternal = function() {
  goog.object.clear(this.registry_);
  this.registry_ = null;
};

/**
 * globally registered a model constructor
 * @param {string} id identifier of the model resource.
 * @param {Function} constr the constructor function of the model class.
 */
remobid.common.model.Registry.prototype.registerModel = function(id, constr) {
  if (goog.object.containsKey(this.registry_, id)) {
    // TODO change to remobid error instance
    throw new Error(
      remobid.common.model.Registry.ErrorType.ALREADY_REGISTERED);
  }
  if (!goog.isFunction(constr.getResourceById)) {
    // TODO change to remobid error instance
    throw new Error(
      remobid.common.model.Registry.ErrorType.MISSING_FUNCTION);
  }
  goog.object.add(this.registry_, id, constr);
};

/**
 * returns the constructor function of a registered model. throws an
 * {@code NOT_FOUND} Exception if an unregistered model is requested.
 * @param {string} id the id of the registered model.
 * @return {Function} the constructor function.
 */
remobid.common.model.Registry.prototype.getConstructorById = function(id) {
  if (goog.object.containsKey(this.registry_, id)) {
    return this.registry_[id];
  }

  // TODO change to remobid error instance
  throw new Error(remobid.common.model.Registry.ErrorType.NOT_FOUND);
};

/**
 *
 * @param {string} modelId the id of the registered model.
 * @param {string|number} resourceId the id of the resource.
 * @return {remobid.common.model.ModelBase} the instance for the given
 *    combination.
 */
remobid.common.model.Registry.prototype.getResourceById = function(
    modelId, resourceId) {
  var constr = this.getConstructorById(modelId);

  if (!constr) {
    // TODO change to remobid error instance
    throw new Error(
      remobid.common.model.Registry.ErrorType.NOT_FOUND);
  }
  return constr.getResourceById(resourceId);
};


/**
 * @enum {string}
 */
remobid.common.model.Registry.ErrorType = {
  NOT_FOUND: 'constructor not found',
  ALREADY_REGISTERED: 'this id is already registered',
  MISSING_FUNCTION: 'constructor is missing the getResourceById fucntion'
};
