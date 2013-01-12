/**
 * @fileoverview tests for remobid.common.model.ModelBase.
 */

goog.provide('remobid.common.model.ModelBase');
goog.provide('remobid.common.model.ModelBase.EventType');
goog.provide('remobid.common.model.modelBase.Mapping');

goog.require('goog.Timer');
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
   * holds all listener keys for the internals event listener
   * @type {number}
   * @private
   */
  this.listenerKeys_ = [];

  /**
   * delay for the changed Event
   * @type {number}
   * @private
   */
  this.changedEventDelay_ = remobid.common.model.ModelBase.changedEventDelay_;

  /**
   * whenever the model should be automatically stored via the storage engine on
   * every update
   * @type {boolean}
   * @private
   */
  this.autoStoreEnabled_ = true;
  // call the setter to set up the listener
  this.setAutoStore(this.autoStoreEnabled_);

  /**
   * whenever this instance should not dispatch a changed event. Used for bulk
   * updates
   * @type {boolean}
   * @private
   */
  this.supressChangeEvent_ = false;

  /**
   * whenever this instance should not track which variables are changed but not
   * stored yet {@code trackedAttributes_}.
   * @type {boolean}
   * @private
   */
  this.supressChangeTracking_ = false;

  /**
   * holds all attributes which have been changed since the last time this
   * resource was stored
   * @type {Array.<remobid.common.model.modelBase.Mapping>}
   * @private
   */
  this.trackedAttributes_ = [];

  /**
   * the id of the timeout for the changed Delay
   * @type {number?}
   * @private
   */
  this.changedEventTimerId_ = null;

  /**
   * a reference to the attribute mappings of this resource type.
   * @type {Object.<remobid.common.model.modelBase.Mapping>}
   * @private
   */
  this.mappings_ = remobid.common.model.ModelBase.attributeMappings;

  /**
   * The persistant storage that the model is b.
   * @type {remobid.common.storage.StorageBase}
   */
  this.persistantStorage = null;

  /**
   * The cache that the model is using.
   * @type {null}
   */
  this.cacheStorage = null;
};
goog.inherits(remobid.common.model.ModelBase,
  goog.events.EventTarget);

/**
 * @param {boolean} forced supresses the Exception {@code UNSAVED}.
 * @override
 */
remobid.common.model.ModelBase.prototype.dispose = function(forced) {
  if (!forced && this.trackedAttributes_.length)
    throw new Error(remobid.common.model.ModelBase.ErrorType.UNSAVED);
  goog.base(this, 'dispose');
};
/**
 * dispatches an {@code DELETED} Event before disposing of the instance.
 * @override
 * */
remobid.common.model.ModelBase.prototype.disposeInternal = function() {

  this.dispatchEvent(remobid.common.model.ModelBase.EventType.DELETED);
  this.mappings_ = null;
  this.trackedAttributes_ = null;
  goog.array.forEach(this.listenerKeys_, function(key) {
    goog.events.unlistenByKey(key);
  });
  this.listenerKeys_ = null;
  goog.Timer.clear(this.changedEventTimerId_);
};

/**
 * @param {goog.event.Event} event the {@code LOCALLY_CHANGED} Event.
 */
remobid.common.model.ModelBase.prototype.handleAutoStore = function(event) {
  this.store();
};

/**
 * tries to store a
 */
remobid.common.model.ModelBase.prototype.store = function() {
  if (goog.isNull(this.storage_))
    throw new Error(remobid.common.model.ModelBase.ErrorType.NO_STORAGE_ENGINE);
};

/**
 * sets the flag for the autostore ability and sets up or tears down the
 * appropriate listeners.
 * @param {boolean} enabled should the model be automatically stored on every
 *    update.
 */
remobid.common.model.ModelBase.prototype.setAutoStore = function(enabled) {
  this.autoStoreEnabled_ = enabled;
  var key;

  if (this.autoStoreEnabled_) {
    key = goog.events.listen(
      this,
      remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
      this.handleAutoStore,
      false,
      this
    );
    this.listenerKeys_.push(key);
  } else {
    var eventListener = goog.events.getListener(
      this,
      remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
      this.handleAutoStore,
      false,
      this
    );

    if (!eventListener)
      return;

    var key = eventListener.key;

    goog.events.unlistenByKey(key);
    goog.array.remove(this.listenerKeys_, key);
  }

};

/**
 * @return {boolean} whenever the model should be automatically stored via the
 * storage engine on every update.
 */
remobid.common.model.ModelBase.prototype.isAutoStoreEnabled = function() {
  return this.autoStoreEnabled_;
};

/**
 * @param {boolean} supressed whenever the model does fire a LOCALLY_CHANGED
 * Event.
 */
remobid.common.model.ModelBase.prototype.setSupressChangeEvent = function(
    supressed) {
  this.supressChangeEvent_ = supressed;
};

