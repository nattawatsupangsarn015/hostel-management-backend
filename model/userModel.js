var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
   username: String,
   password: String,
   name: String,
   lastName: String,
   birthDay: String,
   email: String
}, { versionKey: false });

module.exports = mongoose.model('user', user); 