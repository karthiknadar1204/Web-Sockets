const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { Message } = require('./schema/message');
const { Room } = require('./schema/room');
require('dotenv').config();
app.use(cors())
const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected to ', socket.id);

    socket.on("join_room", async (data) => {
        const { room, role, username } = data;
        socket.join(room);

        try {
            let roomDoc = await Room.findOne({ roomId: room });
            console.log('Found room:', roomDoc);

            if (!roomDoc) {
                roomDoc = await Room.create({
                    roomId: room,
                    hasAdvocate: role === 'advocate',
                    participants: [{
                        userId: socket.id,
                        username,
                        role
                    }]
                });
                console.log('Created new room:', roomDoc);
            } else {
                const hasActiveAdvocate = roomDoc.participants.some(p => p.role === 'advocate');
                
                if (role === 'advocate' && hasActiveAdvocate) {
                    socket.emit('room_status', { 
                        hasAdvocate: true,
                        error: "This room already has an advocate. Please join as a client." 
                    });
                    return;
                }
                
                if (role === 'advocate') {
                    roomDoc.hasAdvocate = true;
                }
                
                roomDoc.participants.push({
                    userId: socket.id,
                    username,
                    role
                });
                await roomDoc.save();
            }

            const messages = await Message.find({ room: room })
                .select('room author message time role status createdAt')
                .sort({ createdAt: 1 })
                .lean();
            
            console.log('Found messages for room:', room, messages);

            const formattedMessages = messages.map(msg => ({
                room: msg.room,
                author: msg.author,
                message: msg.message,
                time: msg.time,
                role: msg.role,
                status: msg.status
            }));

            socket.emit('previous_messages', formattedMessages);
            
            socket.emit('room_status', { 
                hasAdvocate: roomDoc.hasAdvocate,
                success: true 
            });
            
            socket.to(room).emit('user_joined', {
                username,
                role,
                message: `${username} has joined the room as ${role}`
            });

            console.log(`User ${username} with id ${socket.id} joined room ${room} as ${role}`);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Error joining room' });
        }
    })

    socket.on('send_message', async (data) => {
        try {
            const message = await Message.create({
                room: data.room.toString(),
                author: data.author,
                message: data.message,
                time: data.time,
                role: data.role,
                status: 'sent',
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileType: data.fileType
            });

            console.log('Saved message:', message);

            socket.to(data.room).emit('receive_message', message);
            socket.emit('message_sent', message);
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Error sending message' });
        }
    })

    socket.on("disconnect", async () => {
        try {
            const rooms = await Room.find({ 'participants.userId': socket.id });
            for (const room of rooms) {
                const participant = room.participants.find(p => p.userId === socket.id);
                if (participant?.role === 'advocate') {
                    room.hasAdvocate = false;
                }
                room.participants = room.participants.filter(p => p.userId !== socket.id);
                await room.save();
            }
            console.log('User disconnected', socket.id);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    })
})

server.listen(3002, () => {
    console.log(`server is running on port 3002`);
})


app.get('/api/room/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
