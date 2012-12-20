/**
 * @fileoverview Interface for all storage classes.
 */

goog.provide('remobid.common.storage.StorageInterface');

/**
 *
 * @param {string} version Rest version url to the data resource.
 * @param {string} resourceId identifier for the resource.
 * @interface
 */
remobid.common.storage.StorageInterface = function() {};

/**
 * loads data for a given id, set of ids or by a filter
 * @param {function(err,data)} callback the callback function which is called
 *    after the action is completed.
 * @param {null|string|number|Array} id single id, set of ids or null for all
 *    entries - maybe filtered by the options.
 * @param {{offset: number?,
 *     limit: number?,
 *     fields: Array.<string>}} opt_option a set of options like
 */
remobid.common.storage.StorageInterface.prototype.load;

/**
 * stores the given data for the given id
 * @param {function(err)} callback the callback function which is called
 *    after the action is completed.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 * @param {Object} data the data to store.
 */
remobid.common.storage.StorageInterface.prototype.store;

/**
 * deletes a resource for the given id
 * @param {function(err)} callback the callback function which is called
 *    after the action is completed.
 * @param {string|number|Array} id single id, set of ids.
 */
remobid.common.storage.StorageInterface.prototype.delete;

/**
 * @return {boolean} whenever the storage engine is a available.
 */
remobid.common.storage.StorageInterface.prototype.isAvailable;
