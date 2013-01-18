/**
 * @fileoverview Tests for the MySql storage.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.storage.Constant');
goog.require('remobid.common.storage.MySql');

describe('Unit - MySql storage', function() {
  var storage;
  var callbackError;
  var callbackData;
  var callback;
  var data;
  var expectedSql;

  var connectionData = {
    'host': 'some host',
    'user': 'some user',
    'password': 'some password',
    'database': 'some database'
  };

  var attributeMappings = {
    FIRST_NAME: {
      name: 'first_name',
      getter: goog.nullFunction,
      setter: goog.nullFunction
    },
    SECOND_NAME: {
      name: 'second_name',
      getter: goog.nullFunction,
      setter: goog.nullFunction
    }
  };

  beforeEach(function() {
    storage = new remobid.common.storage.MySql(
      connectionData, attributeMappings);

    //override query function of connection class.
    storage.db_.query = function(callback, sql) {

      assertEquals(
        'query string was not built correctly',
        expectedSql,
        sql
      );

      //we do only have to check the sql query string
      var someData = {'some_id': 'some data, it does not matter'};
      if (sql == expectedSql) return someData;
    };

    callback = function(err, data) {
      callbackError = err;
      callbackData = data;
    };

    data = {
      'first_name': 'Jane',
      'second_name': 'Doe'
    };
  });

  describe('base storage test', function() {

    it('should throw an error when using invalid ids', function() {

      //store + object
      var error = assertThrows('store: no error thrown, if id is object',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', {}, data)
      );

      assertEquals(
        'store + object: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //store + empty array
      var error = assertThrows('store: no error thrown, if id is empty array',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', [], data)
      );

      assertEquals(
        'store + empty array: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //store + null
      error = assertThrows('store: no error thrown, if id is null',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', null, data)
      );

      assertEquals(
        'store + null: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //store + undefined
      error = assertThrows('store: no error thrown, if id is undefined',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', undefined,
          data)
      );

      assertEquals(
        'store + undefined: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //store + negative number
      error = assertThrows('store: no error thrown, if id is negative number',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', -2, data)
      );

      assertEquals(
        'store + negative number: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //store + 0
      error = assertThrows('store: no error thrown, if id is 0',
        goog.bind(storage.store, storage, goog.nullFunction, 'test', 0, data)
      );

      assertEquals(
        'store + negative number: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //load + object
      error = assertThrows('load: no error thrown, if id is object',
        goog.bind(storage.load, storage, goog.nullFunction, 'test', {})
      );

      assertEquals(
        'load + object: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //load + empty array
      error = assertThrows('load: no error thrown, if id is empty array',
        goog.bind(storage.load, storage, goog.nullFunction, 'test', [])
      );

      assertEquals(
        'load + empty array: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //load + null -> valid

      //load + undefined -> valid

      //load + negative number
      error = assertThrows('load: no error thrown, if id is negative number',
        goog.bind(storage.load, storage, goog.nullFunction, 'test', -2)
      );

      assertEquals(
        'load + negative number: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //load + 0
      error = assertThrows('load: no error thrown, if id is 0',
        goog.bind(storage.load, storage, goog.nullFunction, 'test', 0)
      );

      assertEquals(
        'load + 0: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + object
      error = assertThrows('remove: no error thrown, if id is object',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test', {})
      );

      assertEquals(
        'remove + object: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + empty array
      error = assertThrows('remove: no error thrown, if id is empty array',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test', [])
      );

      assertEquals(
        'remove + empty array: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + null
      error = assertThrows('remove: no error thrown, if id is null',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test', null)
      );

      assertEquals(
        'remove + null: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + undefined
      error = assertThrows('remove: no error thrown, if id is undefined',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test')
      );

      assertEquals(
        'remove + undefined: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + negative number
      error = assertThrows('remove: no error thrown, if id is negative number',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test', -2)
      );

      assertEquals(
        'remove + negative number: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );

      //remove + 0
      error = assertThrows('remove: no error thrown, if id is 0',
        goog.bind(storage.remove, storage, goog.nullFunction, 'test', 0)
      );

      assertEquals(
        'remove + 0: wrong error type',
        remobid.common.storage.StorageErrorType.INVALID_KEY,
        error.errorType
      );
    });

    it('should throw an error when storing invalid data', function() {

      var testInput = [];
      testInput.push({'data': null, 'type': 'null'});
      testInput.push({'data': undefined, 'type': 'undefined'});
      testInput.push({'data': 'test', 'type': 'string'});
      testInput.push({'data': 9, 'type': 'number'});
      testInput.push({'data': {}, 'type': 'empty object'});

      goog.array.forEach(testInput, function(input) {
        var error = assertThrows('no error thrown, if data is ' + input.type,
          goog.bind(storage.store, storage, goog.nullFunction, 'test', 1,
              input.data)
        );

        assertEquals(
          input.type + ': wrong error type',
          remobid.common.storage.StorageErrorType.INVALID_DATA,
          error.errorType
        );
      });

      it('sould throw an error, when using invalid callbacks', function() {
        var testInput = [];
        testInput.push({'data': null, 'type': 'null'});
        testInput.push({'data': undefined, 'type': 'undefined'});
        testInput.push({'data': 'test', 'type': 'string'});
        testInput.push({'data': 9, 'type': 'number'});
        testInput.push({'data': {}, 'type': 'empty object'});
        testInput.push({'data': [], 'type': 'empty object'});

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.store, storage, testInput.data, 'test', 1,
              data)
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_CALLBACK,
            error.errorType
          );
        });

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.load, storage, testInput.data, 'test')
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_CALLBACK,
            error.errorType
          );
        });

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.remove, storage, testInput.data, 'test', 1)
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_CALLBACK,
            error.errorType
          );
        });
      });

      it('should throw an error, when using invalid resource ids', function() {
        var testInput = [];
        testInput.push({'data': null, 'type': 'null'});
        testInput.push({'data': undefined, 'type': 'undefined'});
        testInput.push({'data': 9, 'type': 'number'});
        testInput.push({'data': {}, 'type': 'empty object'});
        testInput.push({'data': [], 'type': 'empty object'});

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.store, storage, goog.nullFunction, input.data,
              1, data)
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_RESOURCE,
            error.errorType
          );
        });

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.load, storage, goog.nullFunction, input.data)
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_RESOURCE,
            error.errorType
          );
        });

        goog.array.forEach(testInput, function(input) {
          var error = assertThrows('no error thrown, if data is ' + input.type,
            goog.bind(storage.remove, storage, goog.nullFunction, input.data, 1)
          );

          assertEquals(
            input.type + ': wrong error type',
            remobid.common.storage.StorageErrorType.INVALID_RESOURCE,
            error.errorType
          );
        });
      });

      it('should throw an error, when using invalid columns', function() {

        data = {
          'first_names': 'Jane', //should have been 'first_name'
          'second_name': 'Doe'
        };

        var error = assertThrows('store: no error thrown, if column is invalid',
          goog.bind(storage.store, storage, goog.nullFunction, 'test', 1,
            data)
        );

        assertEquals(
          'wrong error type',
          remobid.common.storage.StorageErrorType.INVALID_FIELD,
          error.errorType
        );

        var options = {
          fields: ['first_names', 'second_name'] //should have been 'first_name'
        };

        error = assertThrows('load: no error thrown, if column is invalid',
          goog.bind(storage.load, storage, goog.nullFunction, 'test', 1,
            options)
        );

        assertEquals(
          'wrong error type',
          remobid.common.storage.StorageErrorType.INVALID_FIELD,
          error.errorType
        );
      });
    });

    it('should load a single id', function() {

      expectedSql = 'SELECT * FROM `test` WHERE `id` = 1';
      storage.load(callback, 'test', 1);

      expectedSql = 'SELECT * FROM `test` WHERE `id` = \'1\'';
      storage.load(callback, 'test', '1');
    });

    it('should load multiple ids', function() {
      expectedSql = 'SELECT * FROM `test` WHERE `id` IN (1, 2, 3)';
      storage.load(callback, 'test', [1, 2, 3]);

      expectedSql = 'SELECT * FROM `test` WHERE `id` IN (\'1\', \'2\', \'3\')';
      storage.load(callback, 'test', ['1', '2', '3']);
    });

    it('should load everything without an id', function() {
      expectedSql = 'SELECT * FROM `test` WHERE 1';

      storage.load(callback, 'test');
      storage.load(callback, 'test', undefined);

    });

    it('should delete a single id', function() {
      expectedSql = 'DELETE FROM `test` WHERE `id` = 1';
      storage.remove(callback, 'test', 1);

      expectedSql = 'DELETE FROM `test` WHERE `id` = \'1\'';
      storage.remove(callback, 'test', '1');
    });

    it('should delete multiple ids', function() {
      expectedSql = 'DELETE FROM `test` WHERE `id` IN (1, 2, 3)';
      storage.remove(callback, 'test', [1, 2, 3]);

      expectedSql = 'DELETE FROM `test` WHERE `id` IN (\'1\', \'2\', \'3\')';
      storage.remove(callback, 'test', ['1', '2', '3']);
    });


    it('should store a single id', function() {
      expectedSql = 'UPDATE `test` SET `first_name`=\'Jane\', ' +
        '`second_name`=\'Doe\' WHERE `id` = 1';
      storage.store(callback, 'test', 1, data);

      expectedSql = 'UPDATE `test` SET `first_name`=\'Jane\', ' +
        '`second_name`=\'Doe\' WHERE `id` = \'1\'';
      storage.store(callback, 'test', '1', data);
    });

    it('should add a new entry', function() {
      expectedSql = 'INSERT INTO `test` SET `first_name`=\'Jane\', ' +
        '`second_name`=\'Doe\'';
      storage.store(callback, 'test', remobid.common.storage.Constant.NEW_ENTRY,
        data);
    });

    it('should store multiple ids', function() {
      expectedSql = 'UPDATE `test` SET `first_name`=\'Jane\', ' +
        '`second_name`=\'Doe\' WHERE `id` IN (1, 2, 3)';
      storage.store(callback, 'test', [1, 2, 3], data);

      expectedSql = 'UPDATE `test` SET `first_name`=\'Jane\', ' +
        '`second_name`=\'Doe\' WHERE `id` IN (\'1\', \'2\', \'3\')';
      storage.store(callback, 'test', ['1', '2', '3'], data);
    });


    describe('loading options', function() {
      it('should filter by fields on single id', function() {
        expectedSql = 'SELECT `first_name`, `second_name` ' +
          'FROM `test` WHERE `id` = 1';
        storage.load(callback, 'test', 1,
          {fields: ['first_name', 'second_name']});

        expectedSql = 'SELECT `first_name`, `second_name` ' +
          'FROM `test` WHERE `id` = \'1\'';
        storage.load(callback, 'test', '1',
          {fields: ['first_name', 'second_name']});
      });

      it('should filter by fields on multiple ids', function() {
        expectedSql = 'SELECT `first_name`, `second_name` ' +
          'FROM `test` WHERE `id` IN (1, 2, 3)';
        storage.load(callback, 'test', [1, 2, 3],
          {fields: ['first_name', 'second_name']});

        expectedSql = 'SELECT `first_name`, `second_name` ' +
          'FROM `test` WHERE `id` IN (\'1\', \'2\', \'3\')';
        storage.load(callback, 'test', ['1', '2', '3'],
          {fields: ['first_name', 'second_name']});
      });

      it('should filter by limit on single id ', function() {
        expectedSql = 'SELECT * FROM `test` WHERE `id` = 1 LIMIT 1';
        storage.load(callback, 'test', 1, {limit: 1});

        expectedSql = 'SELECT * FROM `test` WHERE `id` = \'1\' LIMIT 1';
        storage.load(callback, 'test', '1', {limit: 1});
      });

      it('should filter by limit on multiple ids', function() {
        expectedSql = 'SELECT * FROM `test` WHERE `id` IN (1, 2, 3) LIMIT 1';
        storage.load(callback, 'test', [1, 2, 3], {limit: 1});

        expectedSql = 'SELECT * FROM `test` WHERE `id` ' +
          'IN (\'1\', \'2\', \'3\') LIMIT 1';
        storage.load(callback, 'test', ['1', '2', '3'], {limit: 1});
      });

      it('should filter by offset on single id', function() {
        expectedSql = 'SELECT * FROM `test` WHERE `id` = 1 ' +
          'LIMIT 18446744073709551610 OFFSET 4';
        storage.load(callback, 'test', 1, {offset: 4});

        expectedSql = 'SELECT * FROM `test` WHERE `id` = \'1\' ' +
          'LIMIT 18446744073709551610 OFFSET 4';
        storage.load(callback, 'test', '1', {offset: 4});
      });

      it('should filter by offset on multiple ids', function() {
        expectedSql = 'SELECT * FROM `test` WHERE `id` IN (1, 2, 3) ' +
          'LIMIT 18446744073709551610 OFFSET 4';
        storage.load(callback, 'test', [1, 2, 3], {offset: 4});

        expectedSql = 'SELECT * FROM `test` WHERE `id` ' +
          'IN (\'1\', \'2\', \'3\') LIMIT 18446744073709551610 OFFSET 4';
        storage.load(callback, 'test', ['1', '2', '3'], {offset: 4});
      });

      it('should filter by offset, limit and fields on single id',
          function() {
        expectedSql = 'SELECT `first_name`, `second_name` FROM `test` ' +
          'WHERE `id` = 1 LIMIT 2 OFFSET 4';
        storage.load(callback, 'test', 1,
          {offset: 4, limit: 2, fields: ['first_name', 'second_name']});

        expectedSql = 'SELECT `first_name`, `second_name` FROM `test` ' +
          'WHERE `id` = \'1\' LIMIT 2 OFFSET 4';
        storage.load(callback, 'test', '1',
          {offset: 4, limit: 2, fields: ['first_name', 'second_name']});
      });

      it('should filter by offset, limit and fields on multiple ids',
          function() {

        expectedSql = 'SELECT `first_name`, `second_name` FROM `test` ' +
          'WHERE `id` IN (1, 2, 3) LIMIT 2 OFFSET 4';
        storage.load(callback, 'test', [1, 2, 3],
          {offset: 4, limit: 2, fields: ['first_name', 'second_name']});

        expectedSql = 'SELECT `first_name`, `second_name` FROM `test` ' +
          'WHERE `id` IN (\'1\', \'2\', \'3\') LIMIT 2 OFFSET 4';
        storage.load(callback, 'test', ['1', '2', '3'],
          {offset: 4, limit: 2, fields: ['first_name', 'second_name']});
      });
    });
  });

});
