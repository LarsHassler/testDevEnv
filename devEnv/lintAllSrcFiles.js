/**
 * Created with JetBrains WebStorm.
 * User: lhassler2
 * Date: 16.12.12
 * Time: 23:11
 * To change this template use File | Settings | File Templates.
 */

var exec = require('child_process').exec,
    fs = require('fs');

var getSourceFiles = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          getSourceFiles(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) {
              done(null, results);
            }
          });
        } else {
          if(file.substr(-3) === '.js' && file.substr(-13) !== '_interface.js')
            results.push(file);
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
};


(function(){
  console.log('-- getting all source files');
  getSourceFiles('test', function(err, files){
    console.log('-- starting gjslint');
    exec('gjslint ' + files.join(' '),
      function(err, stderr) {
        console.log('-- gjslint finished');
        if (err) {
          if(!stderr)
            console.log(err);
          console.log(stderr);
          process.exit(1);
        }

        console.log('all fine');
        process.exit(0);
      }
    );
  });
})();