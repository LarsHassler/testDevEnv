/**
 * @fileoverview a mock for HTML5 LocalStorage.
 */

goog.provide('remobid.test.mock.browser.LocalStorage');

goog.require('goog.object');
/**
 * Signleton implementation for a Localstorage mock.
 * @constructor
 */
remobid.test.mock.browser.LocalStorage = function() {
  this.objectStore = {};
  this.length = 0;
};
goog.addSingletonGetter(remobid.test.mock.browser.LocalStorage);

/**
 * load an item from storage.
 * @param {*} key the key where the data is stored.
 * @return {*}
 */
remobid.test.mock.browser.LocalStorage.prototype.getItem = function(key) {
  return this.objectStore[key] || null;
};

/**
 * stores the given data at the given key. data will be covnerted to string.
 * @param {*} key the key where the data should be stored.
 * @param {*} data data to store.
 */
remobid.test.mock.browser.LocalStorage.prototype.setItem = function(key, data) {
  this.objectStore[key] = data.toString();
  this.length++;
};

/**
 * deletes the data at a given key within the storage
 * @param {*} key the key for the data to remove.
 */
remobid.test.mock.browser.LocalStorage.prototype.removeItem = function(key) {
  delete this.objectStore[key];
  this.length--;
};

/**
 * resets the entire storage
 */
remobid.test.mock.browser.LocalStorage.prototype.clear = function() {
  this.objectStore = {};
  this.length = 0;
};

/**
 * returns the key at a given position within the storage.
 * @param {number} position
 */
remobid.test.mock.browser.LocalStorage.prototype.key = function(position) {
  var keys = goog.object.getKeys(this.objectStore);
  return keys[position];
};
