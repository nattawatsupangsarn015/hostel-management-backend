var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var booking = new Schema({
  dateTravel: String,
  userId: String,
  productId: String,
  amount: Number,
  price: Number
}, { versionKey: false });

module.exports = mongoose.model('booking', booking); 