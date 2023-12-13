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
    qrataid: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['talent', 'talent-partner', 'admin', 'customer'], // Set of allowed values
        required: true,
    },
    contacts: [{
        userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
        qrataid: String,
        name: String,
        email: String,
        conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
        },
    }],
    conversations:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
