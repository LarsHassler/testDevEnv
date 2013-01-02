/**
 * @fileoverview tests for remobid.common.model.ModelBase.
 */

goog.provide('remobid.common.model.ModelBase');
goog.provide('remobid.common.model.modelBase.Mapping');

goog.require('goog.events.EventTarget');
goog.require('remobid.common.model.Registry');


/**
 * @param {string} id the identifier of the resource model.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
remobid.common.model.ModelBase = function(id) {
  /**
   * the identifier of the resource model
   * @type {string}
   * @private
   */
  this.identifier_ = id;

  /**
   * the unique rest url of the resource
   * @type {string?}
   * @private
   */
  this.restUrl_ = null;

  /**
   * the storage engine for this model.
   * @type {remobid.common.storage.StorageBase?}
   * @private
   */
  this.storage_ = null;

  /**
   * the cache engine for this model.
   * @type {remobid.common.storage.StorageBase?}
   * @private
   */
  this.cache_ = null;

  /**
   * whenever the data for this model was already loaded.
   * @type {boolean}
   * @private
   */
  this.dataLoaded_ = false;

  /**
   * whenever the request to load the data for this model was already issued,
   * but was not completed yet.
   * @type {boolean}
   * @private
   */
  this.loading_ = false;

  /**
   * whenever the model should be automatically stored via the storage engine on
   * every update
   * @type {boolean}
   * @private
   */
  this.autoStoreEnabled_ = true;

  /**
   * a reference to the attribute mappings of this resource type.
   * @type {Array.<remobid.common.model.modelBase.Mapping>}
   * @private
   */
  this.mappings_ = remobid.common.model.ModelBase.attributeMappings;
};
goog.inherits(remobid.common.model.ModelBase,
  goog.events.EventTarget);

/** @override */
remobid.common.model.ModelBase.prototype.disposeInternal = function() {
  this.dispatchEvent(remobid.common.model.modelBase.EventType.DELETED);
  this.mappings_ = null;
};

/**
 * @param {boolean} enabled should the model be automatically stored on every
 *    update.
 */
remobid.common.model.ModelBase.prototype.setAutoStore = function(enabled) {
  this.autoStoreEnabled_ = enabled;
};

/**
 * @return {boolean} whenever the model should be automatically stored via the
 * storage engine on every update.
 */
remobid.common.model.ModelBase.prototype.isAutoStoreEnabled = function() {
  return this.autoStoreEnabled_;
};

/**
 * @param {string} id the identifier of the resource model.
 */
remobid.common.model.ModelBase.prototype.setIdentifier = function(id) {
  this.identifier_ = id;
};

/**
 * @return {string} the id of the resource model.
 */
remobid.common.model.ModelBase.prototype.getIdentifier = function() {
  return this.identifier_;
};

/**
 * @param {string} url the rest url of the resource model.
 */
remobid.common.model.ModelBase.prototype.setRestUrl = function(url) {
  this.restUrl_ = url;
};

/**
 * @return {string} the rest url of the resource model.
 */
remobid.common.model.ModelBase.prototype.getRestUrl = function() {
  return this.restUrl_;
};

/**
 * @return {boolean} whenever the resource has a URL already.
 */
remobid.common.model.ModelBase.prototype.hasRestUrl = function() {
  return !goog.isNull(this.restUrl_);
};

/**
 * @param {remobid.common.storage.StorageBase?} engine the new storage engine.
 */
remobid.common.model.ModelBase.prototype.setStorage = function(engine) {
  this.storage_ = engine;
};

/**
 * @return {remobid.common.storage.StorageBase?} the storage engine.
 */
remobid.common.model.ModelBase.prototype.getStorage = function() {
  return this.storage_;
};

/**
 * @param {remobid.common.storage.StorageBase?} engine the new cache engine.
 */
remobid.common.model.ModelBase.prototype.setCache = function(engine) {
  this.cache_ = engine;
};

/**
 * @return {remobid.common.storage.StorageBase?} the cache engine.
 */
remobid.common.model.ModelBase.prototype.getCache = function() {
  return this.cache_;
};

/**
 * @param {boolean} loaded is the data already loaded.
 */
remobid.common.model.ModelBase.prototype.setDataLoaded = function(loaded) {
  this.dataLoaded_ = loaded;
};

/**
 * @return {boolean} whenever the model data is already loaded.
 */
remobid.common.model.ModelBase.prototype.isDataLoaded = function() {
  return this.dataLoaded_;
};

/**
 * @return {boolean} whenever the model is loading its data.
 */
remobid.common.model.ModelBase.prototype.isLoading = function() {
  return this.loading_;
};


/* mapping functionality */

/**
 * sets the data of this model to the given data via the attributeMappings.
 * @param {Object} data the new data.
 */
remobid.common.model.ModelBase.prototype.updateDataViaMappings = function(
    data) {
  goog.array.forEach(this.mappings_, function(mapping) {
    // check if there is anything to update for this mapping
    if (goog.isDef(data[mapping.name])) {
      var value = data[mapping.name];
      // if is defined use the helper function on the given value before calling
      // the setter of the data model instance
      if (goog.isDef(mapping.setterHelper))
        value = mapping.setterHelper(value);

      // call the setter function with the new value
      mapping.setter.call(this, value);
    }
  });
};


/* ####### static ####### */

/**
 * holds all attribute mappings for this resource type.
 * @type {Array.<remobid.common.model.modelBase.Mapping>}
 */
remobid.common.model.ModelBase.attributeMappings = [
  {
    name: 'id',
    getter: remobid.common.model.ModelBase.prototype.getIdentifier,
    setter: remobid.common.model.ModelBase.prototype.setIdentifier
  },
  {
    name: 'href',
    getter: remobid.common.model.ModelBase.prototype.getRestUrl,
    setter: remobid.common.model.ModelBase.prototype.setRestUrl
  }
];

/**
 * @typedef {{name, getter, setter,
 *   getterHelper?, setterHelper?, autoStore?}}
 */
remobid.common.model.modelBase.Mapping;

/** @enum {string} */
remobid.common.model.modelBase.EventType = {
  // if the model instance will be deleted
  DELETED: 'deleted',
  // if the model was changed due to new data from the server
  CHANGED: 'changed',
  // if the model was changed due to action within the view
  LOCALLY_CHANGED: 'local_changed',
  // if the data was stored successfully on the server
  STORED: 'stored',
  // if the data couldn't be transmitted onto the server, but was queued locally
  // so it can be transmitted later when the connection can be established
  LOCALLY_STORED: 'local_stored',
  // if the data was stored in the cache
  CACHED: 'cached',
  // if the request to load the data from a server was successful
  LOADED: 'loaded'
};
