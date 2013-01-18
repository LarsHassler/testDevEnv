/**
 * @fileoverview a base class for all data model or list model classes.
 */


goog.provide('remobid.common.model.Base');
goog.provide('remobid.common.model.base.EventType');

goog.require('goog.events.EventTarget');

/**
 * A base class for all data model or list model classes.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
remobid.common.model.Base = function() {

  /**
   * the unique rest url of the resource
   * @type {string?}
   * @private
   */
  this.restUrl_ = null;

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
   * holds a counter for all references created to this model. A model can only
   * be disposed when there are no references left.
   * @type {number}
   * @private
   */
  this.referenceCounter_ = 1;
};
goog.inherits(remobid.common.model.Base,
  goog.events.EventTarget);

/**
 * @override
 */
remobid.common.model.Base.prototype.dispose = function() {
  if (--this.referenceCounter_ == 0)
    goog.base(this, 'dispose');
};
/**
 * dispatches an {@code DELETED} Event before disposing of the instance.
 * @override
 * */
remobid.common.model.Base.prototype.disposeInternal = function() {
  this.dispatchEvent(remobid.common.model.base.EventType.DELETED);
  goog.base(this, 'disposeInternal');
};

/**
 * increases the reference counter
 */
remobid.common.model.Base.prototype.increaseReferenceCounter = function() {
  this.referenceCounter_++;
};


/**
 * @param {string} url the rest url of the resource model.
 */
remobid.common.model.Base.prototype.setRestUrl = function(url) {
  this.restUrl_ = url;
};

/**
 * @return {string} the rest url of the resource model.
 */
remobid.common.model.Base.prototype.getRestUrl = function() {
  return this.restUrl_;
};

/**
 * @return {boolean} whenever the resource has a URL already.
 */
remobid.common.model.Base.prototype.hasRestUrl = function() {
  return !goog.isNull(this.restUrl_);
};

/**
 * @param {boolean} loaded is the data already loaded.
 */
remobid.common.model.Base.prototype.setDataLoaded = function(loaded) {
  this.dataLoaded_ = loaded;
};

/**
 * @return {boolean} whenever the model data is already loaded.
 */
remobid.common.model.Base.prototype.isDataLoaded = function() {
  return this.dataLoaded_;
};

/**
 * @return {boolean} whenever the model is loading its data.
 */
remobid.common.model.Base.prototype.isLoading = function() {
  return this.loading_;
};

/** @enum {string} */
remobid.common.model.base.EventType = {
  // if the model instance will be deleted
  DELETED: 'deleted',
  // if the request to load the data from a server was successful
  LOADED: 'loaded'
};