/**
 * @return {boolean} whenever the model does fire a LOCALLY_CHANGED Event.
 */
remobid.common.model.ModelBase.prototype.isSupressChangeEvent = function() {
  return this.supressChangeEvent_;
};

/**
 * @param {boolean} supressed whenever the model does not track which attributes
 * are changed.
 */
remobid.common.model.ModelBase.prototype.setSupressChangeTracking = function(
    supressed) {
  this.supressChangeTracking_ = supressed;
};

/**
 * @return {boolean} whenever the model does not track which attributes are
 * changed.
 */
remobid.common.model.ModelBase.prototype.isSupressChangeTracking = function() {
  return this.supressChangeTracking_;
};

/**
 *
 * @param {remobid.common.model.modelBase.Mapping} attributeMapping the mappings
 *    for the attribute to change.
 */
remobid.common.model.ModelBase.prototype.handleChangedAttribute = function(
    attributeMapping) {
  if (!this.supressChangeTracking_)
    this.trackedAttributes_.push(attributeMapping);
  if (!this.supressChangeEvent_)
    this.prepareChangeEvent();
};
/**
 * @param {string} id the identifier of the resource model.
 */
remobid.common.model.ModelBase.prototype.setIdentifier = function(id) {
  this.identifier_ = id;
  this.handleChangedAttribute(
    remobid.common.model.ModelBase.attributeMappings.ID);
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
  this.handleChangedAttribute(
    remobid.common.model.ModelBase.attributeMappings.HREF);
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
 * sets the data like {@code updateDataViaMappings} but dispatches a CHANGED
 * Event when finished.
 * @param {Object} data the new data recieved from the server.
 */
remobid.common.model.ModelBase.prototype.updateFromExternal = function(
  data) {
  var listenerKey = goog.events.listenOnce(this,
    remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED,
    goog.bind(
      this.dispatchEvent,
      this,
      remobid.common.model.ModelBase.EventType.CHANGED
    )
  );
  this.updateDataViaMappings(data);
  this.listenerKeys_.push(listenerKey);
};
/**
 * sets the data of this model to the given data via the attributeMappings.
 * @param {Object} data the new data.
 */
remobid.common.model.ModelBase.prototype.updateDataViaMappings = function(
    data) {

  this.supressChangeEvent_ = true;
  var changedSomething = false;

  goog.object.forEach(this.mappings_, function(mapping) {
    // check if there is anything to update for this attribute
    if (goog.isDef(data[mapping.name])) {
      var value = data[mapping.name];
      // if a helper function is defined use it on the given value before
      // calling the setter of the data model instance
      if (goog.isDef(mapping.setterHelper))
        value = mapping.setterHelper(value);

      // call the setter function with the new value
      mapping.setter.call(this, value);
      changedSomething = true;
    }
  }, this);
  this.supressChangeEvent_ = false;
  if (changedSomething)
    this.prepareChangeEvent();
};

/**
 * sets the timer for the {@code LOCALLY_CHANGED} Event.
 */
remobid.common.model.ModelBase.prototype.prepareChangeEvent = function() {
  if (this.supressChangeEvent_)
    return;

  goog.Timer.clear(this.changedEventTimerId_);

  this.changedEventTimerId_ = goog.Timer.callOnce(
    goog.bind(
      this.dispatchEvent,
      this,
      remobid.common.model.ModelBase.EventType.LOCALLY_CHANGED
    ),
    this.changedEventDelay_
  );
};

/**
 *
 * @param {Array} attributMappingKeys The keys of the attributeMappings.
 */
remobid.common.model.ModelBase.prototype.load = function(attributMappingKeys) {

};


/* ####### static ####### */

/**
 * default delay for the changed Event
 * @type {number}
 * @const
 * @private
 */
remobid.common.model.ModelBase.changedEventDelay_ = 100;

/**
 * holds all attribute mappings for this resource type.
 * @type {Object.<remobid.common.model.modelBase.Mapping>}
 */
remobid.common.model.ModelBase.attributeMappings = {
  ID: {
    name: 'id',
    getter: remobid.common.model.ModelBase.prototype.getIdentifier,
    setter: remobid.common.model.ModelBase.prototype.setIdentifier
  },
  HREF: {
    name: 'href',
    getter: remobid.common.model.ModelBase.prototype.getRestUrl,
    setter: remobid.common.model.ModelBase.prototype.setRestUrl
  }
};

/**
 * @typedef {{name: string, getter: Function, setter: Function,
 *   getterHelper, setterHelper, autoStore}}
 */
remobid.common.model.modelBase.Mapping;

/** @enum {string} */
remobid.common.model.ModelBase.EventType = {
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

/** @enum {string} */
remobid.common.model.ModelBase.ErrorType = {
  // will be thrown whenever the model is about to be disposed but was not
  // stored yet.
  UNSAVED: 'unsaved',
  NO_STORAGE_ENGINE: 'no storage engine'
};
