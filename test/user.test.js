var assert = require('assert');
var connection = require('./connection');
var db = require('./db');
var Permission = db.Permission;
var Role = db.Role;
var User = db.Role;
var perms = [];
for (var i = 1; i < 11; i++) {
    perms.push({
        name: `perm${i}`,
        displayName: `权限${i}`
    });
}

describe('user test', function () {
    before(function() {
        return connection.open().then(function() {
            return Permission.create(perms);
        }).then(function () {
            return Permission.find().exec();
        }).then(function (perms) {
            return Role.create([
                {
                    name: 'role1',
                    displayName: 'role1',
                    permissions: [perms[0], perms[1]]
                },
                {
                    name: 'role2',
                    displayName: 'role2',
                    permissions: [perms[2]]
                },
                {
                    name: 'role3',
                    displayName: 'role3'
                }
            ]);
        });
    });
    after(function() {
        return Promise.all([db.Permission.remove({}), db.Role.remove({}), db.User.remove({})]).then(function() {
            return connection.close();
        });
    });
    it('user attach role', function () {
        var user;
        return db.User.create({
            name: 'user_attach'
        }).then(function (u) {
            user = u;
            return user.attachRole('role1');
        }).then(function () {
            assert.equal(user.roles.length, 1, 'attach have one role');
        }).then(function () {
            return user.detachRoles('role1');
        }).then(function () {
            assert.equal(user.roles.length, 0, 'detach role');
        });
    });
    it('user attach roles', function () {
        return db.User.create({
            name: 'user_attachs'
        }).then(function (user) {
            return user.attachRoles(['role1', 'role2']);
        }).then(function (user) {
            assert.equal(user.roles.length, 2, 'attach have two roles');
            return user;
        }).then(function (user) {
            return user.attachRoles(['role3', 'role2']);
        }).then(function (user) {
            assert.equal(user.roles.length, 3, 'need only 3 roles');
        });
    });
    it('user has roles', function () {
        var user;
        return db.User.create({
            name: 'user_has'
        }).then(function (u) {
            user = u;
            return user.attachRoles(['role1', 'role2']);
        }).then(function () {
            return user.hasRole('role1');
        }).then(function (has) {
            assert.ok(has, 'user should have role1');
        }).then(function () {
            return user.hasRole('role3');
        }).then(function (has) {
            assert.ok(!has, 'user should not have role3');
        });
    });
    it('user in role1', function () {
        var _user;
        return db.User.create({
            name: 'user_role1'
        }).then(function (user) {
            _user = user;
            return user.attachRole('role1');
        }).then(function (user) {
            return user.can([perms[0].name, perms[1].name]);
        }).then(function (can) {
            assert.ok(can, `role 1 should have permission ${perms[0].name}`);
        }).then(function () {
            return _user.can(perms[4].name);
        }).then(function (can) {
            assert.ok(!can, `role 1 should not have permission ${perms[4].name}`);
        });
    });
});
