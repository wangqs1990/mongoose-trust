var mongoose = require('mongoose');
module.exports = function (config) {
    var role = mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        displayName: {
            type: String,
            required: true
        },
        description: String,
        permissions: [{ type: mongoose.SchemaTypes.ObjectId, ref: config.permissionModel }]
    }, config.roleOption);

    role.methods.can = function (permission, all = 1) {
        if (!Array.isArray(permission)) {
            permission = [permission];
        }
        return this.perms().then(function(perms) {
            return permission[all ? 'every' : 'some']((perm) => perms.indexOf(perm) !== -1);
        });
    };

    role.methods.detachPermissions = function (names) {
        if (!Array.isArray(names)) {
            names = [names];
        }
        return this.populate({path: 'permissions', select: 'name'}).execPopulate().then(function (role) {
            var perms = role.permissions.map(p => p.name);
            var changed = false;
            names.forEach(name => {
                var i = perms.indexOf(name);
                if (i !== -1) {
                    role.permissions.splice(i, 1);
                    changed = true;
                }
            });
            if (changed) {
                return role.save();
            }
            return role;
        });
    };

    role.methods.canAny = function (permission) {
        return this.can(permission, 0);
    };

    role.methods.perms = function () {
        return this.populate({path: 'permissions', select: 'name'}).execPopulate().then(role => role.permissions.map(p => p.name));
    };

    role.methods.attachPermission = function (name) {
        var existPerms = this.permissions ? this.permissions.map(p => (p._id || p)) : [];

        return this.model(config.permissionModel).findOne({name}).then((perm) => {
            if (!perm || existPerms.some(p => perm._id.equals(p))) {
                return this;
            }
            this.permissions.push(perm);
            return this.save();
        });
    };

    role.methods.attachPermissions = function (names) {
        var existPerms = this.permissions ? this.permissions.map(p => (p._id || p)) : [];

        return this.model(config.permissionModel).find({name: {$in: names}}).then((perms) => {
            var addPerms =  perms.filter(perm => !existPerms.some(p => perm._id.equals(p)));
            if (!addPerms.length) {
                return this;
            }
            this.permissions = this.permissions.concat(addPerms);
            return this.save();
        });
    }

    var permission = mongoose.Schema({
        name: {
            type: String,
            required: true,
            uinque: true
        },
        displayName: {
            type: String,
            required: true
        },
        description: String
    }, config.permissionOption);
    return {
        Role: mongoose.model(config.roleModel, role),
        Permission: mongoose.model(config.permissionModel, permission)
    };
};
