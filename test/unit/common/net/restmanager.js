/**
 * @fileoverview
 */

/** @preserveTry */
try {
  if (require)
    require('nclosure');
} catch (e) {
}
goog.require('goog.object');
goog.require('goog.testing.asserts');
goog.require('goog.testing.net.XhrIoPool');
goog.require('remobid.common.net.RestManager');
goog.require('remobid.test.mock.Utilities');

describe('UNIT - restmanager', function () {

  beforeEach(function(done) {
    remobid.test.mock.Utilities.clearStack(done);
  });

  afterEach(function() {
    if(remobid.common.net.RestManager.instances_) {
      goog.object.forEach(
        remobid.common.net.RestManager.instances_,
        function(Manager, index) {
          Manager.dispose();
        }
      );
      remobid.common.net.RestManager.instances_ = null;
    }
  });

  describe('Multi Singleton', function() {
    
    it('should return the same Instance', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      assertNotNull(remobid.common.net.RestManager.instances_);
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      var Manager2 = remobid.common.net.RestManager.getInstance();
      assertEquals(Manager, Manager2);
      Manager2.dispose();
    });

    it('should store all Instances', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      assertNotNull(remobid.common.net.RestManager.instances_);
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      var Manager2 = remobid.common.net.RestManager.getInstance('test');
      assertEquals(
        'wrong count of instances created',
        2,
        goog.object.getKeys(remobid.common.net.RestManager.instances_).length
      );
      assertEquals(
        'default base url is wrong',
        remobid.common.net.RestManager.defaultBase_,
        Manager.baseUrl_
      );
      assertEquals(
        'given base url is wrong',
        'test',
        Manager2.baseUrl_
      );
      Manager2.dispose();
    });

    it('should be deleted if disposed', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      Manager.dispose();
      assertTrue(
        'parent function was not called',
        Manager.disposed_
      );
      assertObjectEquals(
        'reference to the manager was not deleted',
        {},
        remobid.common.net.RestManager.instances_
      );
    });

    it('should not be disposed if ' +
        'there are still open connections', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      var Manager2 = remobid.common.net.RestManager.getInstance();
      Manager.dispose();
      assertFalse(
        'should not be disposed yet',
        Manager.disposed_
      );
      assertEquals('should not be deleted yet',
        1,
        goog.object.getKeys(remobid.common.net.RestManager.instances_).length);

      Manager2.dispose();
      assertTrue(
        'Manager was not disposed properly',
        Manager.disposed_
      );
      assertObjectEquals(
        'reference to the manager was not deleted',
        {},
        remobid.common.net.RestManager.instances_
      );
    });

  });

  describe('settings', function() {

    it('should store basic authentication', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      Manager.setBasicAuthentication('Aladdin', 'open sesame');
      assertEquals(
        'credentials are not base64 encoded',
        'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
        Manager.headers_['Authorization']
      );
    });

    it('should store oAuth bearer token authentication', function() {
      var Manager = remobid.common.net.RestManager.getInstance();
      var token = 'e72e16c7e42f292c6912e7710c838347ae178b4a';
      Manager.setBearerToken(token);
      assertEquals(
        'wrong header format',
        'bearer e72e16c7e42f292c6912e7710c838347ae178b4a',
        Manager.headers_['Authorization']
      );
    });

  });

  describe('actions', function() {

    describe('with all actions', function() {

      it('should abort any request first', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.abort = function() {
          done();
        };
        Manager.send = goog.nullFunction;
        Manager.get('users', 'v1', goog.nullFunction);
      });

      it('should have all headers', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        var specific_headers = {'sp_key': 'sp_value'};
        var total_headers = {
          'sp_key': 'sp_value',
          'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='};
        Manager.setBasicAuthentication('Aladdin', 'open sesame');
        Manager.send = function (
          id, url, method, context, headers) {
          assertObjectEquals(total_headers, headers);
          done();
        };
        Manager.get('users', 'v1', goog.nullFunction,
          null, null, specific_headers);
      });

      it('url should combine baseUrl and resource url', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('https://api.remobid.com/v1/users', url);
          done();
        };
        Manager.get('users', 'v1', goog.nullFunction);
      });

      it('url should combine baseUrl, resource url ' +
        'and id if given', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('https://api.remobid.com/v1/users/123', url);
          done();
        };
        Manager.get('users', 'v1', goog.nullFunction, 123);
      });

      it('should add optional parameter to the url', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals(
            'https://api.remobid.com/v1/users/123?fields=name',
            url
          );
          done();
        };
        Manager.get('users', 'v1', goog.nullFunction, 123, '?fields=name');
      });

    });

    describe('put', function() {

      it('should call callback function after finished', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.xhrPool_ = new goog.testing.net.XhrIoPool();
        var callbackTimes = 0;
        var cb = function(error, json) {
          assertFalse(error);
          callbackTimes++;
        };
        Manager.put('users', 'v1', cb, 1, {});
        var xhr = Manager.xhrPool_.getXhr();
        xhr.simulateResponse(200, '');
        assertEquals('callback should be called exactly one time',
          1,
          callbackTimes
        );
        done();
      });

      it('method should be PUT', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('PUT', method);
          done();
        };
        Manager.put('users', 'v1', goog.nullFunction, 1, {});
      });

      describe('errors', function() {

        it('should throw an error if not all' +
          ' necessary parameter are given', function() {
          var Manager = remobid.common.net.RestManager.getInstance();
          Manager.abort = Manager.send = goog.nullFunction;
          assertThrows(
            'request have to have an url',
            goog.bind(Manager.put, Manager, null, 'v1', goog.nullFunction,
              1, {})
          );

          assertThrows(
            'request have to have a version number',
            goog.bind(Manager.put, Manager,
              'users', null, goog.nullFunction, 1, {})
          );

          assertThrows(
            'request have to have a callback function',
            goog.bind(Manager.put, Manager, 'users', 'v1', null, 1, {})
          );

          assertThrows(
            'request have to have a id',
            goog.bind(Manager.put, Manager, 'users',
              'v1', goog.nullFunction, null, {})
          );

          assertThrows(
            'request have to have data',
            goog.bind(Manager.put, Manager, 'users',
              'v1', goog.nullFunction, null, {})
          );

          assertNotThrows(
            'exception thrown, even if all need parameter are given',
            goog.bind(Manager.put, Manager, 'users',
              'v1', goog.nullFunction, 1, {})
          );

        });

      });

    });

    describe('post', function() {

      it('should call callback function after finished', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.xhrPool_ = new goog.testing.net.XhrIoPool();
        var callbackTimes = 0;
        var cb = function(error, json) {
          assertFalse(error);
          callbackTimes++;
        };
        Manager.post('users', 'v1', cb, {});
        var xhr = Manager.xhrPool_.getXhr();
        xhr.simulateResponse(200, '');
        assertEquals('callback should be called exactly one time',
          1,
          callbackTimes
        );
        done();
      });

      it('method should be POST', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('POST', method);
          done();
        };
        Manager.post('users', 'v1', goog.nullFunction, {});
      });

      describe('errors', function() {

        it('should throw an error if not all' +
          ' necessary parameter are given', function() {
          var Manager = remobid.common.net.RestManager.getInstance();
          Manager.abort = Manager.send = goog.nullFunction;
          assertThrows(
            'request have to have an url',
            goog.bind(Manager.post, Manager, null, 'v1', goog.nullFunction, 1)
          );

          assertThrows(
            'request have to have a version number',
            goog.bind(Manager.post, Manager,
              'users', null, goog.nullFunction, {})
          );

          assertThrows(
            'request have to have a callback function',
            goog.bind(Manager.post, Manager, 'users', 'v1', null, {})
          );

          assertThrows(
            'request have to have  data',
            goog.bind(Manager.post, Manager, 'users',
              'v1', goog.nullFunction, null)
          );

          assertNotThrows(
            'exception thrown, even if all need parameter are given',
            goog.bind(Manager.post, Manager, 'users',
              'v1', goog.nullFunction, {})
          );

        });

      });

    });

    describe('delete', function() {

      it('should call callback function after finished', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.xhrPool_ = new goog.testing.net.XhrIoPool();
        var callbackTimes = 0;
        var cb = function(error, json) {
          assertFalse(error);
          callbackTimes++;
        };
        Manager.startDelete('users', 'v1', cb, 1);
        var xhr = Manager.xhrPool_.getXhr();
        xhr.simulateResponse(200, '');
        Manager.startDelete('users', 'v1', cb, 1);
        xhr.simulateResponse(204, '');
        assertEquals('callback should be called exactly two times',
          2,
          callbackTimes
        );
        done();
      });

      it('method should be GET', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('DELETE', method);
          done();
        };
        Manager.startDelete('users', 'v1', goog.nullFunction, 1);
      });

      describe('errors', function() {

        it('should throw an error if not all' +
          ' necessary parameter are given', function() {
          var Manager = remobid.common.net.RestManager.getInstance();
          Manager.abort = Manager.send = goog.nullFunction;
          assertThrows(
            'request have to have an url',
            goog.bind(Manager.startDelete, Manager, null, 'v1', goog.nullFunction, 1)
          );

          assertThrows(
            'request have to have a version number',
            goog.bind(Manager.startDelete, Manager,
                'users', null, goog.nullFunction, 1)
          );

          assertThrows(
            'request have to have a callback function',
            goog.bind(Manager.startDelete, Manager, 'users', 'v1', null, 1)
          );

          assertThrows(
            'request have to have a id',
            goog.bind(Manager.startDelete, Manager, 'users',
                'v1', goog.nullFunction, null)
          );

          assertNotThrows(
            'exception thrown, even if all need parameter are given',
            goog.bind(Manager.startDelete, Manager, 'users',
              'v1', goog.nullFunction, 1)
          );

        });

      });

    });

    describe('get', function() {

      it('should call callback function after finished', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        var callbackTimes = 0;
        Manager.xhrPool_ = new goog.testing.net.XhrIoPool();
        var cb = function(error, json) {
          assertFalse(error);
          assertObjectEquals({ test: 'test' }, json);
          callbackTimes++;
        };
        Manager.get('users', 'v1', cb);
        var xhr = Manager.xhrPool_.getXhr();
        xhr.simulateResponse(200, '{"test": "test"}');
        assertEquals('callback should be called exactly one time',
          1,
          callbackTimes
        );
        done();
      });

      it('method should be GET', function(done) {
        var Manager = remobid.common.net.RestManager.getInstance();
        Manager.send = function (
          id, url, method, context, headers) {
          assertEquals('GET', method);
          done();
        };
        Manager.get('users', 'v1', goog.nullFunction);
      });

      describe('errors', function() {

        it('should throw an error if not all' +
          ' necessary parameter are given', function() {
          var Manager = remobid.common.net.RestManager.getInstance();
          Manager.abort = Manager.send = goog.nullFunction;
          assertThrows(
            'request have to have an url',
            goog.bind(Manager.get, Manager, null, 'v1', goog.nullFunction)
          );

          assertThrows(
            'request have to have a version number',
            goog.bind(Manager.get, Manager, 'users', null, goog.nullFunction)
          );

          assertThrows(
            'request have to have a callback function',
            goog.bind(Manager.get, Manager, 'users', 'v1', null)
          );

          assertNotThrows(
            'exception thrown, even if all need parameter are given',
            goog.bind(Manager.get, Manager, 'users', 'v1', goog.nullFunction)
          );
        });


      });

    });

  });

});
