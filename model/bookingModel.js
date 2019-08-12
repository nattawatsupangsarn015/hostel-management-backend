var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var booking = new Schema({
  bookingNumber: String,
  dateTravel: String,
  userId: String,
  productId: String,
  amount: Number,
  price: Number,
  name: String,
  lastName: String,
  birthDay: String,
  email: String
}, { versionKey: false });

module.exports = mongoose.model('booking', booking); 