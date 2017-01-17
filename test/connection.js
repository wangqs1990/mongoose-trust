var mongoose = require('mongoose');
var uri = 'mongodb://localhost/trust';

module.exports.open = function () {
    return mongoose.connect(uri);
}
module.exports.close = function () {
    return mongoose.disconnect();
}
