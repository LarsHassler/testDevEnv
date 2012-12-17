require('nclosure').nclosure();

var exec = require('child_process').exec,
    path = require('path'),
    Mocha = require('mocha');

var sourceFiles = [], testFiles = [];

goog.require('goog.array');
/**
 * gets the changed files from the current commit
 */
function getChangedFiles() {
  exec('git diff --cached --name-status', function (err, stderr) {
    if(err) {
      console.log('could not found changes');
      process.exit(1);
    }

    // parse stderr to get file names
    var messages = stderr.split('\n');

    goog.array.forEach(messages, function(message) {
      var data = message.split('\t');
      if(data[0] != 'D')
        if(data[1] && data[1].substr(-3) === '.js')
          if(data[1].substr(0, 5) === 'test/')
            testFiles.push(data[1]);
          else if(data[1].substr(0, 4) === 'src/')
            sourceFiles.push(data[1]);
    });
    console.log(sourceFiles);
    if(!sourceFiles.length)
      proccess.exit(0);

    process.exit(1);

    checkForTests(sourceFiles, testFiles);

    gjslint(sourceFiles, testFiles);
  });
}

/**
 * checks if the needed test files exits
 * @param {Array.<string>} files the commited files
 * @param {Array.<string>} testFiles the commited test files
 */
function checkForTests(files, testFiles) {
  // process.exit(1); if test files don't exist
}

/**
 * runs Google Closure Linter for all given files
 * @param {Array.<string>} srcFiles the commited files
 * * @param {Array.<string>} testFiles the commited testFiles
 */
function gjslint(srcFiles, testFiles) {
  exec('gjslint ' + srcFiles.join(' ') + testFiles.join(' '), function (err, stderr) {
    if(err) {
      console.log(stderr);
      process.exit(1);
    }

    runUnitTests(srcFiles);
  });
}

/**
 * runs mocha tets for all given files
 * @param {Array.<string>} files the commited files
 */
function runUnitTests(files) {
  var mocha = new Mocha;
  mocha.reporter('dot').ui('bdd');
  goog.array.forEach(files, function(file) {
    mocha.addFile(path.join('test', file));
  });

  mocha.run(function(err){
    if(err)
      process.exit(err);

    runDepUnitTests(files);
  });
}

/**
 * runs mocha tets for all given files
 * @param {Array.<string>} files the commited files
 */
function runDepUnitTests(files) {

  // collect depended test files
  var allFiles = resovleDependencies(files);

   var mocha = new Mocha;
   mocha.reporter('dot').ui('bdd');

   goog.array.forEach(allFiles, function(file) {
    mocha.addFile(path.join('test', file));
  });

  mocha.run(function(failures){
    console.log('finished');
    process.exit(failures);
  });

}

/**
 * collects all files that depend on the given ones
 * @param {Array.<string>} files the commited files
 */
function resovleDependencies(files) {
  var collectedFiles = [];

  // @TODO : stub goog.addDependencies;

  return collectedFiles;
}

getChangedFiles();
