## mongoose trust

a mongoose rbac component

## usage
```javascript
var trust = require('../src/index');
var mongoose = require('mongoose');
var user = mongoose.Schema({
    name: String
});
var models = trust();
user.plugin(models.plugin);
module.exports.User = mongoose.model('User', user);
module.exports.Permission = models.Permission;
module.exports.Role = models.Role;
```

