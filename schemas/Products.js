const {Schema} = require('mongoose');

module.exports = new Schema({
    name: String,    
    price: Number,
    url: String,
    description: String,
    category: Schema.Types.ObjectId
});