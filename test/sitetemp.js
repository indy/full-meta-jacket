
var site = require('../lib/site');


exports['build site'] = function() {
  site.build('/Users/indy/mem/indy.io', '/Users/indy/mem/murmur/public');
//  site.build('/Users/indy/work/indy.io', '/Users/indy/mem/murmur/public');
}
