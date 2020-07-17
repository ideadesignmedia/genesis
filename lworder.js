//Creating Schema with Mongoose
const mongo = require('mongoose');
const lworderSchema = mongo.Schema({
    _id: mongo.Schema.Types.ObjectId,
    customer: String,
    orderDate: String,
    orderItems: Array,
    paymentInfo: String,
    paymentAmount: Number,
    paid: Boolean,
    completed: Boolean
});
module.exports = mongo.model('lworder', lworderSchema, 'lworder');