/**
 * Created with JetBrains WebStorm.
 * User: lhassler2
 * Date: 16.12.12
 * Time: 23:11
 * To change this template use File | Settings | File Templates.
 */

var testRunner = require('./devEnv/testRunner.js'),
    TestRunner = new testRunner.testRunner(),
    fs = require('fs');

fs.readdirSync('src').filter(function(file) {
  // Only keep the .js files
  return file.substr(-3) === '.js';

}).forEach(function(file) {
    // Use the method "addFile" to add the file to mocha
    TestRunner.addFiles(file);
});

TestRunner.run(function() {
  console.log('finished');
});