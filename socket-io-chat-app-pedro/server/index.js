const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
app.use(cors())
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected to ', socket.id);

    socket.on("join_room", (data) => {
        const { room, role } = data;
        socket.join(room);

        if (!rooms.has(room)) {
            rooms.set(room, { hasAdvocate: false });
        }

        const roomData = rooms.get(room);

        if (role === 'advocate') {
            if (roomData.hasAdvocate) {
                socket.emit('room_status', { hasAdvocate: true });
                return;
            }
            roomData.hasAdvocate = true;
        }

        socket.emit('room_status', { hasAdvocate: roomData.hasAdvocate });
        console.log(`User with id ${socket.id} joined the room ${room} as ${role}`);
    })

    socket.on('send_message', (data) => {
        console.log(data);
        socket.to(data.room).emit('receive_message', data);
        socket.emit('message_sent', data);
    })

    socket.on("disconnect", () => {
        console.log('User disconnected', socket.id);
    })
})

server.listen(3002, () => {
    console.log(`server is running on port 3002`);
})
