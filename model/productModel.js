var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var product = new Schema({
   name: String,
   detail: String,
   name: String,
   price: Number,
   location: {
      lat: Number,
      lng: Number
   },
   allotment: Number
}, { versionKey: false });

module.exports = mongoose.model('product', product); 