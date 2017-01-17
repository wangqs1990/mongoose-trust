var trust = require('../src/index');
var mongoose = require('mongoose');
var user = mongoose.Schema({
    name: String
});
module.exports = trust();
user.plugin(module.exports.plugin);
module.exports.User = mongoose.model('User', user);
