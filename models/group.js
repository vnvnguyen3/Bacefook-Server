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

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: false,
    },
    posts: [postSchema]
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;