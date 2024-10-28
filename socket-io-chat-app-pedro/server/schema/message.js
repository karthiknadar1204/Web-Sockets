const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String,  // Change to String since room IDs come as strings from the frontend
        required: true,
        ref: 'Room'
    },
    author: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['advocate', 'client'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: true
});

// Add index for better query performance
messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
