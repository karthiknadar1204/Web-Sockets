const mongoose = require('mongoose');

// Room Schema to track room status and participants
const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,  // Change to String to match frontend input
        required: true,
        unique: true
    },
    hasAdvocate: {
        type: Boolean,
        default: false
    },
    participants: [{
        userId: String,
        username: String,
        role: {
            type: String,
            enum: ['advocate', 'client']
        }
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);
module.exports = { Room };
