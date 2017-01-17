var assert = require('assert');
var connection = require('./connection');
var db = require('./db');
var Permission = db.Permission;
var perms = [];
for (var i = 1; i < 11; i++) {
    perms.push({
        name: `perm${i}`,
        displayName: `权限${i}`
    });
}

describe('permission test', function () {
    before(connection.open);
    after(function() {
        return db.Permission.remove({}).then(function() {
            return connection.close();
        }, connection.close);
    });
    it('permission add', function () {
        return Permission.create(perms).then(function() {
            return Permission.count({});
        }).then(function (count) {
            assert.equal(count, perms.length, `add ${perms.length} permission`);
        });
    });
})
