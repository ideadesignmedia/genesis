//Creating Schema with Mongoose
const mongo = require('mongoose');
const lwprodSchema = mongo.Schema({
    _id: mongo.Schema.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    description: String
});
module.exports = mongo.model('lwprod', lwprodSchema, 'lwprod');