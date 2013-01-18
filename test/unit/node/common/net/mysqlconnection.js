/**
 * @fileoverview Tests for the MySql wrapper.
 */

if (typeof module !== 'undefined' && module.exports)
  require('nclosure');

goog.require('goog.testing.asserts');
goog.require('remobid.common.net.MySqlConnection');

describe('Unit - MySql wrapper', function() {
  var connectionData;
  var Db;

  beforeEach(function() {

    connectionData = {
      'host': 'some host',
      'user': 'some user',
      'password': 'some password',
      'database': 'some database'
    };

    Db = new remobid.common.net.MySqlConnection(connectionData);
  });

  it('should store the connection data', function() {
    assertEquals(
      'wrong connection data stored',
      connectionData,
      Db.connectionData_
    );

  });

  it('should build the correct insert string', function() {
    var sqlCopy;

    /**
     * Override query function of node mysql.
     * @param {string} sql
     *    The query that we want to test.
     */
    Db.connection.query = function(sql) {
      sqlCopy = sql;
    }

    var data = {
      'col1': 'data1',
      'col2': 'data2',
      'col3': 'data3'
    };

    Db.insert(goog.nullFunction(), 'test', data);

    assertEquals(
      'insert string was not built correctly',
      sqlCopy,
      'INSERT INTO `test` SET `col1`=\'data1\', `col2`=\'data2\', ' +
        '`col3`=\'data3\''
    );
  });

  it('should build the correct update string', function() {
    var sqlCopy;

    /**
     * Override query function of node mysql.
     * @param {string} sql
     *    The query that we want to test.
     */
    Db.connection.query = function(sql) {
      sqlCopy = sql;
    }

    var data = {
      'col1': 'data1',
      'col2': 'data2',
      'col3': 'data3'
    };

    var where = '`oranges` = \'blue\'';

    Db.update(goog.nullFunction(), 'test', data, where);
    assertEquals(
      'update string was not built correctly',
      sqlCopy,
      'UPDATE `test` SET `col1`=\'data1\', `col2`=\'data2\', ' +
        '`col3`=\'data3\' WHERE `oranges` = \'blue\''
    );

    var values = {
      'fruit': 'oranges',
      'color': 'blue'
    };

    where = '`{{fruit}}` = \'{{color}}\'';

    Db.update(goog.nullFunction(), 'test', data, where, values);
    assertEquals(
      'update string was not built correctly using tags',
      sqlCopy,
      'UPDATE `test` SET `col1`=\'data1\', `col2`=\'data2\', ' +
        '`col3`=\'data3\' WHERE `oranges` = \'blue\''
    );
  });

  it('should build the correct deletion string', function() {
    var sqlCopy;

    /**
     * Override query function of node mysql.
     * @param {string} sql
     *    The query that we want to test.
     */
    Db.connection.query = function(sql) {
      sqlCopy = sql;
    }

    var where = '`oranges` = \'blue\'';

    Db.delete(goog.nullFunction(), 'test', where);

    assertEquals(
      'delete string was not built correctly',
      sqlCopy,
      'DELETE FROM `test` WHERE `oranges` = \'blue\''
    );

    var values = {
      'fruit': 'oranges',
      'color': 'blue'
    };

    where = '`{{fruit}}` = \'{{color}}\'';

    Db.delete(goog.nullFunction(), 'test', where, values);
    assertEquals(
      'update string was not built correctly using tags',
      sqlCopy,
      'DELETE FROM `test` WHERE `oranges` = \'blue\''
    );
  });
});
