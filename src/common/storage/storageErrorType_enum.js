/**
 * @fileoverview all mainErrorTypes.
 */

goog.provide('remobid.common.storage.StorageErrorType');

/** @enum {string} */
remobid.common.storage.StorageErrorType = {
  INVALID_KEY: 'invalid key',
  INVALID_FIELD: 'invalid field',
  INVALID_DATA: 'invalid data',
  INVALID_CALLBACK: 'invalid callback',
  INVALID_RESOURCE: 'invalid resource',
  QUOTA_EXCEEDED: 'quota exceeded',
  LOAD_OPTIONS_FIELDS: 'can not apply fields to non object',
  SUPERNUMEROUS_TAG: 'supernumerous tag'
};
