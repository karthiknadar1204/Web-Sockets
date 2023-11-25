const express = require('express');
const http = require('http');
const path=require('path')
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(express.static(path.resolve('./public')))
const io=new Server(server);

//socket.io
io.on('connection', (socket) => {
    socket.on('user-message',(message)=>{
        console.log('A new user message',message);
    })
  });

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./public/index.html'));
  });


server.listen(9000, () => {
    console.log('listening on *:9000');
  });
  


