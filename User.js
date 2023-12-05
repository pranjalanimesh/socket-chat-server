const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    socketId: {
        type: String,
        required: true,
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    qrataid: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['talent', 'talent-partner', 'admin', 'client'], // Set of allowed values
        required: true,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
