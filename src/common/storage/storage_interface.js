/**
 * @fileoverview Interface for all storage classes.
 */

goog.provide('remobid.common.storage.StorageInterface');

/**
 *
 * @interface
 */
remobid.common.storage.StorageInterface = function() {};

/**
 * loads data for a given id, set of ids or by a filter
 * @param {function(Object?,*=)} callback the callback function which is.
 * @param {string|number} resourceId The id of the resource.
 *    called after the action is completed.
 * @param {?(string|number|Array.<string>|Array.<number>)=} opt_id single id,
 *    set of ids or null for all entries - maybe filtered by the options.
 * @param {remobid.common.storage.storageBase.Options=} opt_option a set of
 *    options.
 */
remobid.common.storage.StorageInterface.prototype.load;

/**
 * stores the given data for the given id
 * @param {function(Object?,*=)} callback the callback function which is
 *    called after the action is completed.
 * @param {string|number} resourceId
 *    The id of the resource, that is going to be used.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 * @param {Object} data the data to store.
 */
remobid.common.storage.StorageInterface.prototype.store;

/**
 * deletes a resource for the given id
 * @param {function(Object?,Object=)} callback the callback function which is
 *    called after the action is completed.
 * @param {string|number} resourceId
 *    The id of the resource, that is going to be used.
 * @param {string|number|Array.<string>|Array.<number>} id
 *    single id, set of ids.
 */
remobid.common.storage.StorageInterface.prototype.remove;

/**
 * @return {boolean} whenever the storage engine is a available.
 */
remobid.common.storage.StorageInterface.prototype.isAvailable;
