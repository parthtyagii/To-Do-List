const mongoose = require('mongoose');
const TODO = require('./tasks');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username cannot be blank!"]
    },
    password: {
        type: String,
        required: [true, "Password is necessary!"]
    },
    work: [
        {
            todos: String
        }
    ]
})

const USER = new mongoose.model('User', userSchema);
module.exports = USER;