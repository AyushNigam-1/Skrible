const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    likes: {
        type: Number
    },
    followers: {
        type: mongoose.Schema.type.ObjectId,
        ref: "User"
    },
    scripts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Script',
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
