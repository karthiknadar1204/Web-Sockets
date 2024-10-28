const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String,
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
        required: false
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    fileUrl: {
        type: String,
        required: false
    },
    fileName: {
        type: String,
        required: false
    },
    fileType: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

messageSchema.index({ room: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
