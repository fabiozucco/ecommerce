const {Schema} = require('mongoose');
module.exports = new Schema({
    name: String,
    price: String,
    url: String,
    description: String,
});