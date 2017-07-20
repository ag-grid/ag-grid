require('./dist/lib/main');

var populateClientExports = require('./dist/lib/clientExports').populateClientExports;
populateClientExports(exports);
