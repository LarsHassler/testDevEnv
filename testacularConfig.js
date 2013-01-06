
// base path, that will be used to resolve files and exclude
basePath = '';

  files = [
    MOCHA,
    MOCHA_ADAPTER,
    'test/unit/common/net/restmanager.js',
    'test/unit/common/cache/localcache.js',
    'test/unit/common/storage/localstorage.js',
    'test/unit/common/storage/rest.js',
    'test/unit/common/model/registry.js',
    'test/unit/common/model/modelBase.js'
  ];

  // list of files to exclude
  exclude = [];

  // use dots reporter, as travis terminal does not support escaping sequences
  // possible values: 'dots', 'progress', 'junit'
  // CLI --reporters progress
  reporters = ['dots'];

  // web server port
  // CLI --port 9876
  port = 9876;

  // cli runner port
  // CLI --runner-port 9100
  runnerPort = 9100;

  // enable / disable colors in the output (reporters and logs)
  // CLI --colors --no-colors
  colors = true;

  // level of logging
  // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
  // CLI --log-level debug
  logLevel = LOG_INFO;

  // enable / disable watching file and executing tests whenever any file changes
  // CLI --auto-watch --no-auto-watch
  autoWatch = true;

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera
  // - Safari (only Mac)
  // - PhantomJS
  // - IE (only Windows)
  // CLI --browsers Chrome,Firefox,Safari
  browsers = ['Safari'];

  // If browser does not capture in given timeout [ms], kill it
  // CLI --capture-timeout 5000
  captureTimeout = 40000;

  // Auto run tests on start (when browsers are captured) and exit
  // CLI --single-run --no-single-run
  singleRun = false;

  // report which specs are slower than 500ms
  // CLI --report-slower-than 500
  reportSlowerThan = 500;

  // compile coffee scripts
  preprocessors = {
    //'**/*.coffee': 'coffee'
  };


// java -jar /Library/WebServer/Documents/c4ms/closure/plovr/plovr.jar build plovrConfig.json