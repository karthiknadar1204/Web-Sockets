const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String, 
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
