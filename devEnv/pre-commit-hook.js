
require('nclosure').nclosure();

var exec = require('child_process').exec,
    testRunner = require('./testRunner.js'),
    path = require('path'),
    Mocha = require('mocha'),
    sourceForTests = [];

goog.require('goog.array');
goog.require('goog.object');


process.on('uncaughtException', function(err) {
  console.log(err);
  finish(1);
});

function stashChanges() {
  console.log('checking current branch');
  exec('git branch', function(err, stderr) {
    if(err) {
      console.log('!!! could not get branches');
      process.exit(1);
    }

    console.log('found branches');
    console.log(stderr);
    console.log(/\*(\s)master/.test(stderr));
    if(/\*(\s)master/.test(stderr)) {
      console.log('not allowed to commit to master')
      process.exit(1);
    }

    console.log('-- stashing not commited changes');
    exec('git stash -q --keep-index', function(err, stderr) {
      if (err) {
        process.exit('!!!! could not stash changes');
      }
      getChangedFiles();
    });
  });
};

function finish(exitCode) {
  console.log('rearrangine stage with stash pop');
  exec('git stash pop', function(err, stderr) {
    if(err) {
      console.log('!!! could not apply stash - check manually !!!');
      console.log(exitCode);
      process.exit(1);
    }
    process.exit(exitCode);
  });
};

/**
 * gets the changed files from the current commit.
 */
function getChangedFiles() {
  console.log('-- getting changes');
  try {
    exec('git diff --cached --name-status', function(err, stderr) {
      var sourceFiles = [], testFiles = [], onlyLintFiles = [];
      console.log('-- finished getting changes');
      if (err) {
        console.log(err);
        console.log(stderr);
        console.log('could not found changes');
        finish(1);
        return;
      }

      // parse stderr to get file names
      var messages = stderr.split('\n');

      goog.array.forEach(messages, function(message) {
        var data = message.split('\t');
        if (data[0] != 'D')
          if (data[1])
            if(data[1].substr(-13) == '_interface.js' || data[1].substr(-8) == '_enum.js')
              goog.array.insert(onlyLintFiles, data[1]);
            else if(data[1].substr(-3) === '.js')
              if (data[1].substr(0, 14) === 'test/unit/both' ||
                data[1].substr(0, 14) === 'test/unit/node') {
                goog.array.insert(sourceForTests, data[1].substr(14));
                goog.array.insert(testFiles, data[1]);
              }

              else if (data[1].substr(0, 4) === 'src/')
                goog.array.insert(sourceFiles, data[1]);
      });
      if (!sourceFiles.length && !testFiles.length) {
        console.log('-- no changes found which need checking');
        finish(0);
        return;
      }


      console.log('-- start gjslint');
      gjslint(sourceFiles, testFiles, onlyLintFiles);
    });
  } catch (e) {
    console.log('!! ERROR !!');
    finish(e);
  }
}

/**
 * runs Google Closure Linter for all given files
 * @param {Array.<string>} srcFiles the commited files.
 * @param {Array.<string>} testFiles the commited testFiles.
 * @param {Array.<string>} additionalFiles the commited additionalFiles.
 */
function gjslint(srcFiles, testFiles, additionalFiles) {
  console.log('-- exec running now');
  exec('gjslint ' + srcFiles.join(' ') + ' ' + testFiles.join(' ')
    + ' ' + additionalFiles.join(' '),
    function(err, stderr) {
      console.log('-- gjslint returned');
      if (err) {
        if(!stderr)
          console.log(err);
        console.log(stderr);
        finish(1);
        return;
      }

      console.log('-- start unittests');
      runUnitTests(srcFiles, testFiles);
    }
  );
}

/**
 * runs mocha tets for all given files
 * @param {Array.<string>} files the commited source files.
 */
function runUnitTests(files) {
  var TestRunner = new testRunner.testRunner();
  TestRunner.addTypes('unit/both');
  TestRunner.addTypes('unit/node');
  goog.array.forEach(files, function(file) {
    TestRunner.addFiles(file.substr(4));
  });
  goog.array.forEach(sourceForTests, function(file) {
    TestRunner.addFiles(file);
  });

  TestRunner.run(function(err) {
    console.log('-- finished unittests');
    finish(err);
    return;
  });
}

exports.run = stashChanges;
