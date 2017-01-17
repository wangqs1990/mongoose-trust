var assert = require('assert');
var connection = require('./connection');
var db = require('./db');
var Permission = db.Permission;
var Role = db.Role;
var perms = [];
for (var i = 1; i < 11; i++) {
    perms.push({
        name: `perm${i}`,
        displayName: `权限${i}`
    });
}

describe('role test', function () {
    before(function() {
        return connection.open().then(function() {
            return Permission.create(perms);
        });
    });
    after(function() {
        return Promise.all([db.Permission.remove({}), db.Role.remove({})]).then(function() {
            return connection.close();
        });
    });
    it('role add', function () {
        var role = new db.Role();
        role.name = 'channel.admin';
        role.displayName = '频道管理员';
        return role.save().then(function(role) {
            assert(role._id, 'role must have id');
            return role.attachPermission(perms[0].name);
        }).then(function() {
            return role.can(perms[0].name);
        }).then(function (can) {
            assert(can, `role can ${perms[0].name}`);
        });
    });
    it('role conflit', function () {
        var role = new db.Role();
        role.name = 'test2';
        role.displayName = '测试角色2';
        return role.save().then(function(role) {
            return role.attachPermission(perms[0].name);
        }).then(function() {
            return role.attachPermission(perms[0].name);
        }).then(function () {
            return role.perms();
        }).then(function (perms) {
            assert.equal(perms.length, 1, 'same permission name must only have one item');
        });
    });
    it('role multi permssion', function () {
        var role = new db.Role();
        role.name = 'test3';
        role.displayName = '测试角色3';
        return role.save().then(function(role) {
            return role.attachPermissions([perms[0].name, perms[1].name, perms[2].name]);
        }).then(function () {
            return role.perms();
        }).then(function (rolePerms) {
            assert.deepEqual(rolePerms, [perms[0].name, perms[1].name, perms[2].name] ,  'add tree perms');
        }).then(function () {
            return role.canAny([perms[3].name, perms[4].name]);
        }).then(function (can) {
            assert.ok(!can, `can not ${[perms[3].name, perms[4].name]}`);
        }).then(function () {
            return role.canAny([perms[1].name, perms[4].name]);
        }).then(function (can) {
            assert.ok(can, `can any ${[perms[1].name, perms[4].name]}`);
        });
    });
    it('detach permssion', function () {
        var role = new db.Role();
        role.name = 'test4';
        role.displayName = '测试角色4';
        return role.save().then(function(role) {
            return role.attachPermissions([perms[0].name, perms[1].name, perms[2].name]);
        }).then(function (role) {
            return role.detachPermissions(perms[0].name);
        }).then(function (role) {
            return role.perms();
        }).then(function (_perms) {
            assert.deepEqual(_perms, [perms[1].name, perms[2].name], 'after detach test4 only has 2 permissions');
        });
    });
});
