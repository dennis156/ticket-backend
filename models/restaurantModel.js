const mongoose = require('mongoose');
const uuid = require('uuid');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
let stringId = ObjectId.toString();

const _idNew = uuid.v4();

const Restaurant = new Schema({
    id: ObjectId,
    address: Object,
    borough: String,
    cuisine: String,
    grades: Array,
    name: String,
    restaurant_id: String
});

var restaurantModel = mongoose.model('Restaurant', Restaurant);

module.exports = restaurantModel;