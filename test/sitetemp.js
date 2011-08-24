
var site = require('../lib/site');


exports['build site'] = function() {
  site.build('/Users/indy/mem/murmur/test/files/traverse-2', '/Users/indy/mem/murmur/public');
//  site.build('/Users/indy/work/indy.io', '/Users/indy/mem/murmur/public');
//  site.build('/Users/indy/work/murmur-temp/source', '/Users/indy/mem/dest');
//  site.build('/Users/indy/mem/source2', '/Users/indy/mem/dest2');
}
