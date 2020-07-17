//Creating Schema with Mongoose
const mongo = require('mongoose');
const lwcustSchema = mongo.Schema({
    _id: mongo.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    email: String,
    address: Array,
    orders: Array
});
module.exports = mongo.model('lwcust', lwcustSchema, 'lwcust');