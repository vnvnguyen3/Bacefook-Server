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

const pageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    posts: [postSchema]
}, {
    timestamps: true
});

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;