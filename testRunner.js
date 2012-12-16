/**
 * Created with JetBrains WebStorm.
 * User: lhassler2
 * Date: 16.12.12
 * Time: 23:11
 * To change this template use File | Settings | File Templates.
 */

var Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path');

var mocha = new Mocha;
mocha.reporter('dot').ui('bdd');

fs.readdirSync('test').filter(function(file){
  // Only keep the .js files
  return file.substr(-3) === '.js';

}).forEach(function(file){
    // Use the method "addFile" to add the file to mocha
    mocha.addFile(path.join('test', file));
  });

mocha.run(function(){
  console.log('finished');
});