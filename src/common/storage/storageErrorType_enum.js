/**
 * @fileoverview all mainErrorTypes.
 */

goog.provide('remobid.common.storage.StorageErrorType');

/** @enum {string} */
remobid.common.storage.StorageErrorType = {
  INVALID_KEY: 'invalid key',
  MISSING_DATA: 'missing data',
  QUOTA_EXCEEDED: 'quota exceeded',
  LOAD_OPTIONS_FIELDS: 'can not apply fields to non object'
};
