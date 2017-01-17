var mongoose = require('mongoose');
module.exports = function (config) {
    return function (schema, options) {
        schema.add({
            roles: [{ type: mongoose.Schema.Types.ObjectId, ref: config.roleModel }]
        });
        schema.methods.can = function (perms, all = 1) {
            if (!Array.isArray(perms)) {
                perms = [perms];
            }
            return this.populate({
                path: 'roles',
                populate: {
                    path: 'permissions',
                    select: 'name'
                }
            }).execPopulate().then(function (user) {
                var rolePerms = [];
                var roles = user.roles || [];
                for (var i = 0; i < roles.length; i++) {
                    if (roles[i].permissions) {
                        rolePerms = rolePerms.concat(roles[i].permissions.map(p => p.name));
                    }
                }
                return perms[all ? 'every' : 'some'](perm => rolePerms.indexOf(perm) !== -1);
            });
        };

        schema.methods.canAny = function (perms) {
            return this.can(perms, 0);
        };

        schema.methods.hasRole = function (name) {
            if (!Array.isArray(name))
            var existRoles = this.roles ? this.roles.map(role => role._id || role) : [];
            return this.model(config.roleModel).findOne({ name }).exec().then((role) => {
                if (!role) {
                    return false;
                }
                return existRoles.some((r) => r.equals(role._id));
            });
        };
        schema.methods.attachRole = function (name) {
            var existRoles = this.roles ? this.roles.map(role => role._id || role) : [];
            return this.model(config.roleModel).findOne({ name }).exec().then((role) => {
                var hasRole = existRoles.some((r) => r.equals(role._id));
                if (hasRole) {
                    return this;
                }
                this.roles.push(role);
                return this.save();
            });
        };
        schema.methods.attachRoles = function (names) {
            var existRoles = this.roles ? this.roles.map(role => role._id || role) : [];
            return this.model(config.roleModel).find({ name: {$in: names} }).exec().then((roles) => {
                var addRoles = roles.filter(role => !existRoles.some(r => role._id.equals(r)));
                if (!addRoles.length) {
                    return this;
                }
                this.roles = this.roles.concat(addRoles);
                return this.save();
            });
        };
        schema.methods.detachRoles = function (names) {
            if (!Array.isArray(names)) {
                names = [names];
            }
            return this.populate({path: 'roles', select: 'name'}).execPopulate().then(function (user) {
                var roles = user.roles.map(p => p.name);
                var changed = false;
                names.forEach(name => {
                    var i = roles.indexOf(name);
                    if (i !== -1) {
                        user.roles.splice(i, 1);
                        changed = true;
                    }
                });
                if (changed) {
                    return user.save();
                }
                return user;
            });
        };
    }
};
