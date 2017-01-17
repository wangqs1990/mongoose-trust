var trustSchema = require('./schema');
var trustPlugin = require('./plugin');

var defaults = {
    roleModel: 'Role',
    permissionModel: 'Permission',
    roleOption: {},
    permissionOption: {}
};
module.exports = function (option) {
    var options = Object.assign({}, defaults, option);
    var schemas = trustSchema(options);
    var plugin = trustPlugin(options);
    return {
        Permission: schemas.Permission,
        Role: schemas.Role,
        plugin
    }
};
