var _ = require('lodash');
var properties = require('./properties/mongoose');

require('dotenv').config();

var env = 'production';
if (!_.isNil(process.env.MONGOOSE_ENV)) {
  env = process.env.MONGOOSE_ENV;
}

var auth = '';
if (!_.isNil(process.env.MONGOOSE_AUTH)) {
  auth = process.env.MONGOOSE_AUTH + '@';
}

var host = properties[env].host;
var name = properties[env].name;

const url = 'mongodb://' + auth + host + '/' + name;

console.log('MongoDB url:', url);

module.exports = {
  dbConnectionUri: url,
  migrationsDir: 'migrations',
  es6: true
};


