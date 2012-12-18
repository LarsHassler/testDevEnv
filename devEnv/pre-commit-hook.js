
require('nclosure').nclosure();

var exec = require('child_process').exec,
    testRunner = require('./testRunner.js'),
    path = require('path'),
    Mocha = require('mocha');

goog.require('goog.array');
goog.require('goog.object');

console.log(process.env);
process.exit(0);
/**
 * gets the changed files from the current commit.
 */
function getChangedFiles() {
  console.log('-- getting changes');
  exec('git diff --cached --name-status', function(err, stderr) {
    var sourceFiles = [], testFiles = [];
    console.log('-- finished getting changes');
    if (err) {
      console.log('could not found changes');
      process.exit(1);
    }

    // parse stderr to get file names
    var messages = stderr.split('\n');

    goog.array.forEach(messages, function(message) {
      var data = message.split('\t');
      if (data[0] != 'D')
        if (data[1] && data[1].substr(-3) === '.js')
          if (data[1].substr(0, 5) === 'test/')
            testFiles.push(data[1]);
          else if (data[1].substr(0, 4) === 'src/')
            sourceFiles.push(data[1]);
    });
    if (!sourceFiles.length) {
      console.log('-- no changes found which need checking');
      process.exit(0);
    }

    console.log('-- start check for testfiles');
    checkForTests(sourceFiles, testFiles);

    console.log('-- start gjslint');
    gjslint(sourceFiles, testFiles);
  });
}

/**
 * checks if the needed test files exits
 * @param {Array.<string>} files the commited files.
 * @param {Array.<string>} testFiles the commited test files.
 */
function checkForTests(files, testFiles) {
  // process.exit(1); if test files don't exist
}

/**
 * runs Google Closure Linter for all given files
 * @param {Array.<string>} srcFiles the commited files.
 * @param {Array.<string>} testFiles the commited testFiles.
 */
function gjslint(srcFiles, testFiles) {
  console.log('gjslint ' + srcFiles.join(' ') + ' ' + testFiles.join(' '));
  exec('gjslint ' + srcFiles.join(' ') + ' ' + testFiles.join(' '),
    function(err, stderr) {
      console.log('-- finished gjslint');
      console.log(err);
      if (err) {
        console.log(stderr);
        process.exit(1);
      }

      console.log('-- start unittests');
      runUnitTests(srcFiles);
    }
  );
}

/**
 * runs mocha tets for all given files
 * @param {Array.<string>} files the commited files.
 */
function runUnitTests(files) {
  var TestRunner = new testRunner.testRunner()
  goog.array.forEach(files, function(file) {
    TestRunner.addFiles(file.substr(4));
  });

  TestRunner.run(function(err) {
    console.log('-- finished unittests');
    process.exit(err);
  });
}

/**
 * runs mocha tets for all given files
 * @param {Array.<string>} files the commited files.
 */
function runDepUnitTests(files) {

  // collect depended test files
  var allFiles = resolveDependencies(files);

   var mocha = new Mocha;
   mocha.reporter('dot').ui('bdd');

  goog.array.forEach(allFiles, function(file) {
    mocha.addFile(path.join('test', file.substr(4)));
  });

  mocha.run(function(failures) {
    console.log('finished');
    process.exit(failures);
  });

}

/**
 * collects all files that depend on the given ones
 * @param {Array.<string>} files the commited files.
 * @return {Array.<string>} all files for which the tests need to run.
 */
function resolveDependencies(files) {
  var collectedFiles = [];
  var provides = [];

  goog.array.forEach(files, function(file) {
    provides = goog.array.extend(
      provides,
      goog.object.getKeys(goog.dependencies_.pathToNames[file])
    );
  });

  while (provides.length) {
    var namespace = provides.pop();
    var file = goog.dependencies_.nameToPath[namespace];
    goog.array.insert(collectedFiles.push(file));
    goog.array.forEach(
      goog.object.getKeys(goog.dependencies_.requires[path]),
      function(namespace) {
        // only include files which are  part of our namespace
        if (namespace.substr(0, 7) == 'remobid')
          provides.push(namespace);
      }
    );
  }

  return collectedFiles;
}

exports.run = getChangedFiles;
