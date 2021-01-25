const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const friendSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    school: {
        type: String,
        required: false,
    },
    work: {
        type: String,
        required: false
    },
    posts: [postSchema]
}, {
    timestamps: true
});

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;