/**
 * @fileoverview
 */

require('nclosure').nclosure();

goog.require('goog.testing.asserts');
goog.require('remobid.devEnv.TestRunner');

describe('TestRunner', function() {
  describe('constructor', function() {
    it('should except multiple files within constructor', function() {
      var Testrunner1 = new remobid.devEnv.TestRunner('test1.js','test2.js');
      assertArrayEquals(['test1.js','test2.js'], Testrunner1.srcFiles_);
    });

    it('should except one file', function() {
      var Testrunner1 = new remobid.devEnv.TestRunner('test1.js');
      assertArrayEquals(['test1.js'], Testrunner1.srcFiles_);
    });
  });
  
  describe('instances', function() {
    var Testrunner;

    beforeEach(function() {
      Testrunner = new remobid.devEnv.TestRunner();
    });

    it('should except multiple files', function() {
      Testrunner.addFiles('test1.js','test2.js');
      assertArrayEquals(['test1.js','test2.js'], Testrunner.srcFiles_);
    });

    it('should run only on testFiles', function(done){
      Testrunner.addFiles('test1.js');
      Testrunner.mocha.addFile = function(testFile) {
        assertEquals('test/test1.js',testFile);
        done();
      };
      Testrunner.mocha.run = goog.nullFunction;
      Testrunner.run(goog.nullFunction);
    })
  });

});
