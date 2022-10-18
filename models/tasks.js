const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    todos: {
        type: String,
        required: [true, "You cannot add empty task!"]
    }
})

const TODO = new mongoose.model('Todo', todoSchema);
module.exports = TODO;